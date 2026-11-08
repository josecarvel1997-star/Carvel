-- Agenda real: horários de trabalho, clientes, agendamentos e agendamento público.
-- Depende de 202610270001_foundation.sql.

create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;

create type public.appointment_status as enum ('scheduled', 'confirmed', 'done', 'cancelled', 'no_show');

-- Chaves compostas para garantir que serviço/profissional/cliente pertencem à mesma barbearia do agendamento.
alter table public.services add constraint services_barbershop_id_id_key unique (barbershop_id, id);
alter table public.staff_profiles add constraint staff_profiles_barbershop_id_id_key unique (barbershop_id, id);

-- ---------------------------------------------------------------------------
-- Horários de trabalho
-- staff_id nulo = horário geral da barbearia. Se um profissional tiver qualquer linha própria,
-- o horário dele substitui o geral. Sem linhas gerais, vale barbershops.opening_hours.
-- weekday segue extract(dow): 0 = domingo ... 6 = sábado.
-- ---------------------------------------------------------------------------
create table public.working_hours (
 id uuid primary key default gen_random_uuid(),
 barbershop_id uuid not null references public.barbershops(id) on delete cascade,
 staff_id uuid,
 weekday smallint not null check (weekday between 0 and 6),
 start_time time not null,
 end_time time not null,
 created_at timestamptz not null default now(),
 check (end_time > start_time),
 foreign key (barbershop_id, staff_id) references public.staff_profiles(barbershop_id, id) on delete cascade
);
create index working_hours_shop_idx on public.working_hours(barbershop_id, staff_id, weekday);

