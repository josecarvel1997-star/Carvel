-- =============================================================================
-- 202611080002_service_order_staff_ops.sql
--
-- Migration ADITIVA e idempotente (só cria funções novas; não altera nem remove
-- nada que já existe no banco ao vivo).
--
-- Por que existe: no banco ao vivo, `service_orders` e `service_order_items`
-- só têm política de SELECT para usuários logados. Comandas só nascem dentro de
-- create_public_booking/create_internal_booking e itens só entram pelo token do
-- cliente (add_public_order_item). Sem estas funções a equipe não consegue:
--   * abrir comanda para agendamentos criados por create_admin_appointment
--     (ex.: agendamentos feitos por barbeiros) ou antigos;
--   * lançar/remover produtos numa comanda pelo painel;
--   * gerar alertas sob demanda (refresh_smart_alerts exige service_role).
--
-- Todas as funções validam o papel do usuário em barbershop_members via
-- public.has_barbershop_role, usam search_path vazio e são executáveis apenas
-- por `authenticated`.
-- =============================================================================

-- Abre (ou devolve) a comanda de um agendamento ativo.
create or replace function public.open_service_order(target_appointment uuid)
returns public.service_orders
language plpgsql
security definer
set search_path to ''
as $function$
declare appt public.appointments%rowtype; order_row public.service_orders%rowtype;
begin
  if auth.uid() is null then raise exception 'Sessão inválida'; end if;
  select * into appt from public.appointments where id = target_appointment;
  if not found or not public.has_barbershop_role(appt.barbershop_id, array['owner','manager','receptionist']::public.member_role[]) then
    raise exception 'Agendamento não encontrado ou acesso negado';
  end if;
  select * into order_row from public.service_orders where appointment_id = target_appointment;
  if found then return order_row; end if;
  if appt.status not in ('requested','scheduled','confirmed','in_progress') then
    raise exception 'Este agendamento já foi finalizado';
  end if;
  insert into public.service_orders(barbershop_id, appointment_id)
  values (appt.barbershop_id, appt.id)
  on conflict (appointment_id) do nothing
  returning * into order_row;
  if order_row.id is null then
    select * into order_row from public.service_orders where appointment_id = target_appointment;
  end if;
  return order_row;
end
$function$;

-- Lança um produto numa comanda aberta, reservando o estoque (mesma regra de add_public_order_item).
create or replace function public.add_service_order_item(target_order uuid, target_product uuid, target_quantity numeric)
returns public.service_order_items
language plpgsql
security definer
set search_path to ''
as $function$
declare order_row public.service_orders%rowtype; product_row public.products%rowtype; item_row public.service_order_items%rowtype;
begin
  if auth.uid() is null then raise exception 'Sessão inválida'; end if;
  if target_quantity is null or target_quantity <> trunc(target_quantity) or target_quantity < 1 or target_quantity > 50 then
    raise exception 'Quantidade inválida';
  end if;
  select * into order_row from public.service_orders where id = target_order for update;
  if not found or not public.has_barbershop_role(order_row.barbershop_id, array['owner','manager','receptionist']::public.member_role[]) then
    raise exception 'Comanda não encontrada ou acesso negado';
  end if;
  if order_row.status <> 'open' then raise exception 'Esta comanda não está aberta'; end if;
  select * into product_row from public.products
  where id = target_product and barbershop_id = order_row.barbershop_id and active
    and quantity - reserved_quantity >= target_quantity
  for update;
  if not found then raise exception 'Produto indisponível ou sem estoque suficiente'; end if;
  update public.products set reserved_quantity = reserved_quantity + target_quantity, updated_at = now() where id = target_product;
  insert into public.service_order_items(order_id, barbershop_id, product_id, product_name, quantity, unit_price)
  values (order_row.id, order_row.barbershop_id, target_product, product_row.name, target_quantity, product_row.unit_price)
  on conflict (order_id, product_id) do update set quantity = public.service_order_items.quantity + excluded.quantity
  returning * into item_row;
  return item_row;
end
$function$;