-- ---------------------------------------------------------------------------
-- Clientes
-- phone guarda apenas dígitos (normalizado no servidor e nas funções).
-- ---------------------------------------------------------------------------
create table public.clients (
 id uuid primary key default gen_random_uuid(),
 barbershop_id uuid not null references public.barbershops(id) on delete cascade,
 name text not null check (length(trim(name)) between 2 and 100),
 phone text check (phone is null or phone ~ '^[0-9]{8,15}$'),
 email text check (email is null or (length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
 notes text not null default '' check (length(notes) <= 2000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (barbershop_id, phone),
 unique (barbershop_id, id)
);
create index clients_shop_name_idx on public.clients(barbershop_id, name);

-- ---------------------------------------------------------------------------
-- Agendamentos
-- ---------------------------------------------------------------------------
create table public.appointments (
 id uuid primary key default gen_random_uuid(),
 barbershop_id uuid not null references public.barbershops(id) on delete cascade,
 client_id uuid not null,
 service_id uuid not null,
 staff_id uuid not null,
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status public.appointment_status not null default 'scheduled',
 price numeric(10,2) not null default 0 check (price >= 0),
 notes text not null default '' check (length(notes) <= 2000),
 source text not null default 'panel' check (source in ('panel', 'public')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (ends_at > starts_at and ends_at <= starts_at + interval '12 hours'),
 foreign key (barbershop_id, client_id) references public.clients(barbershop_id, id),
 foreign key (barbershop_id, service_id) references public.services(barbershop_id, id),
 foreign key (barbershop_id, staff_id) references public.staff_profiles(barbershop_id, id),
 -- O mesmo profissional não pode ter dois atendimentos ativos sobrepostos.
 constraint appointments_no_overlap exclude using gist (
  staff_id with =,
  tstzrange(starts_at, ends_at, '[)') with &&
 ) where (status in ('scheduled', 'confirmed', 'done'))
);
create index appointments_shop_start_idx on public.appointments(barbershop_id, starts_at);
create index appointments_client_idx on public.appointments(client_id, starts_at desc);
create index appointments_staff_start_idx on public.appointments(staff_id, starts_at);

-- ---------------------------------------------------------------------------
-- RLS: somente membros da barbearia; anon não acessa tabelas diretamente.
-- ---------------------------------------------------------------------------
alter table public.working_hours enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
revoke all on table public.working_hours, public.clients, public.appointments from anon;

create policy "Members read working hours" on public.working_hours for select to authenticated using (public.is_barbershop_member(barbershop_id));
create policy "Owners managers create working hours" on public.working_hours for insert to authenticated with check (public.has_barbershop_role(barbershop_id, array['owner','manager']::public.member_role[]));
create policy "Owners managers update working hours" on public.working_hours for update to authenticated using (public.has_barbershop_role(barbershop_id, array['owner','manager']::public.member_role[])) with check (public.has_barbershop_role(barbershop_id, array['owner','manager']::public.member_role[]));
create policy "Owners managers delete working hours" on public.working_hours for delete to authenticated using (public.has_barbershop_role(barbershop_id, array['owner','manager']::public.member_role[]));

create policy "Members read clients" on public.clients for select to authenticated using (public.is_barbershop_member(barbershop_id));
create policy "Members create clients" on public.clients for insert to authenticated with check (public.is_barbershop_member(barbershop_id));
create policy "Members update clients" on public.clients for update to authenticated using (public.is_barbershop_member(barbershop_id)) with check (public.is_barbershop_member(barbershop_id));
create policy "Members delete clients" on public.clients for delete to authenticated using (public.is_barbershop_member(barbershop_id));

create policy "Members read appointments" on public.appointments for select to authenticated using (public.is_barbershop_member(barbershop_id));
create policy "Members create appointments" on public.appointments for insert to authenticated with check (public.is_barbershop_member(barbershop_id));
create policy "Members update appointments" on public.appointments for update to authenticated using (public.is_barbershop_member(barbershop_id)) with check (public.is_barbershop_member(barbershop_id));
create policy "Owners managers delete appointments" on public.appointments for delete to authenticated using (public.has_barbershop_role(barbershop_id, array['owner','manager']::public.member_role[]));

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end
$$;
create trigger clients_touch before update on public.clients for each row execute function public.touch_updated_at();
create trigger appointments_touch before update on public.appointments for each row execute function public.touch_updated_at();
revoke all on function public.touch_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Salvar horários de forma atômica (substitui o conjunto de um escopo: geral ou um profissional).
-- days: [{"weekday":1,"start":"09:00","end":"12:00"}, ...]
-- ---------------------------------------------------------------------------
create function public.save_working_hours(target_shop uuid, target_staff uuid, days jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare item jsonb;
begin
 if not public.has_barbershop_role(target_shop, array['owner','manager']::public.member_role[]) then raise exception 'Sem permissão para alterar horários'; end if;
 if jsonb_typeof(days) <> 'array' or jsonb_array_length(days) > 28 then raise exception 'Horários inválidos'; end if;
 if target_staff is not null and not exists (select 1 from public.staff_profiles sp where sp.id = target_staff and sp.barbershop_id = target_shop) then raise exception 'Profissional não encontrado'; end if;
 delete from public.working_hours w where w.barbershop_id = target_shop and w.staff_id is not distinct from target_staff;
 for item in select * from jsonb_array_elements(days) loop
  insert into public.working_hours(barbershop_id, staff_id, weekday, start_time, end_time)
  values (target_shop, target_staff, (item->>'weekday')::smallint, (item->>'start')::time, (item->>'end')::time);
 end loop;
end
$$;
revoke all on function public.save_working_hours(uuid, uuid, jsonb) from public, anon;
grant execute on function public.save_working_hours(uuid, uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Horário efetivo de um dia (interno; não exposto à API).
-- ---------------------------------------------------------------------------
create function public._effective_hours(p_shop uuid, p_staff uuid, p_weekday int)
returns table(o_start time, o_end time)
language plpgsql stable security definer set search_path = '' as $$
declare v_key text := (array['sun','mon','tue','wed','thu','fri','sat'])[p_weekday + 1];
begin
 if p_staff is not null and exists (select 1 from public.working_hours w where w.barbershop_id = p_shop and w.staff_id = p_staff) then
  return query select w.start_time, w.end_time from public.working_hours w
   where w.barbershop_id = p_shop and w.staff_id = p_staff and w.weekday = p_weekday order by w.start_time;
  return;
 end if;
 if exists (select 1 from public.working_hours w where w.barbershop_id = p_shop and w.staff_id is null) then
  return query select w.start_time, w.end_time from public.working_hours w
   where w.barbershop_id = p_shop and w.staff_id is null and w.weekday = p_weekday order by w.start_time;
  return;
 end if;
 return query
  select (b.opening_hours -> v_key ->> 'open')::time, (b.opening_hours -> v_key ->> 'close')::time
  from public.barbershops b
  where b.id = p_shop
   and b.opening_hours ? v_key
   and coalesce((b.opening_hours -> v_key ->> 'closed')::boolean, false) = false
   and (b.opening_hours -> v_key ->> 'close')::time > (b.opening_hours -> v_key ->> 'open')::time;
end
$$;
revoke all on function public._effective_hours(uuid, uuid, int) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Agendamento público (sem login). Somente estas funções ficam disponíveis ao anon.
-- ---------------------------------------------------------------------------
create function public.public_shop(p_slug text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_shop public.barbershops;
begin
 select * into v_shop from public.barbershops b where b.slug = lower(trim(p_slug)) and b.onboarding_step = 'complete';
 if not found then return null; end if;
 return jsonb_build_object(
  'name', v_shop.name,
  'slug', v_shop.slug,
  'phone', v_shop.phone,
  'address', v_shop.address,
  'timezone', v_shop.timezone,
  'services', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'duration_minutes', s.duration_minutes, 'price', s.price) order by s.name)
    from public.services s where s.barbershop_id = v_shop.id and s.active), '[]'::jsonb),
  'staff', coalesce((select jsonb_agg(jsonb_build_object('id', sp.id, 'display_name', sp.display_name) order by sp.display_name)
    from public.staff_profiles sp where sp.barbershop_id = v_shop.id and sp.active and sp.role <> 'receptionist'), '[]'::jsonb),
  'hours', coalesce((select jsonb_agg(jsonb_build_object('weekday', d.wd, 'start', to_char(h.o_start, 'HH24:MI'), 'end', to_char(h.o_end, 'HH24:MI')) order by d.wd, h.o_start)
    from generate_series(0, 6) as d(wd) cross join lateral public._effective_hours(v_shop.id, null, d.wd) h), '[]'::jsonb)
 );
end
$$;

create function public.public_available_slots(p_slug text, p_service_id uuid, p_staff_id uuid, p_day date)
returns table(slot_start timestamptz, slot_label text, slot_staff_id uuid, slot_staff_name text)
language plpgsql stable security definer set search_path = '' as $$
declare
 v_shop public.barbershops;
 v_duration interval;
 v_today date;
 v_step interval := interval '30 minutes';
begin
 select * into v_shop from public.barbershops b where b.slug = lower(trim(p_slug)) and b.onboarding_step = 'complete';
 if not found then raise exception 'Barbearia não encontrada'; end if;
 select make_interval(mins => s.duration_minutes) into v_duration from public.services s
  where s.id = p_service_id and s.barbershop_id = v_shop.id and s.active;
 if v_duration is null then raise exception 'Serviço indisponível'; end if;
 v_today := (now() at time zone v_shop.timezone)::date;
 if p_day is null or p_day < v_today or p_day > v_today + 60 then return; end if;

 return query
 with team as (
  select sp.id, sp.display_name from public.staff_profiles sp
  where sp.barbershop_id = v_shop.id and sp.active and sp.role <> 'receptionist'
   and (p_staff_id is null or sp.id = p_staff_id)
 ), intervals as (
  select t.id as sid, t.display_name as sname, h.o_start, h.o_end
  from team t cross join lateral public._effective_hours(v_shop.id, t.id, extract(dow from p_day)::int) h
 ), candidates as (
  select i.sid, i.sname, (g.local_start at time zone v_shop.timezone) as cs
  from intervals i
  cross join lateral generate_series(p_day + i.o_start, p_day + i.o_end - v_duration, v_step) as g(local_start)
 ), free as (
  select c.sid, c.sname, c.cs from candidates c
  where c.cs > now()
   and not exists (
    select 1 from public.appointments a
    where a.staff_id = c.sid
     and a.status in ('scheduled', 'confirmed', 'done')
     and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(c.cs, c.cs + v_duration, '[)')
   )
 )
 select distinct on (f.cs) f.cs, to_char(f.cs at time zone v_shop.timezone, 'HH24:MI'), f.sid, f.sname
 from free f
 order by f.cs, f.sname;
end
$$;

create function public.public_book(p_slug text, p_service_id uuid, p_staff_id uuid, p_starts_at timestamptz, p_client_name text, p_client_phone text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
 v_shop public.barbershops;
 v_service public.services;
 v_staff uuid;
 v_staff_name text;
 v_name text := btrim(coalesce(p_client_name, ''));
 v_phone text := regexp_replace(coalesce(p_client_phone, ''), '[^0-9]', '', 'g');
 v_client uuid;
 v_appointment uuid;
begin
 if length(v_name) < 2 or length(v_name) > 100 then raise exception 'Informe seu nome completo.'; end if;
 if length(v_phone) < 10 or length(v_phone) > 13 then raise exception 'Informe um telefone válido com DDD.'; end if;
 select * into v_shop from public.barbershops b where b.slug = lower(trim(p_slug)) and b.onboarding_step = 'complete';
 if not found then raise exception 'Barbearia não encontrada'; end if;
 select * into v_service from public.services s where s.id = p_service_id and s.barbershop_id = v_shop.id and s.active;
 if not found then raise exception 'Serviço indisponível'; end if;

 select s.slot_staff_id, s.slot_staff_name into v_staff, v_staff_name
 from public.public_available_slots(p_slug, p_service_id, p_staff_id, (p_starts_at at time zone v_shop.timezone)::date) s
 where s.slot_start = p_starts_at
 limit 1;
 if v_staff is null then raise exception 'Este horário não está mais disponível. Escolha outro.'; end if;

 insert into public.clients(barbershop_id, name, phone) values (v_shop.id, v_name, v_phone)
 on conflict (barbershop_id, phone) do update set updated_at = now()
 returning id into v_client;

 -- Limite simples contra abuso: no máximo 3 agendamentos públicos futuros ativos por telefone.
 if (select count(*) from public.appointments a where a.client_id = v_client and a.source = 'public'
     and a.status in ('scheduled', 'confirmed') and a.starts_at > now()) >= 3 then
  raise exception 'Você já tem agendamentos em aberto. Fale com a barbearia para marcar outro.';
 end if;

 begin
  insert into public.appointments(barbershop_id, client_id, service_id, staff_id, starts_at, ends_at, status, price, source)
  values (v_shop.id, v_client, v_service.id, v_staff, p_starts_at, p_starts_at + make_interval(mins => v_service.duration_minutes), 'scheduled', v_service.price, 'public')
  returning id into v_appointment;
 exception when exclusion_violation then
  raise exception 'Este horário não está mais disponível. Escolha outro.';
 end;

 return jsonb_build_object(
  'id', v_appointment,
  'starts_at', p_starts_at,
  'timezone', v_shop.timezone,
  'shop', v_shop.name,
  'service', v_service.name,
  'price', v_service.price,
  'duration_minutes', v_service.duration_minutes,
  'staff', v_staff_name
 );
end
$$;

revoke all on function public.public_shop(text) from public;
revoke all on function public.public_available_slots(text, uuid, uuid, date) from public;
revoke all on function public.public_book(text, uuid, uuid, timestamptz, text, text) from public;
grant execute on function public.public_shop(text) to anon, authenticated;
grant execute on function public.public_available_slots(text, uuid, uuid, date) to anon, authenticated;
grant execute on function public.public_book(text, uuid, uuid, timestamptz, text, text) to anon, authenticated;