-- Remove um item de uma comanda aberta e libera a reserva de estoque.
create or replace function public.remove_service_order_item(target_item uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare item_row public.service_order_items%rowtype; order_status text;
begin
  if auth.uid() is null then raise exception 'Sessão inválida'; end if;
  select * into item_row from public.service_order_items where id = target_item for update;
  if not found or not public.has_barbershop_role(item_row.barbershop_id, array['owner','manager','receptionist']::public.member_role[]) then
    raise exception 'Item não encontrado ou acesso negado';
  end if;
  select status into order_status from public.service_orders where id = item_row.order_id for update;
  if order_status is distinct from 'open' then raise exception 'Esta comanda não está aberta'; end if;
  if item_row.product_id is not null then
    update public.products set reserved_quantity = greatest(0, reserved_quantity - item_row.quantity), updated_at = now()
    where id = item_row.product_id;
  end if;
  delete from public.service_order_items where id = target_item;
end
$function$;

-- Versão por negócio de refresh_smart_alerts (mesmas regras de estoque mínimo e
-- retorno de clientes), para o proprietário/gerente atualizar a central sob demanda.
create or replace function public.refresh_shop_alerts(target_shop uuid)
returns integer
language plpgsql
security definer
set search_path to ''
as $function$
declare changed integer := 0; affected integer := 0;
begin
  if auth.uid() is null or not public.has_barbershop_role(target_shop, array['owner','manager']::public.member_role[]) then
    raise exception 'Acesso negado';
  end if;
  insert into public.central_alerts(barbershop_id,alert_type,dedupe_key,title,summary,severity,product_id,metadata,last_detected_at,updated_at)
  select p.barbershop_id,'inventory_low','inventory_low:'||p.id,'Produto no nível mínimo de estoque',
    p.name||' está com '||(p.quantity-p.reserved_quantity)||' unidade(s); mínimo definido: '||p.minimum_quantity||'.','warning',p.id,
    jsonb_build_object('productName',p.name,'quantity',p.quantity-p.reserved_quantity,'minimumQuantity',p.minimum_quantity),now(),now()
  from public.products p
  where p.barbershop_id = target_shop and p.active and p.quantity-p.reserved_quantity <= p.minimum_quantity
  on conflict (barbershop_id,dedupe_key) do update set title=excluded.title,summary=excluded.summary,metadata=excluded.metadata,
    last_detected_at=now(),updated_at=now(),status=case when central_alerts.status='dismissed' then 'dismissed' else 'open' end;
  get diagnostics changed = row_count; affected := affected + changed;

  with gaps as (
    select a.client_id, a.starts_at, lag(a.starts_at) over (partition by a.client_id order by a.starts_at) previous_at
    from public.appointments a where a.barbershop_id = target_shop and a.status = 'completed'
  ), averages as (
    select client_id, max(starts_at) last_at, avg(extract(epoch from (starts_at-previous_at))/86400.0) average_days
    from gaps group by client_id having count(previous_at) >= 2
  ), due as (
    select av.*, c.full_name, c.phone, c.whatsapp_opt_in, round(extract(epoch from (now()-av.last_at))/86400)::integer days_since
    from averages av join public.clients c on c.id = av.client_id and c.barbershop_id = target_shop
    where av.average_days > 0 and now() > av.last_at + make_interval(secs => (av.average_days*1.2*86400)::double precision)
  )
  insert into public.central_alerts(barbershop_id,alert_type,dedupe_key,title,summary,severity,client_id,metadata,last_detected_at,updated_at)
  select target_shop,'client_return','client_return:'||d.client_id,'Cliente pode estar na hora de voltar',
    d.full_name||' está há '||d.days_since||' dias sem atendimento.','info',d.client_id,
    jsonb_build_object('phone',d.phone,'whatsappOptIn',d.whatsapp_opt_in,'daysSinceVisit',d.days_since,'averageGapDays',round(d.average_days)),now(),now()
  from due d
  on conflict (barbershop_id,dedupe_key) do update set title=excluded.title,summary=excluded.summary,metadata=excluded.metadata,
    last_detected_at=now(),updated_at=now(),status=case when central_alerts.status='dismissed' then 'dismissed' else 'open' end;
  get diagnostics changed = row_count; affected := affected + changed;
  return affected;
end
$function$;

revoke all on function public.open_service_order(uuid) from public, anon;
revoke all on function public.add_service_order_item(uuid, uuid, numeric) from public, anon;
revoke all on function public.remove_service_order_item(uuid) from public, anon;
revoke all on function public.refresh_shop_alerts(uuid) from public, anon;
grant execute on function public.open_service_order(uuid) to authenticated;
grant execute on function public.add_service_order_item(uuid, uuid, numeric) to authenticated;
grant execute on function public.remove_service_order_item(uuid) to authenticated;
grant execute on function public.refresh_shop_alerts(uuid) to authenticated;
