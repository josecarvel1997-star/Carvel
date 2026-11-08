-- =============================================================================
-- 202611080000_live_schema_snapshot.sql
--
-- FOTOGRAFIA (BASELINE) DO SCHEMA AO VIVO DO SUPABASE  (projeto zsittjmnkjtqpgvrhskb)
--
--   >>> ESTE ARQUIVO É SÓ DOCUMENTAÇÃO / BASELINE. NÃO APLIQUE EM PRODUÇÃO. <<<
--
-- O banco de produção já contém tudo o que está aqui. O arquivo foi gerado a
-- partir de uma leitura do catálogo (colunas, constraints, funções, políticas
-- RLS, enums, triggers, índices e grants de EXECUTE para anon/authenticated) e
-- serve para: (1) documentar o schema real usado pelo app; (2) recriar um banco
-- local/de testes equivalente (`supabase db reset`).
--
-- Para não quebrar quem já rodou 202610270001_foundation.sql, tudo é escrito
-- de forma idempotente (IF NOT EXISTS / blocos DO / CREATE OR REPLACE /
-- DROP ... IF EXISTS antes de políticas e triggers).
--
-- Limitações conhecidas da fotografia:
--   * Precisão/escala de colunas numeric não foi capturada (aparecem como numeric).
--   * Grants de tabela e privilégios de EXECUTE concedidos a PUBLIC não foram
--     capturados; só os grants explícitos de EXECUTE para anon/authenticated.
--   * O event trigger que usa public.rls_auto_enable() não foi capturado (só a função).
--   * A sobrecarga antiga bootstrap_barbershop(7 args) da foundation NÃO existe
--     no banco ao vivo (lá existem as versões de 8 e 9 argumentos).
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'member_role') then
    create type public.member_role as enum ('owner', 'manager', 'barber', 'receptionist');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'onboarding_step') then
    create type public.onboarding_step as enum ('barbershop', 'services', 'team', 'complete');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Tabelas (colunas). As tabelas da foundation recebem as colunas novas via
-- ADD COLUMN IF NOT EXISTS.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid not null,
  full_name text not null default ''::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists id uuid not null;
alter table public.profiles add column if not exists full_name text not null default ''::text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.barbershops (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null,
  phone text not null default ''::text,
  address text not null default ''::text,
  timezone text not null default 'America/Sao_Paulo'::text,
  opening_hours jsonb not null default '{"fri": {"open": "09:00", "close": "19:00", "closed": false}, "mon": {"open": "09:00", "close": "19:00", "closed": false}, "sat": {"open": "09:00", "close": "17:00", "closed": false}, "sun": {"open": "09:00", "close": "17:00", "closed": true}, "thu": {"open": "09:00", "close": "19:00", "closed": false}, "tue": {"open": "09:00", "close": "19:00", "closed": false}, "wed": {"open": "09:00", "close": "19:00", "closed": false}}'::jsonb,
  onboarding_step public.onboarding_step not null default 'barbershop'::onboarding_step,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_type text not null default 'beauty'::text,
  check_in_time time not null default '15:00:00'::time without time zone,
  check_out_time time not null default '11:00:00'::time without time zone,
  active_modules text[] not null default ARRAY['agenda'::text, 'clientes'::text, 'equipe'::text, 'caixa_pdv'::text],
  cnpj text,
  theme_preference text not null default 'light'::text
);
alter table public.barbershops add column if not exists id uuid not null default gen_random_uuid();
alter table public.barbershops add column if not exists name text not null;
alter table public.barbershops add column if not exists slug text not null;
alter table public.barbershops add column if not exists phone text not null default ''::text;
alter table public.barbershops add column if not exists address text not null default ''::text;
alter table public.barbershops add column if not exists timezone text not null default 'America/Sao_Paulo'::text;
alter table public.barbershops add column if not exists opening_hours jsonb not null default '{"fri": {"open": "09:00", "close": "19:00", "closed": false}, "mon": {"open": "09:00", "close": "19:00", "closed": false}, "sat": {"open": "09:00", "close": "17:00", "closed": false}, "sun": {"open": "09:00", "close": "17:00", "closed": true}, "thu": {"open": "09:00", "close": "19:00", "closed": false}, "tue": {"open": "09:00", "close": "19:00", "closed": false}, "wed": {"open": "09:00", "close": "19:00", "closed": false}}'::jsonb;
alter table public.barbershops add column if not exists onboarding_step public.onboarding_step not null default 'barbershop'::onboarding_step;
alter table public.barbershops add column if not exists created_at timestamptz not null default now();
alter table public.barbershops add column if not exists updated_at timestamptz not null default now();
alter table public.barbershops add column if not exists business_type text not null default 'beauty'::text;
alter table public.barbershops add column if not exists check_in_time time not null default '15:00:00'::time without time zone;
alter table public.barbershops add column if not exists check_out_time time not null default '11:00:00'::time without time zone;
alter table public.barbershops add column if not exists active_modules text[] not null default ARRAY['agenda'::text, 'clientes'::text, 'equipe'::text, 'caixa_pdv'::text];
alter table public.barbershops add column if not exists cnpj text;
alter table public.barbershops add column if not exists theme_preference text not null default 'light'::text;

create table if not exists public.barbershop_members (
  barbershop_id uuid not null,
  user_id uuid not null,
  role public.member_role not null,
  created_at timestamptz not null default now()
);
alter table public.barbershop_members add column if not exists barbershop_id uuid not null;
alter table public.barbershop_members add column if not exists user_id uuid not null;
alter table public.barbershop_members add column if not exists role public.member_role not null;
alter table public.barbershop_members add column if not exists created_at timestamptz not null default now();

create table if not exists public.services (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  name text not null,
  duration_minutes integer not null,
  price numeric not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  booking_unit text not null default 'minutes'::text,
  min_duration_minutes integer not null default 5,
  max_duration_minutes integer not null default 480,
  requires_resource boolean not null default false,
  requires_professional boolean not null default true,
  category text not null default ''::text
);
alter table public.services add column if not exists id uuid not null default gen_random_uuid();
alter table public.services add column if not exists barbershop_id uuid not null;
alter table public.services add column if not exists name text not null;
alter table public.services add column if not exists duration_minutes integer not null;
alter table public.services add column if not exists price numeric not null;
alter table public.services add column if not exists active boolean not null default true;
alter table public.services add column if not exists created_at timestamptz not null default now();
alter table public.services add column if not exists booking_unit text not null default 'minutes'::text;
alter table public.services add column if not exists min_duration_minutes integer not null default 5;
alter table public.services add column if not exists max_duration_minutes integer not null default 480;
alter table public.services add column if not exists requires_resource boolean not null default false;
alter table public.services add column if not exists requires_professional boolean not null default true;
alter table public.services add column if not exists category text not null default ''::text;

create table if not exists public.staff_profiles (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  user_id uuid,
  display_name text not null,
  role public.member_role not null default 'barber'::member_role,
  commission_rate numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  product_commission_rate numeric not null default 0
);
alter table public.staff_profiles add column if not exists id uuid not null default gen_random_uuid();
alter table public.staff_profiles add column if not exists barbershop_id uuid not null;
alter table public.staff_profiles add column if not exists user_id uuid;
alter table public.staff_profiles add column if not exists display_name text not null;
alter table public.staff_profiles add column if not exists role public.member_role not null default 'barber'::member_role;
alter table public.staff_profiles add column if not exists commission_rate numeric not null default 0;
alter table public.staff_profiles add column if not exists active boolean not null default true;
alter table public.staff_profiles add column if not exists created_at timestamptz not null default now();
alter table public.staff_profiles add column if not exists product_commission_rate numeric not null default 0;

create table if not exists public.booking_resources (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  name text not null,
  kind text not null default 'space'::text,
  capacity integer not null default 1,
  allow_parallel_bookings boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.booking_resources add column if not exists id uuid not null default gen_random_uuid();
alter table public.booking_resources add column if not exists barbershop_id uuid not null;
alter table public.booking_resources add column if not exists name text not null;
alter table public.booking_resources add column if not exists kind text not null default 'space'::text;
alter table public.booking_resources add column if not exists capacity integer not null default 1;
alter table public.booking_resources add column if not exists allow_parallel_bookings boolean not null default false;
alter table public.booking_resources add column if not exists active boolean not null default true;
alter table public.booking_resources add column if not exists created_at timestamptz not null default now();
alter table public.booking_resources add column if not exists updated_at timestamptz not null default now();

create table if not exists public.clients (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  name text not null,
  phone text not null,
  phone_normalized text,
  email text not null default ''::text,
  notes text not null default ''::text,
  whatsapp_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null default ''::text,
  whatsapp_opt_in boolean not null default false,
  booking_count integer not null default 0,
  completed_visits integer not null default 0,
  last_booked_at timestamptz,
  last_completed_at timestamptz,
  preferred_service_id uuid,
  preferred_staff_profile_id uuid
);
alter table public.clients add column if not exists id uuid not null default gen_random_uuid();
alter table public.clients add column if not exists barbershop_id uuid not null;
alter table public.clients add column if not exists name text not null;
alter table public.clients add column if not exists phone text not null;
alter table public.clients add column if not exists phone_normalized text;
alter table public.clients add column if not exists email text not null default ''::text;
alter table public.clients add column if not exists notes text not null default ''::text;
alter table public.clients add column if not exists whatsapp_consent boolean not null default false;
alter table public.clients add column if not exists created_at timestamptz not null default now();
alter table public.clients add column if not exists updated_at timestamptz not null default now();
alter table public.clients add column if not exists full_name text not null default ''::text;
alter table public.clients add column if not exists whatsapp_opt_in boolean not null default false;
alter table public.clients add column if not exists booking_count integer not null default 0;
alter table public.clients add column if not exists completed_visits integer not null default 0;
alter table public.clients add column if not exists last_booked_at timestamptz;
alter table public.clients add column if not exists last_completed_at timestamptz;
alter table public.clients add column if not exists preferred_service_id uuid;
alter table public.clients add column if not exists preferred_staff_profile_id uuid;

create table if not exists public.appointments (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  client_id uuid not null,
  service_id uuid not null,
  staff_profile_id uuid,
  starts_at timestamptz not null,
  duration_minutes integer not null,
  price numeric not null,
  status text not null default 'scheduled'::text,
  source text not null default 'admin'::text,
  notes text not null default ''::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resource_id uuid,
  party_size integer not null default 1,
  ends_at timestamptz not null,
  customer_token_hash text
);
alter table public.appointments add column if not exists id uuid not null default gen_random_uuid();
alter table public.appointments add column if not exists barbershop_id uuid not null;
alter table public.appointments add column if not exists client_id uuid not null;
alter table public.appointments add column if not exists service_id uuid not null;
alter table public.appointments add column if not exists staff_profile_id uuid;
alter table public.appointments add column if not exists starts_at timestamptz not null;
alter table public.appointments add column if not exists duration_minutes integer not null;
alter table public.appointments add column if not exists price numeric not null;
alter table public.appointments add column if not exists status text not null default 'scheduled'::text;
alter table public.appointments add column if not exists source text not null default 'admin'::text;
alter table public.appointments add column if not exists notes text not null default ''::text;
alter table public.appointments add column if not exists created_at timestamptz not null default now();
alter table public.appointments add column if not exists updated_at timestamptz not null default now();
alter table public.appointments add column if not exists resource_id uuid;
alter table public.appointments add column if not exists party_size integer not null default 1;
alter table public.appointments add column if not exists ends_at timestamptz not null;
alter table public.appointments add column if not exists customer_token_hash text;

create table if not exists public.products (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  name text not null,
  category text not null default ''::text,
  sku text not null default ''::text,
  price numeric not null default 0,
  stock_quantity integer not null default 0,
  minimum_quantity integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  quantity numeric not null default 0,
  reserved_quantity numeric not null default 0,
  unit_price numeric not null default 0,
  available_to_customer boolean not null default false
);
alter table public.products add column if not exists id uuid not null default gen_random_uuid();
alter table public.products add column if not exists barbershop_id uuid not null;
alter table public.products add column if not exists name text not null;
alter table public.products add column if not exists category text not null default ''::text;
alter table public.products add column if not exists sku text not null default ''::text;
alter table public.products add column if not exists price numeric not null default 0;
alter table public.products add column if not exists stock_quantity integer not null default 0;
alter table public.products add column if not exists minimum_quantity integer not null default 0;
alter table public.products add column if not exists active boolean not null default true;
alter table public.products add column if not exists created_at timestamptz not null default now();
alter table public.products add column if not exists updated_at timestamptz not null default now();
alter table public.products add column if not exists quantity numeric not null default 0;
alter table public.products add column if not exists reserved_quantity numeric not null default 0;
alter table public.products add column if not exists unit_price numeric not null default 0;
alter table public.products add column if not exists available_to_customer boolean not null default false;

create table if not exists public.cash_sessions (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  opened_by uuid not null,
  opening_amount numeric not null default 0,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  closing_amount numeric
);
alter table public.cash_sessions add column if not exists id uuid not null default gen_random_uuid();
alter table public.cash_sessions add column if not exists barbershop_id uuid not null;
alter table public.cash_sessions add column if not exists opened_by uuid not null;
alter table public.cash_sessions add column if not exists opening_amount numeric not null default 0;
alter table public.cash_sessions add column if not exists opened_at timestamptz not null default now();
alter table public.cash_sessions add column if not exists closed_at timestamptz;
alter table public.cash_sessions add column if not exists closing_amount numeric;

create table if not exists public.service_orders (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  appointment_id uuid not null,
  status text not null default 'open'::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.service_orders add column if not exists id uuid not null default gen_random_uuid();
alter table public.service_orders add column if not exists barbershop_id uuid not null;
alter table public.service_orders add column if not exists appointment_id uuid not null;
alter table public.service_orders add column if not exists status text not null default 'open'::text;
alter table public.service_orders add column if not exists created_at timestamptz not null default now();
alter table public.service_orders add column if not exists updated_at timestamptz not null default now();

create table if not exists public.service_order_items (
  id uuid not null default gen_random_uuid(),
  order_id uuid not null,
  barbershop_id uuid not null,
  product_id uuid,
  product_name text not null,
  quantity numeric not null,
  unit_price numeric not null,
  created_at timestamptz not null default now()
);
alter table public.service_order_items add column if not exists id uuid not null default gen_random_uuid();
alter table public.service_order_items add column if not exists order_id uuid not null;
alter table public.service_order_items add column if not exists barbershop_id uuid not null;
alter table public.service_order_items add column if not exists product_id uuid;
alter table public.service_order_items add column if not exists product_name text not null;
alter table public.service_order_items add column if not exists quantity numeric not null;
alter table public.service_order_items add column if not exists unit_price numeric not null;
alter table public.service_order_items add column if not exists created_at timestamptz not null default now();

create table if not exists public.sales (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  client_id uuid,
  appointment_id uuid,
  session_id uuid,
  created_by uuid not null,
  subtotal numeric not null,
  discount numeric not null default 0,
  total numeric not null,
  payment_method text not null,
  status text not null default 'paid'::text,
  created_at timestamptz not null default now(),
  total_amount numeric not null default 0,
  service_order_id uuid,
  service_amount numeric not null default 0,
  product_amount numeric not null default 0,
  processing_fee numeric not null default 0,
  retained_amount numeric not null default 0
);
alter table public.sales add column if not exists id uuid not null default gen_random_uuid();
alter table public.sales add column if not exists barbershop_id uuid not null;
alter table public.sales add column if not exists client_id uuid;
alter table public.sales add column if not exists appointment_id uuid;
alter table public.sales add column if not exists session_id uuid;
alter table public.sales add column if not exists created_by uuid not null;
alter table public.sales add column if not exists subtotal numeric not null;
alter table public.sales add column if not exists discount numeric not null default 0;
alter table public.sales add column if not exists total numeric not null;
alter table public.sales add column if not exists payment_method text not null;
alter table public.sales add column if not exists status text not null default 'paid'::text;
alter table public.sales add column if not exists created_at timestamptz not null default now();
alter table public.sales add column if not exists total_amount numeric not null default 0;
alter table public.sales add column if not exists service_order_id uuid;
alter table public.sales add column if not exists service_amount numeric not null default 0;
alter table public.sales add column if not exists product_amount numeric not null default 0;
alter table public.sales add column if not exists processing_fee numeric not null default 0;
alter table public.sales add column if not exists retained_amount numeric not null default 0;

create table if not exists public.sale_items (
  id uuid not null default gen_random_uuid(),
  sale_id uuid not null,
  product_id uuid,
  service_id uuid,
  item_name text not null,
  quantity integer not null,
  unit_price numeric not null,
  total numeric not null,
  product_name text,
  barbershop_id uuid
);
alter table public.sale_items add column if not exists id uuid not null default gen_random_uuid();
alter table public.sale_items add column if not exists sale_id uuid not null;
alter table public.sale_items add column if not exists product_id uuid;
alter table public.sale_items add column if not exists service_id uuid;
alter table public.sale_items add column if not exists item_name text not null;
alter table public.sale_items add column if not exists quantity integer not null;
alter table public.sale_items add column if not exists unit_price numeric not null;
alter table public.sale_items add column if not exists total numeric not null;
alter table public.sale_items add column if not exists product_name text;
alter table public.sale_items add column if not exists barbershop_id uuid;

create table if not exists public.cash_movements (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  kind text not null,
  source text not null default 'manual'::text,
  description text not null,
  amount numeric not null,
  payment_method text,
  sale_id uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);
alter table public.cash_movements add column if not exists id uuid not null default gen_random_uuid();
alter table public.cash_movements add column if not exists barbershop_id uuid not null;
alter table public.cash_movements add column if not exists kind text not null;
alter table public.cash_movements add column if not exists source text not null default 'manual'::text;
alter table public.cash_movements add column if not exists description text not null;
alter table public.cash_movements add column if not exists amount numeric not null;
alter table public.cash_movements add column if not exists payment_method text;
alter table public.cash_movements add column if not exists sale_id uuid;
alter table public.cash_movements add column if not exists created_by uuid;
alter table public.cash_movements add column if not exists created_at timestamptz not null default now();

create table if not exists public.cash_transactions (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  session_id uuid,
  created_by uuid not null,
  direction text not null,
  description text not null,
  amount numeric not null,
  payment_method text not null default 'other'::text,
  appointment_id uuid,
  created_at timestamptz not null default now()
);
alter table public.cash_transactions add column if not exists id uuid not null default gen_random_uuid();
alter table public.cash_transactions add column if not exists barbershop_id uuid not null;
alter table public.cash_transactions add column if not exists session_id uuid;
alter table public.cash_transactions add column if not exists created_by uuid not null;
alter table public.cash_transactions add column if not exists direction text not null;
alter table public.cash_transactions add column if not exists description text not null;
alter table public.cash_transactions add column if not exists amount numeric not null;
alter table public.cash_transactions add column if not exists payment_method text not null default 'other'::text;
alter table public.cash_transactions add column if not exists appointment_id uuid;
alter table public.cash_transactions add column if not exists created_at timestamptz not null default now();

create table if not exists public.commission_entries (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  sale_id uuid not null,
  service_order_id uuid not null,
  staff_profile_id uuid not null,
  service_gross numeric not null,
  product_gross numeric not null default 0,
  fee_share numeric not null,
  commission_rate numeric not null,
  product_commission_rate numeric not null default 0,
  commission_amount numeric not null,
  status text not null default 'accrued'::text,
  created_at timestamptz not null default now()
);
alter table public.commission_entries add column if not exists id uuid not null default gen_random_uuid();
alter table public.commission_entries add column if not exists barbershop_id uuid not null;
alter table public.commission_entries add column if not exists sale_id uuid not null;
alter table public.commission_entries add column if not exists service_order_id uuid not null;
alter table public.commission_entries add column if not exists staff_profile_id uuid not null;
alter table public.commission_entries add column if not exists service_gross numeric not null;
alter table public.commission_entries add column if not exists product_gross numeric not null default 0;
alter table public.commission_entries add column if not exists fee_share numeric not null;
alter table public.commission_entries add column if not exists commission_rate numeric not null;
alter table public.commission_entries add column if not exists product_commission_rate numeric not null default 0;
alter table public.commission_entries add column if not exists commission_amount numeric not null;
alter table public.commission_entries add column if not exists status text not null default 'accrued'::text;
alter table public.commission_entries add column if not exists created_at timestamptz not null default now();

create table if not exists public.payment_fee_rates (
  barbershop_id uuid not null,
  payment_method text not null,
  fee_percent numeric not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.payment_fee_rates add column if not exists barbershop_id uuid not null;
alter table public.payment_fee_rates add column if not exists payment_method text not null;
alter table public.payment_fee_rates add column if not exists fee_percent numeric not null default 0;
alter table public.payment_fee_rates add column if not exists updated_at timestamptz not null default now();

create table if not exists public.central_alerts (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  alert_type text not null,
  dedupe_key text not null,
  title text not null,
  summary text not null,
  severity text not null default 'info'::text,
  status text not null default 'open'::text,
  client_id uuid,
  product_id uuid,
  staff_profile_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  last_detected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.central_alerts add column if not exists id uuid not null default gen_random_uuid();
alter table public.central_alerts add column if not exists barbershop_id uuid not null;
alter table public.central_alerts add column if not exists alert_type text not null;
alter table public.central_alerts add column if not exists dedupe_key text not null;
alter table public.central_alerts add column if not exists title text not null;
alter table public.central_alerts add column if not exists summary text not null;
alter table public.central_alerts add column if not exists severity text not null default 'info'::text;
alter table public.central_alerts add column if not exists status text not null default 'open'::text;
alter table public.central_alerts add column if not exists client_id uuid;
alter table public.central_alerts add column if not exists product_id uuid;
alter table public.central_alerts add column if not exists staff_profile_id uuid;
alter table public.central_alerts add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.central_alerts add column if not exists last_detected_at timestamptz not null default now();
alter table public.central_alerts add column if not exists created_at timestamptz not null default now();
alter table public.central_alerts add column if not exists updated_at timestamptz not null default now();

create table if not exists public.automation_settings (
  barbershop_id uuid not null,
  booking_confirmation boolean not null default false,
  appointment_reminder boolean not null default false,
  return_reminder boolean not null default false,
  whatsapp_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.automation_settings add column if not exists barbershop_id uuid not null;
alter table public.automation_settings add column if not exists booking_confirmation boolean not null default false;
alter table public.automation_settings add column if not exists appointment_reminder boolean not null default false;
alter table public.automation_settings add column if not exists return_reminder boolean not null default false;
alter table public.automation_settings add column if not exists whatsapp_enabled boolean not null default false;
alter table public.automation_settings add column if not exists updated_at timestamptz not null default now();

create table if not exists public.automation_runs (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  event_key text not null,
  idempotency_key text not null,
  status text not null default 'completed'::text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.automation_runs add column if not exists id uuid not null default gen_random_uuid();
alter table public.automation_runs add column if not exists barbershop_id uuid not null;
alter table public.automation_runs add column if not exists event_key text not null;
alter table public.automation_runs add column if not exists idempotency_key text not null;
alter table public.automation_runs add column if not exists status text not null default 'completed'::text;
alter table public.automation_runs add column if not exists details jsonb not null default '{}'::jsonb;
alter table public.automation_runs add column if not exists created_at timestamptz not null default now();

create table if not exists public.message_outbox (
  id uuid not null default gen_random_uuid(),
  barbershop_id uuid not null,
  client_id uuid,
  channel text not null default 'whatsapp'::text,
  template_key text not null,
  destination text not null,
  body text not null,
  status text not null default 'pending'::text,
  provider_message_id text,
  error text,
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
alter table public.message_outbox add column if not exists id uuid not null default gen_random_uuid();
alter table public.message_outbox add column if not exists barbershop_id uuid not null;
alter table public.message_outbox add column if not exists client_id uuid;
alter table public.message_outbox add column if not exists channel text not null default 'whatsapp'::text;
alter table public.message_outbox add column if not exists template_key text not null;
alter table public.message_outbox add column if not exists destination text not null;
alter table public.message_outbox add column if not exists body text not null;
alter table public.message_outbox add column if not exists status text not null default 'pending'::text;
alter table public.message_outbox add column if not exists provider_message_id text;
alter table public.message_outbox add column if not exists error text;
alter table public.message_outbox add column if not exists consent_at timestamptz;
alter table public.message_outbox add column if not exists created_at timestamptz not null default now();
alter table public.message_outbox add column if not exists sent_at timestamptz;

-- ---------------------------------------------------------------------------
-- Constraints (PK/UNIQUE primeiro, depois CHECK e por fim FOREIGN KEY)
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_pkey' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'barbershops_pkey' and conrelid = 'public.barbershops'::regclass) then
    alter table public.barbershops add constraint barbershops_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'barbershop_members_pkey' and conrelid = 'public.barbershop_members'::regclass) then
    alter table public.barbershop_members add constraint barbershop_members_pkey PRIMARY KEY (barbershop_id, user_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'services_pkey' and conrelid = 'public.services'::regclass) then
    alter table public.services add constraint services_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'staff_profiles_pkey' and conrelid = 'public.staff_profiles'::regclass) then
    alter table public.staff_profiles add constraint staff_profiles_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'booking_resources_pkey' and conrelid = 'public.booking_resources'::regclass) then
    alter table public.booking_resources add constraint booking_resources_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'clients_pkey' and conrelid = 'public.clients'::regclass) then
    alter table public.clients add constraint clients_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_pkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_pkey' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_sessions_pkey' and conrelid = 'public.cash_sessions'::regclass) then
    alter table public.cash_sessions add constraint cash_sessions_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_orders_pkey' and conrelid = 'public.service_orders'::regclass) then
    alter table public.service_orders add constraint service_orders_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_order_items_pkey' and conrelid = 'public.service_order_items'::regclass) then
    alter table public.service_order_items add constraint service_order_items_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_pkey' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sale_items_pkey' and conrelid = 'public.sale_items'::regclass) then
    alter table public.sale_items add constraint sale_items_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_movements_pkey' and conrelid = 'public.cash_movements'::regclass) then
    alter table public.cash_movements add constraint cash_movements_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_transactions_pkey' and conrelid = 'public.cash_transactions'::regclass) then
    alter table public.cash_transactions add constraint cash_transactions_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_pkey' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'payment_fee_rates_pkey' and conrelid = 'public.payment_fee_rates'::regclass) then
    alter table public.payment_fee_rates add constraint payment_fee_rates_pkey PRIMARY KEY (barbershop_id, payment_method);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'central_alerts_pkey' and conrelid = 'public.central_alerts'::regclass) then
    alter table public.central_alerts add constraint central_alerts_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'automation_settings_pkey' and conrelid = 'public.automation_settings'::regclass) then
    alter table public.automation_settings add constraint automation_settings_pkey PRIMARY KEY (barbershop_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'automation_runs_pkey' and conrelid = 'public.automation_runs'::regclass) then
    alter table public.automation_runs add constraint automation_runs_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'message_outbox_pkey' and conrelid = 'public.message_outbox'::regclass) then
    alter table public.message_outbox add constraint message_outbox_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'barbershops_slug_key' and conrelid = 'public.barbershops'::regclass) then
    alter table public.barbershops add constraint barbershops_slug_key UNIQUE (slug);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'services_barbershop_id_name_key' and conrelid = 'public.services'::regclass) then
    alter table public.services add constraint services_barbershop_id_name_key UNIQUE (barbershop_id, name);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'staff_profiles_barbershop_id_user_id_key' and conrelid = 'public.staff_profiles'::regclass) then
    alter table public.staff_profiles add constraint staff_profiles_barbershop_id_user_id_key UNIQUE (barbershop_id, user_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'booking_resources_barbershop_id_name_key' and conrelid = 'public.booking_resources'::regclass) then
    alter table public.booking_resources add constraint booking_resources_barbershop_id_name_key UNIQUE (barbershop_id, name);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'booking_resources_id_barbershop_id_key' and conrelid = 'public.booking_resources'::regclass) then
    alter table public.booking_resources add constraint booking_resources_id_barbershop_id_key UNIQUE (id, barbershop_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'clients_barbershop_id_phone_normalized_key' and conrelid = 'public.clients'::regclass) then
    alter table public.clients add constraint clients_barbershop_id_phone_normalized_key UNIQUE (barbershop_id, phone_normalized);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_id_barbershop_id_key' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_id_barbershop_id_key UNIQUE (id, barbershop_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_sessions_id_barbershop_id_key' and conrelid = 'public.cash_sessions'::regclass) then
    alter table public.cash_sessions add constraint cash_sessions_id_barbershop_id_key UNIQUE (id, barbershop_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_orders_appointment_id_key' and conrelid = 'public.service_orders'::regclass) then
    alter table public.service_orders add constraint service_orders_appointment_id_key UNIQUE (appointment_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_order_items_order_id_product_id_key' and conrelid = 'public.service_order_items'::regclass) then
    alter table public.service_order_items add constraint service_order_items_order_id_product_id_key UNIQUE (order_id, product_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_sale_id_key' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_sale_id_key UNIQUE (sale_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_service_order_id_key' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_service_order_id_key UNIQUE (service_order_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'central_alerts_barbershop_id_dedupe_key_key' and conrelid = 'public.central_alerts'::regclass) then
    alter table public.central_alerts add constraint central_alerts_barbershop_id_dedupe_key_key UNIQUE (barbershop_id, dedupe_key);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'automation_runs_barbershop_id_idempotency_key_key' and conrelid = 'public.automation_runs'::regclass) then
    alter table public.automation_runs add constraint automation_runs_barbershop_id_idempotency_key_key UNIQUE (barbershop_id, idempotency_key);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'barbershops_business_type_check' and conrelid = 'public.barbershops'::regclass) then
    alter table public.barbershops add constraint barbershops_business_type_check CHECK ((business_type = ANY (ARRAY['clinic'::text, 'beauty'::text, 'tattoo'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'barbershops_name_check' and conrelid = 'public.barbershops'::regclass) then
    alter table public.barbershops add constraint barbershops_name_check CHECK (((length(TRIM(BOTH FROM name)) >= 2) AND (length(TRIM(BOTH FROM name)) <= 120)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'barbershops_slug_check' and conrelid = 'public.barbershops'::regclass) then
    alter table public.barbershops add constraint barbershops_slug_check CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'barbershops_theme_preference_check' and conrelid = 'public.barbershops'::regclass) then
    alter table public.barbershops add constraint barbershops_theme_preference_check CHECK ((theme_preference = ANY (ARRAY['light'::text, 'dark'::text, 'system'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'services_booking_unit_check' and conrelid = 'public.services'::regclass) then
    alter table public.services add constraint services_booking_unit_check CHECK ((booking_unit = ANY (ARRAY['minutes'::text, 'hours'::text, 'days'::text, 'nights'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'services_duration_minutes_check' and conrelid = 'public.services'::regclass) then
    alter table public.services add constraint services_duration_minutes_check CHECK (((duration_minutes >= 5) AND (duration_minutes <= 480)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'services_duration_range_check' and conrelid = 'public.services'::regclass) then
    alter table public.services add constraint services_duration_range_check CHECK ((((min_duration_minutes >= 5) AND (min_duration_minutes <= 43200)) AND ((max_duration_minutes >= min_duration_minutes) AND (max_duration_minutes <= 43200)) AND ((duration_minutes >= min_duration_minutes) AND (duration_minutes <= max_duration_minutes))));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'services_name_check' and conrelid = 'public.services'::regclass) then
    alter table public.services add constraint services_name_check CHECK (((length(TRIM(BOTH FROM name)) >= 2) AND (length(TRIM(BOTH FROM name)) <= 100)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'services_price_check' and conrelid = 'public.services'::regclass) then
    alter table public.services add constraint services_price_check CHECK ((price >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'staff_profiles_commission_rate_check' and conrelid = 'public.staff_profiles'::regclass) then
    alter table public.staff_profiles add constraint staff_profiles_commission_rate_check CHECK (((commission_rate >= (0)::numeric) AND (commission_rate <= (100)::numeric)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'staff_profiles_display_name_check' and conrelid = 'public.staff_profiles'::regclass) then
    alter table public.staff_profiles add constraint staff_profiles_display_name_check CHECK (((length(TRIM(BOTH FROM display_name)) >= 2) AND (length(TRIM(BOTH FROM display_name)) <= 100)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'staff_profiles_product_commission_rate_check' and conrelid = 'public.staff_profiles'::regclass) then
    alter table public.staff_profiles add constraint staff_profiles_product_commission_rate_check CHECK (((product_commission_rate >= (0)::numeric) AND (product_commission_rate <= (100)::numeric)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'staff_profiles_role_check' and conrelid = 'public.staff_profiles'::regclass) then
    alter table public.staff_profiles add constraint staff_profiles_role_check CHECK ((role = ANY (ARRAY['barber'::member_role, 'manager'::member_role, 'receptionist'::member_role])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'booking_resources_capacity_check' and conrelid = 'public.booking_resources'::regclass) then
    alter table public.booking_resources add constraint booking_resources_capacity_check CHECK (((capacity >= 1) AND (capacity <= 10000)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'booking_resources_kind_check' and conrelid = 'public.booking_resources'::regclass) then
    alter table public.booking_resources add constraint booking_resources_kind_check CHECK ((kind = ANY (ARRAY['room'::text, 'studio'::text, 'space'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'booking_resources_name_check' and conrelid = 'public.booking_resources'::regclass) then
    alter table public.booking_resources add constraint booking_resources_name_check CHECK (((length(TRIM(BOTH FROM name)) >= 2) AND (length(TRIM(BOTH FROM name)) <= 100)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'clients_name_check' and conrelid = 'public.clients'::regclass) then
    alter table public.clients add constraint clients_name_check CHECK (((length(TRIM(BOTH FROM name)) >= 2) AND (length(TRIM(BOTH FROM name)) <= 120)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'clients_phone_normalized_check' and conrelid = 'public.clients'::regclass) then
    alter table public.clients add constraint clients_phone_normalized_check CHECK (((length(phone_normalized) >= 10) AND (length(phone_normalized) <= 13)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_duration_minutes_check' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_duration_minutes_check CHECK (((duration_minutes >= 5) AND (duration_minutes <= 43200)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_party_size_check' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_party_size_check CHECK (((party_size >= 1) AND (party_size <= 10000)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_price_check' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_price_check CHECK ((price >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_source_check' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_source_check CHECK ((source = ANY (ARRAY['admin'::text, 'public'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_starts_at_check' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_starts_at_check CHECK ((date_trunc('minute'::text, starts_at) = starts_at));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_status_check' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_status_check CHECK ((status = ANY (ARRAY['requested'::text, 'scheduled'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_minimum_quantity_check' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_minimum_quantity_check CHECK ((minimum_quantity >= 0));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_name_check' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_name_check CHECK (((length(TRIM(BOTH FROM name)) >= 2) AND (length(TRIM(BOTH FROM name)) <= 120)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_price_check' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_price_check CHECK ((price >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_quantity_check' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_quantity_check CHECK (((quantity >= (0)::numeric) AND (reserved_quantity >= (0)::numeric) AND (reserved_quantity <= quantity)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_stock_quantity_check' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_stock_quantity_check CHECK ((stock_quantity >= 0));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_sessions_closing_amount_check' and conrelid = 'public.cash_sessions'::regclass) then
    alter table public.cash_sessions add constraint cash_sessions_closing_amount_check CHECK ((closing_amount >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_sessions_opening_amount_check' and conrelid = 'public.cash_sessions'::regclass) then
    alter table public.cash_sessions add constraint cash_sessions_opening_amount_check CHECK ((opening_amount >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_orders_status_check' and conrelid = 'public.service_orders'::regclass) then
    alter table public.service_orders add constraint service_orders_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text, 'cancelled'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_order_items_quantity_check' and conrelid = 'public.service_order_items'::regclass) then
    alter table public.service_order_items add constraint service_order_items_quantity_check CHECK ((quantity > (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_order_items_unit_price_check' and conrelid = 'public.service_order_items'::regclass) then
    alter table public.service_order_items add constraint service_order_items_unit_price_check CHECK ((unit_price >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_discount_check' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_discount_check CHECK ((discount >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_payment_method_check' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_payment_method_check CHECK ((payment_method = ANY (ARRAY['pix'::text, 'cash'::text, 'debit'::text, 'credit'::text, 'debit_card'::text, 'credit_card'::text, 'other'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_status_check' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_status_check CHECK ((status = ANY (ARRAY['paid'::text, 'cancelled'::text, 'refunded'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_subtotal_check' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_subtotal_check CHECK ((subtotal >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_total_check' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_total_check CHECK ((total >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sale_items_check' and conrelid = 'public.sale_items'::regclass) then
    alter table public.sale_items add constraint sale_items_check CHECK ((num_nonnulls(product_id, service_id) <= 1));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sale_items_quantity_check' and conrelid = 'public.sale_items'::regclass) then
    alter table public.sale_items add constraint sale_items_quantity_check CHECK ((quantity > 0));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sale_items_total_check' and conrelid = 'public.sale_items'::regclass) then
    alter table public.sale_items add constraint sale_items_total_check CHECK ((total >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sale_items_unit_price_check' and conrelid = 'public.sale_items'::regclass) then
    alter table public.sale_items add constraint sale_items_unit_price_check CHECK ((unit_price >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_movements_amount_check' and conrelid = 'public.cash_movements'::regclass) then
    alter table public.cash_movements add constraint cash_movements_amount_check CHECK ((amount > (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_movements_description_check' and conrelid = 'public.cash_movements'::regclass) then
    alter table public.cash_movements add constraint cash_movements_description_check CHECK (((length(TRIM(BOTH FROM description)) >= 2) AND (length(TRIM(BOTH FROM description)) <= 180)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_movements_kind_check' and conrelid = 'public.cash_movements'::regclass) then
    alter table public.cash_movements add constraint cash_movements_kind_check CHECK ((kind = ANY (ARRAY['income'::text, 'expense'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_movements_payment_method_check' and conrelid = 'public.cash_movements'::regclass) then
    alter table public.cash_movements add constraint cash_movements_payment_method_check CHECK (((payment_method IS NULL) OR (payment_method = ANY (ARRAY['pix'::text, 'cash'::text, 'debit_card'::text, 'credit_card'::text, 'other'::text]))));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_movements_source_check' and conrelid = 'public.cash_movements'::regclass) then
    alter table public.cash_movements add constraint cash_movements_source_check CHECK ((source = ANY (ARRAY['pdv'::text, 'service_order'::text, 'manual'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_transactions_amount_check' and conrelid = 'public.cash_transactions'::regclass) then
    alter table public.cash_transactions add constraint cash_transactions_amount_check CHECK ((amount > (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_transactions_description_check' and conrelid = 'public.cash_transactions'::regclass) then
    alter table public.cash_transactions add constraint cash_transactions_description_check CHECK (((length(TRIM(BOTH FROM description)) >= 2) AND (length(TRIM(BOTH FROM description)) <= 160)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_transactions_direction_check' and conrelid = 'public.cash_transactions'::regclass) then
    alter table public.cash_transactions add constraint cash_transactions_direction_check CHECK ((direction = ANY (ARRAY['in'::text, 'out'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_transactions_payment_method_check' and conrelid = 'public.cash_transactions'::regclass) then
    alter table public.cash_transactions add constraint cash_transactions_payment_method_check CHECK ((payment_method = ANY (ARRAY['pix'::text, 'cash'::text, 'debit'::text, 'credit'::text, 'debit_card'::text, 'credit_card'::text, 'other'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_commission_amount_check' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_commission_amount_check CHECK ((commission_amount >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_commission_rate_check' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_commission_rate_check CHECK (((commission_rate >= (0)::numeric) AND (commission_rate <= (100)::numeric)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_fee_share_check' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_fee_share_check CHECK ((fee_share >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_product_commission_rate_check' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_product_commission_rate_check CHECK (((product_commission_rate >= (0)::numeric) AND (product_commission_rate <= (100)::numeric)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_product_gross_check' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_product_gross_check CHECK ((product_gross >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_service_gross_check' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_service_gross_check CHECK ((service_gross >= (0)::numeric));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_status_check' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_status_check CHECK ((status = ANY (ARRAY['accrued'::text, 'paid'::text, 'cancelled'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'payment_fee_rates_fee_percent_check' and conrelid = 'public.payment_fee_rates'::regclass) then
    alter table public.payment_fee_rates add constraint payment_fee_rates_fee_percent_check CHECK (((fee_percent >= (0)::numeric) AND (fee_percent <= (30)::numeric)));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'payment_fee_rates_payment_method_check' and conrelid = 'public.payment_fee_rates'::regclass) then
    alter table public.payment_fee_rates add constraint payment_fee_rates_payment_method_check CHECK ((payment_method = ANY (ARRAY['pix'::text, 'cash'::text, 'debit_card'::text, 'credit_card'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'central_alerts_alert_type_check' and conrelid = 'public.central_alerts'::regclass) then
    alter table public.central_alerts add constraint central_alerts_alert_type_check CHECK ((alert_type = ANY (ARRAY['client_return'::text, 'inventory_low'::text, 'schedule_idle'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'central_alerts_severity_check' and conrelid = 'public.central_alerts'::regclass) then
    alter table public.central_alerts add constraint central_alerts_severity_check CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'urgent'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'central_alerts_status_check' and conrelid = 'public.central_alerts'::regclass) then
    alter table public.central_alerts add constraint central_alerts_status_check CHECK ((status = ANY (ARRAY['open'::text, 'resolved'::text, 'dismissed'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'automation_runs_status_check' and conrelid = 'public.automation_runs'::regclass) then
    alter table public.automation_runs add constraint automation_runs_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'completed'::text, 'failed'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'message_outbox_channel_check' and conrelid = 'public.message_outbox'::regclass) then
    alter table public.message_outbox add constraint message_outbox_channel_check CHECK ((channel = ANY (ARRAY['whatsapp'::text, 'email'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'message_outbox_status_check' and conrelid = 'public.message_outbox'::regclass) then
    alter table public.message_outbox add constraint message_outbox_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'cancelled'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_id_fkey' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'barbershop_members_barbershop_id_fkey' and conrelid = 'public.barbershop_members'::regclass) then
    alter table public.barbershop_members add constraint barbershop_members_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'barbershop_members_user_id_fkey' and conrelid = 'public.barbershop_members'::regclass) then
    alter table public.barbershop_members add constraint barbershop_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'services_barbershop_id_fkey' and conrelid = 'public.services'::regclass) then
    alter table public.services add constraint services_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'staff_profiles_barbershop_id_fkey' and conrelid = 'public.staff_profiles'::regclass) then
    alter table public.staff_profiles add constraint staff_profiles_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'staff_profiles_user_id_fkey' and conrelid = 'public.staff_profiles'::regclass) then
    alter table public.staff_profiles add constraint staff_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'booking_resources_barbershop_id_fkey' and conrelid = 'public.booking_resources'::regclass) then
    alter table public.booking_resources add constraint booking_resources_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'clients_barbershop_id_fkey' and conrelid = 'public.clients'::regclass) then
    alter table public.clients add constraint clients_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'clients_preferred_service_id_fkey' and conrelid = 'public.clients'::regclass) then
    alter table public.clients add constraint clients_preferred_service_id_fkey FOREIGN KEY (preferred_service_id) REFERENCES public.services(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'clients_preferred_staff_profile_id_fkey' and conrelid = 'public.clients'::regclass) then
    alter table public.clients add constraint clients_preferred_staff_profile_id_fkey FOREIGN KEY (preferred_staff_profile_id) REFERENCES public.staff_profiles(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_barbershop_id_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_client_id_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_resource_shop_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_resource_shop_fkey FOREIGN KEY (resource_id, barbershop_id) REFERENCES public.booking_resources(id, barbershop_id) ON DELETE SET NULL (resource_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_service_id_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_staff_profile_id_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_staff_profile_id_fkey FOREIGN KEY (staff_profile_id) REFERENCES public.staff_profiles(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_barbershop_id_fkey' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_sessions_barbershop_id_fkey' and conrelid = 'public.cash_sessions'::regclass) then
    alter table public.cash_sessions add constraint cash_sessions_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_sessions_opened_by_fkey' and conrelid = 'public.cash_sessions'::regclass) then
    alter table public.cash_sessions add constraint cash_sessions_opened_by_fkey FOREIGN KEY (opened_by) REFERENCES auth.users(id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_orders_appointment_id_fkey' and conrelid = 'public.service_orders'::regclass) then
    alter table public.service_orders add constraint service_orders_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_orders_barbershop_id_fkey' and conrelid = 'public.service_orders'::regclass) then
    alter table public.service_orders add constraint service_orders_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_order_items_barbershop_id_fkey' and conrelid = 'public.service_order_items'::regclass) then
    alter table public.service_order_items add constraint service_order_items_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_order_items_order_id_fkey' and conrelid = 'public.service_order_items'::regclass) then
    alter table public.service_order_items add constraint service_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.service_orders(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'service_order_items_product_id_fkey' and conrelid = 'public.service_order_items'::regclass) then
    alter table public.service_order_items add constraint service_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_appointment_id_fkey' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_barbershop_id_fkey' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_client_id_fkey' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_created_by_fkey' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_service_order_id_fkey' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_service_order_id_fkey FOREIGN KEY (service_order_id) REFERENCES public.service_orders(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_session_id_fkey' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.cash_sessions(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sale_items_barbershop_id_fkey' and conrelid = 'public.sale_items'::regclass) then
    alter table public.sale_items add constraint sale_items_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sale_items_product_id_fkey' and conrelid = 'public.sale_items'::regclass) then
    alter table public.sale_items add constraint sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sale_items_sale_id_fkey' and conrelid = 'public.sale_items'::regclass) then
    alter table public.sale_items add constraint sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sale_items_service_id_fkey' and conrelid = 'public.sale_items'::regclass) then
    alter table public.sale_items add constraint sale_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_movements_barbershop_id_fkey' and conrelid = 'public.cash_movements'::regclass) then
    alter table public.cash_movements add constraint cash_movements_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_movements_created_by_fkey' and conrelid = 'public.cash_movements'::regclass) then
    alter table public.cash_movements add constraint cash_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_movements_sale_id_fkey' and conrelid = 'public.cash_movements'::regclass) then
    alter table public.cash_movements add constraint cash_movements_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_transactions_appointment_id_fkey' and conrelid = 'public.cash_transactions'::regclass) then
    alter table public.cash_transactions add constraint cash_transactions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_transactions_barbershop_id_fkey' and conrelid = 'public.cash_transactions'::regclass) then
    alter table public.cash_transactions add constraint cash_transactions_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_transactions_created_by_fkey' and conrelid = 'public.cash_transactions'::regclass) then
    alter table public.cash_transactions add constraint cash_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cash_transactions_session_id_fkey' and conrelid = 'public.cash_transactions'::regclass) then
    alter table public.cash_transactions add constraint cash_transactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.cash_sessions(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_barbershop_id_fkey' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_sale_id_fkey' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_service_order_id_fkey' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_service_order_id_fkey FOREIGN KEY (service_order_id) REFERENCES public.service_orders(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'commission_entries_staff_profile_id_fkey' and conrelid = 'public.commission_entries'::regclass) then
    alter table public.commission_entries add constraint commission_entries_staff_profile_id_fkey FOREIGN KEY (staff_profile_id) REFERENCES public.staff_profiles(id) ON DELETE RESTRICT;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'payment_fee_rates_barbershop_id_fkey' and conrelid = 'public.payment_fee_rates'::regclass) then
    alter table public.payment_fee_rates add constraint payment_fee_rates_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'central_alerts_barbershop_id_fkey' and conrelid = 'public.central_alerts'::regclass) then
    alter table public.central_alerts add constraint central_alerts_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'central_alerts_client_id_fkey' and conrelid = 'public.central_alerts'::regclass) then
    alter table public.central_alerts add constraint central_alerts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'central_alerts_product_id_fkey' and conrelid = 'public.central_alerts'::regclass) then
    alter table public.central_alerts add constraint central_alerts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'central_alerts_staff_profile_id_fkey' and conrelid = 'public.central_alerts'::regclass) then
    alter table public.central_alerts add constraint central_alerts_staff_profile_id_fkey FOREIGN KEY (staff_profile_id) REFERENCES public.staff_profiles(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'automation_settings_barbershop_id_fkey' and conrelid = 'public.automation_settings'::regclass) then
    alter table public.automation_settings add constraint automation_settings_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'automation_runs_barbershop_id_fkey' and conrelid = 'public.automation_runs'::regclass) then
    alter table public.automation_runs add constraint automation_runs_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'message_outbox_barbershop_id_fkey' and conrelid = 'public.message_outbox'::regclass) then
    alter table public.message_outbox add constraint message_outbox_barbershop_id_fkey FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'message_outbox_client_id_fkey' and conrelid = 'public.message_outbox'::regclass) then
    alter table public.message_outbox add constraint message_outbox_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Índices (os índices de PK/UNIQUE já nascem com as constraints)
-- ---------------------------------------------------------------------------
create index if not exists barbershop_members_user_idx ON public.barbershop_members USING btree (user_id);
create index if not exists staff_profiles_barbershop_idx ON public.staff_profiles USING btree (barbershop_id);
create unique index if not exists barbershops_cnpj_unique ON public.barbershops USING btree (cnpj) WHERE (cnpj IS NOT NULL);
create index if not exists services_barbershop_idx ON public.services USING btree (barbershop_id);
create unique index if not exists one_open_cash_session_per_shop ON public.cash_sessions USING btree (barbershop_id) WHERE (closed_at IS NULL);
create index if not exists booking_resources_shop_idx ON public.booking_resources USING btree (barbershop_id, active, name);
create index if not exists cash_transactions_shop_date_idx ON public.cash_transactions USING btree (barbershop_id, created_at DESC);
create index if not exists central_alerts_shop_status_idx ON public.central_alerts USING btree (barbershop_id, status, last_detected_at DESC);
create index if not exists cash_movements_shop_created_idx ON public.cash_movements USING btree (barbershop_id, created_at DESC);
create unique index if not exists sales_service_order_uidx ON public.sales USING btree (service_order_id) WHERE (service_order_id IS NOT NULL);
create index if not exists appointments_shop_start_idx ON public.appointments USING btree (barbershop_id, starts_at);
create index if not exists appointments_client_idx ON public.appointments USING btree (client_id, starts_at DESC);
create index if not exists appointments_resource_start_idx ON public.appointments USING btree (barbershop_id, resource_id, starts_at) WHERE (resource_id IS NOT NULL);
create unique index if not exists appointments_customer_token_hash_uidx ON public.appointments USING btree (customer_token_hash) WHERE (customer_token_hash IS NOT NULL);
create index if not exists appointments_staff_window_idx ON public.appointments USING btree (barbershop_id, staff_profile_id, starts_at, ends_at) WHERE (status = ANY (ARRAY['requested'::text, 'scheduled'::text, 'confirmed'::text, 'in_progress'::text]));
create unique index if not exists products_shop_sku_unique ON public.products USING btree (barbershop_id, sku) WHERE (sku <> ''::text);
create index if not exists service_order_items_order_idx ON public.service_order_items USING btree (order_id);
create index if not exists service_orders_shop_status_idx ON public.service_orders USING btree (barbershop_id, status, created_at DESC);

-- ---------------------------------------------------------------------------
-- Funções (definição completa, como está no banco)
-- ---------------------------------------------------------------------------

-- public.add_public_order_item(text, uuid, numeric)
CREATE OR REPLACE FUNCTION public.add_public_order_item(customer_token text, target_product uuid, target_quantity numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare shop_id uuid; order_uuid uuid; product_row public.products%rowtype;
begin
  if target_quantity<=0 or target_quantity>50 then raise exception 'Quantidade inválida'; end if;
  select a.barbershop_id,o.id into shop_id,order_uuid from public.appointments a join public.service_orders o on o.appointment_id=a.id where a.customer_token_hash=encode(extensions.digest(customer_token,'sha256'),'hex') and a.status in ('requested','scheduled','confirmed','in_progress') and o.status='open' limit 1;
  if order_uuid is null then raise exception 'Comanda não encontrada ou já encerrada'; end if;
  select * into product_row from public.products where id=target_product and barbershop_id=shop_id and active and available_to_customer and quantity-reserved_quantity>=target_quantity for update;
  if not found then raise exception 'Produto indisponível ou sem estoque suficiente'; end if;
  update public.products set reserved_quantity=reserved_quantity+target_quantity,updated_at=now() where id=target_product;
  insert into public.service_order_items(order_id,barbershop_id,product_id,product_name,quantity,unit_price) values(order_uuid,shop_id,target_product,product_row.name,target_quantity,product_row.unit_price)
  on conflict(order_id,product_id) do update set quantity=public.service_order_items.quantity+excluded.quantity;
  return jsonb_build_object('order_id',order_uuid,'product_name',product_row.name,'quantity',target_quantity);
end $function$;

-- public.advance_appointment(uuid, text)
CREATE OR REPLACE FUNCTION public.advance_appointment(target_id uuid, next_status text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare target_shop uuid;
begin
 if next_status not in ('requested','confirmed','in_progress','completed','cancelled','no_show') then raise exception 'Status inválido'; end if;
 select barbershop_id into target_shop from public.appointments where id = target_id;
 if target_shop is null or not public.has_barbershop_role(target_shop, array['owner','manager','barber','receptionist']::public.member_role[]) then raise exception 'Atendimento não encontrado'; end if;
 update public.appointments set status = next_status, updated_at = now() where id = target_id;
end
$function$;

-- public.advance_onboarding(uuid, public.onboarding_step)
CREATE OR REPLACE FUNCTION public.advance_onboarding(target_shop uuid, next_step onboarding_step)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
 update public.barbershops set onboarding_step = next_step, updated_at = now()
 where id = target_shop and public.has_barbershop_role(target_shop, array['owner','manager']::public.member_role[]);
 if not found then raise exception 'Shop not found or insufficient access'; end if;
end
$function$;

-- public.bootstrap_barbershop(text, text, text, text, text, text, text, text)
CREATE OR REPLACE FUNCTION public.bootstrap_barbershop(shop_name text, shop_slug text, shop_phone text, shop_address text, owner_name text, open_time text, close_time text, business_kind text)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare new_shop_id uuid := gen_random_uuid();
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if business_kind not in ('clinic','beauty','tattoo') then raise exception 'Invalid business type'; end if;
 insert into public.profiles(id, full_name) values (auth.uid(), trim(owner_name))
 on conflict (id) do update set full_name=excluded.full_name, updated_at=now();
 if open_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or close_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or open_time >= close_time then raise exception 'Invalid business hours'; end if;
 insert into public.barbershops(id,name,slug,phone,address,business_type,onboarding_step,opening_hours)
 values(new_shop_id,trim(shop_name),lower(trim(shop_slug)),trim(shop_phone),trim(shop_address),business_kind,'services',
 jsonb_build_object('mon',jsonb_build_object('open',open_time,'close',close_time,'closed',false),'tue',jsonb_build_object('open',open_time,'close',close_time,'closed',false),'wed',jsonb_build_object('open',open_time,'close',close_time,'closed',false),'thu',jsonb_build_object('open',open_time,'close',close_time,'closed',false),'fri',jsonb_build_object('open',open_time,'close',close_time,'closed',false),'sat',jsonb_build_object('open',open_time,'close',close_time,'closed',false),'sun',jsonb_build_object('open',open_time,'close',close_time,'closed',true)));
 insert into public.barbershop_members(barbershop_id,user_id,role) values(new_shop_id,auth.uid(),'owner');
 return new_shop_id;
end
$function$;

-- public.bootstrap_barbershop(text, text, text, text, text, text, text, text, text[])
CREATE OR REPLACE FUNCTION public.bootstrap_barbershop(shop_name text, shop_slug text, shop_phone text, shop_address text, owner_name text, open_time text, close_time text, business_kind text, open_days text[])
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  new_shop_id uuid := gen_random_uuid();
  existing_shop_id uuid;
  day_key text;
  hours jsonb := '{}'::jsonb;
  phone_digits text := regexp_replace(coalesce(shop_phone, ''), '[^0-9]', '', 'g');
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  -- Serialize repeated submissions from the same account (double-click/retry).
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  select m.barbershop_id into existing_shop_id
  from public.barbershop_members m
  where m.user_id = auth.uid() and m.role = 'owner'
  order by m.created_at
  limit 1;
  if existing_shop_id is not null then return existing_shop_id; end if;

  if business_kind not in ('beauty','tattoo') then raise exception 'Invalid business type'; end if;
  if length(trim(shop_name)) not between 2 and 120 then raise exception 'Informe o nome do negócio'; end if;
  if length(phone_digits) not between 10 and 13 then raise exception 'Informe um telefone com DDD'; end if;
  if open_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
     or close_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
     or open_time >= close_time then raise exception 'Confira os horários de funcionamento'; end if;
  if coalesce(array_length(open_days, 1), 0) = 0
     or exists (select 1 from unnest(open_days) d where d not in ('mon','tue','wed','thu','fri','sat','sun')) then
    raise exception 'Selecione os dias de funcionamento';
  end if;

  -- A business using the same contact phone cannot be registered a second time.
  perform pg_advisory_xact_lock(hashtextextended(phone_digits, 1));
  if exists (
    select 1 from public.barbershops b
    where regexp_replace(b.phone, '[^0-9]', '', 'g') = phone_digits
  ) then raise exception 'Este telefone já está vinculado a um negócio. Entre na conta existente.'; end if;

  foreach day_key in array array['mon','tue','wed','thu','fri','sat','sun'] loop
    hours := hours || jsonb_build_object(day_key, jsonb_build_object(
      'open', open_time,
      'close', close_time,
      'closed', not (day_key = any(open_days))
    ));
  end loop;

  insert into public.profiles(id, full_name)
  values (auth.uid(), trim(owner_name))
  on conflict (id) do update set full_name = excluded.full_name, updated_at = now();

  insert into public.barbershops(id, name, slug, phone, address, business_type, onboarding_step, opening_hours)
  values (new_shop_id, trim(shop_name), lower(trim(shop_slug)), trim(shop_phone), trim(shop_address), business_kind, 'services', hours);
  insert into public.barbershop_members(barbershop_id, user_id, role)
  values (new_shop_id, auth.uid(), 'owner');
  return new_shop_id;
end;
$function$;

-- public.carvel_sync_appointment_end()
CREATE OR REPLACE FUNCTION public.carvel_sync_appointment_end()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if new.ends_at is null or (new.starts_at is distinct from old.starts_at and new.ends_at is not distinct from old.ends_at)
      or (new.duration_minutes is distinct from old.duration_minutes and new.ends_at is not distinct from old.ends_at) then
    new.ends_at := new.starts_at + make_interval(mins => new.duration_minutes);
  elsif new.ends_at <= new.starts_at then
    raise exception 'O horário final precisa ser posterior ao inicial';
  end if;
  return new;
end $function$;

-- public.carvel_sync_legacy_client_columns()
CREATE OR REPLACE FUNCTION public.carvel_sync_legacy_client_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if tg_op = 'INSERT' then
    new.name := coalesce(nullif(trim(new.full_name), ''), nullif(trim(new.name), ''));
    new.full_name := new.name;
    new.phone := coalesce(nullif(new.phone, ''), new.phone_normalized, '');
    new.phone_normalized := public.normalize_br_phone(coalesce(nullif(new.phone_normalized, ''), new.phone));
    new.whatsapp_consent := coalesce(new.whatsapp_opt_in, false);
    new.whatsapp_opt_in := new.whatsapp_consent;
  else
    if new.full_name is distinct from old.full_name then new.name := new.full_name;
    elsif new.name is distinct from old.name then new.full_name := new.name;
    end if;
    if new.phone is distinct from old.phone then new.phone_normalized := public.normalize_br_phone(new.phone);
    elsif new.phone_normalized is distinct from old.phone_normalized then new.phone := new.phone_normalized;
    end if;
    if new.whatsapp_opt_in is distinct from old.whatsapp_opt_in then new.whatsapp_consent := new.whatsapp_opt_in;
    elsif new.whatsapp_consent is distinct from old.whatsapp_consent then new.whatsapp_opt_in := new.whatsapp_consent;
    end if;
  end if;
  return new;
end $function$;

-- public.carvel_sync_legacy_product_columns()
CREATE OR REPLACE FUNCTION public.carvel_sync_legacy_product_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if tg_op = 'INSERT' then
    if new.quantity = 0 and new.stock_quantity <> 0 then new.quantity := new.stock_quantity; else new.stock_quantity := floor(new.quantity)::integer; end if;
    if new.unit_price = 0 and new.price <> 0 then new.unit_price := new.price; else new.price := new.unit_price; end if;
  else
    if new.quantity is distinct from old.quantity then new.stock_quantity := floor(new.quantity)::integer;
    elsif new.stock_quantity is distinct from old.stock_quantity then new.quantity := new.stock_quantity;
    end if;
    if new.unit_price is distinct from old.unit_price then new.price := new.unit_price;
    elsif new.price is distinct from old.price then new.unit_price := new.price;
    end if;
  end if;
  return new;
end $function$;

-- public.carvel_sync_legacy_sales_columns()
CREATE OR REPLACE FUNCTION public.carvel_sync_legacy_sales_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if tg_op = 'INSERT' then
    if new.total_amount = 0 and new.total <> 0 then new.total_amount := new.total; else new.total := new.total_amount; end if;
    if new.subtotal = 0 then new.subtotal := new.total_amount + coalesce(new.discount,0); end if;
  else
    if new.total_amount is distinct from old.total_amount then new.total := new.total_amount;
    elsif new.total is distinct from old.total then new.total_amount := new.total;
    end if;
  end if;
  return new;
end $function$;

-- public.carvel_track_completed_appointment()
CREATE OR REPLACE FUNCTION public.carvel_track_completed_appointment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.status='completed' and old.status is distinct from 'completed' then
    update public.clients set completed_visits=completed_visits+1,last_completed_at=new.ends_at,updated_at=now()
      where id=new.client_id and barbershop_id=new.barbershop_id;
  end if;
  if new.status in ('cancelled','no_show') and old.status is distinct from new.status then
    update public.service_orders set status='cancelled',updated_at=now() where appointment_id=new.id and status='open';
  end if;
  return new;
end $function$;

-- public.close_service_order(uuid, text)
CREATE OR REPLACE FUNCTION public.close_service_order(target_order uuid, target_payment_method text)
 RETURNS sales
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare order_row public.service_orders%rowtype; appointment_row public.appointments%rowtype; service_row public.services%rowtype; staff_row public.staff_profiles%rowtype;
  sale_row public.sales%rowtype; product_line record; product_total numeric(12,2):=0; gross numeric(12,2):=0; fee_rate numeric(5,2):=0; fee numeric(12,2):=0; commission numeric(12,2):=0;
begin
  if auth.uid() is null or target_payment_method not in ('pix','cash','debit_card','credit_card') then raise exception 'Sessão ou forma de pagamento inválida'; end if;
  select * into order_row from public.service_orders where id=target_order for update;
  if not found or not public.has_barbershop_role(order_row.barbershop_id,array['owner','manager','receptionist']::public.member_role[]) then raise exception 'Comanda não encontrada ou acesso negado'; end if;
  if order_row.status='closed' then select * into sale_row from public.sales where service_order_id=target_order; if found then return sale_row; end if; raise exception 'Comanda já encerrada'; end if;
  if order_row.status<>'open' then raise exception 'Esta comanda não está aberta'; end if;
  select * into appointment_row from public.appointments where id=order_row.appointment_id for update;
  select * into service_row from public.services where id=appointment_row.service_id and barbershop_id=order_row.barbershop_id;
  if not found then raise exception 'Serviço não encontrado'; end if;
  select * into staff_row from public.staff_profiles where id=appointment_row.staff_profile_id and barbershop_id=order_row.barbershop_id;
  if not found then raise exception 'Profissional não encontrado'; end if;
  select coalesce(round(sum(quantity*unit_price),2),0) into product_total from public.service_order_items where order_id=target_order;
  gross:=round(appointment_row.price+product_total,2);
  select coalesce((select fee_percent from public.payment_fee_rates where barbershop_id=order_row.barbershop_id and payment_method=target_payment_method),0) into fee_rate;
  fee:=round(gross*fee_rate/100,2);
  commission:=round(greatest(0,appointment_row.price-fee*appointment_row.price/nullif(gross,0))*staff_row.commission_rate/100+
    greatest(0,product_total-fee*product_total/nullif(gross,0))*staff_row.product_commission_rate/100,2);
  insert into public.sales(barbershop_id,client_id,appointment_id,created_by,subtotal,discount,total,total_amount,payment_method,status,service_order_id,service_amount,product_amount,processing_fee,retained_amount)
  values(order_row.barbershop_id,appointment_row.client_id,appointment_row.id,auth.uid(),gross,0,gross,gross,target_payment_method,'paid',target_order,appointment_row.price,product_total,fee,gross-fee-commission) returning * into sale_row;
  for product_line in select * from public.service_order_items where order_id=target_order loop
    insert into public.sale_items(sale_id,product_id,service_id,item_name,product_name,quantity,unit_price,total,barbershop_id)
    values(sale_row.id,product_line.product_id,null,product_line.product_name,product_line.product_name,product_line.quantity::integer,product_line.unit_price,round(product_line.quantity*product_line.unit_price,2),order_row.barbershop_id);
    if product_line.product_id is not null then update public.products set quantity=greatest(0,quantity-product_line.quantity),reserved_quantity=greatest(0,reserved_quantity-product_line.quantity),updated_at=now() where id=product_line.product_id; end if;
  end loop;
  insert into public.cash_movements(barbershop_id,kind,source,description,amount,payment_method,sale_id,created_by)
  values(order_row.barbershop_id,'income','service_order','Comanda '||left(target_order::text,8),gross,target_payment_method,sale_row.id,auth.uid());
  if fee>0 then insert into public.cash_movements(barbershop_id,kind,source,description,amount,payment_method,sale_id,created_by)
    values(order_row.barbershop_id,'expense','service_order','Taxa de pagamento · comanda '||left(target_order::text,8),fee,target_payment_method,sale_row.id,auth.uid()); end if;
  insert into public.commission_entries(barbershop_id,sale_id,service_order_id,staff_profile_id,service_gross,product_gross,fee_share,commission_rate,product_commission_rate,commission_amount)
  values(order_row.barbershop_id,sale_row.id,target_order,staff_row.id,appointment_row.price,product_total,fee,staff_row.commission_rate,staff_row.product_commission_rate,commission);
  update public.service_orders set status='closed',updated_at=now() where id=target_order;
  update public.appointments set status='completed',updated_at=now() where id=appointment_row.id and status is distinct from 'completed';
  insert into public.automation_runs(barbershop_id,event_key,idempotency_key,status,details)
  values(order_row.barbershop_id,'service_order.paid','service_order.paid:'||target_order,'completed',jsonb_build_object('saleId',sale_row.id,'commission',commission,'stockLines',jsonb_array_length(coalesce((select jsonb_agg(id) from public.service_order_items where order_id=target_order),'[]'::jsonb)))) on conflict do nothing;
  return sale_row;
end $function$;

-- public.create_admin_appointment(uuid, text, text, uuid, uuid, timestamp with time zone, text, uuid, integer, integer)
CREATE OR REPLACE FUNCTION public.create_admin_appointment(target_shop uuid, customer_name text, customer_phone text, target_service uuid, target_staff uuid, requested_start timestamp with time zone, appointment_notes text DEFAULT ''::text, target_resource uuid DEFAULT NULL::uuid, requested_duration integer DEFAULT NULL::integer, requested_party_size integer DEFAULT 1)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  shop public.barbershops%rowtype;
  svc public.services%rowtype;
  client uuid;
  booking uuid;
  assigned_staff uuid := target_staff;
  duration integer;
  requested_end timestamptz;
  local_start timestamp;
  local_end timestamp;
  day_key text;
  day_hours jsonb;
  day_start timestamptz;
  day_end timestamptz;
begin
  if not public.has_barbershop_role(target_shop, array['owner','manager','barber','receptionist']::public.member_role[]) then
    raise exception 'Acesso não autorizado';
  end if;
  select * into shop from public.barbershops where id = target_shop;
  if not found then raise exception 'Negócio não encontrado'; end if;
  if requested_start <= now() or requested_start > now() + interval '365 days' then
    raise exception 'Escolha uma data e horário futuros';
  end if;
  if length(trim(customer_name)) < 2 or length(regexp_replace(customer_phone, '[^0-9]', '', 'g')) not between 10 and 13 then
    raise exception 'Confira o nome e telefone do cliente';
  end if;
  if target_resource is not null then raise exception 'Agendamentos por sala ou recurso não estão habilitados'; end if;
  select * into svc from public.services where id = target_service and barbershop_id = target_shop and active;
  if not found then raise exception 'Serviço indisponível'; end if;
  duration := coalesce(requested_duration, svc.duration_minutes);
  if duration < svc.min_duration_minutes or duration > svc.max_duration_minutes
     or (svc.booking_unit in ('days','nights') and duration % 1440 <> 0)
     or (svc.booking_unit = 'hours' and duration % 60 <> 0) then
    raise exception 'Duração inválida para este serviço';
  end if;
  if requested_party_size <> 1 then raise exception 'Confira os dados do agendamento'; end if;
  requested_end := requested_start + make_interval(mins => duration);
  local_start := requested_start at time zone shop.timezone;
  local_end := requested_end at time zone shop.timezone;
  day_key := case extract(isodow from local_start)::integer
    when 1 then 'mon' when 2 then 'tue' when 3 then 'wed'
    when 4 then 'thu' when 5 then 'fri' when 6 then 'sat' else 'sun' end;
  day_hours := shop.opening_hours -> day_key;
  if day_hours is null or coalesce((day_hours ->> 'closed')::boolean, false)
     or local_start::time < (day_hours ->> 'open')::time then
    raise exception 'Esse dia ou horário está fora do expediente';
  end if;
  if svc.booking_unit in ('minutes', 'hours') then
    if local_start::date <> local_end::date or local_end::time > (day_hours ->> 'close')::time then
      raise exception 'O serviço termina depois do fechamento';
    end if;
  elsif local_start::time <> shop.check_in_time or duration % 1440 <> 0 then
    raise exception 'Confira o horário inicial e a duração do serviço';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_shop::text, 0));
  if assigned_staff is not null and not exists (
    select 1 from public.staff_profiles where id = assigned_staff and barbershop_id = target_shop and active
  ) then raise exception 'O profissional selecionado não está disponível'; end if;
  day_start := (local_start::date::timestamp at time zone shop.timezone);
  day_end := ((local_start::date + 1)::timestamp at time zone shop.timezone);
  if assigned_staff is null and svc.requires_professional then
    select sp.id into assigned_staff
    from public.staff_profiles sp
    where sp.barbershop_id = target_shop and sp.active
      and not exists (
        select 1 from public.appointments a
        where a.barbershop_id = target_shop and a.staff_profile_id = sp.id
          and a.status not in ('cancelled','no_show')
          and tstzrange(a.starts_at, a.starts_at + make_interval(mins => a.duration_minutes), '[)')
              && tstzrange(requested_start, requested_end, '[)')
      )
    order by (
      select count(*) from public.appointments a
      where a.barbershop_id = target_shop and a.staff_profile_id = sp.id
        and a.status not in ('cancelled','no_show') and a.starts_at >= day_start and a.starts_at < day_end
    ), sp.display_name
    limit 1;
    if assigned_staff is null then raise exception 'Não há profissional disponível nesse horário. Escolha outro horário.'; end if;
  end if;
  if exists (
    select 1 from public.appointments a
    where a.barbershop_id = target_shop and a.status not in ('cancelled','no_show')
      and ((assigned_staff is not null and a.staff_profile_id = assigned_staff)
        or (assigned_staff is null and a.staff_profile_id is null))
      and tstzrange(a.starts_at, a.starts_at + make_interval(mins => a.duration_minutes), '[)')
          && tstzrange(requested_start, requested_end, '[)')
  ) then raise exception 'Esse profissional já tem um atendimento nesse horário. Escolha outro horário.'; end if;

  insert into public.clients(barbershop_id, name, phone)
  values (target_shop, trim(customer_name), trim(customer_phone))
  on conflict (barbershop_id, phone_normalized) do update
    set name = excluded.name, phone = excluded.phone, updated_at = now()
  returning id into client;
  insert into public.appointments(barbershop_id, client_id, service_id, staff_profile_id,
    resource_id, party_size, starts_at, duration_minutes, price, source, notes)
  values (target_shop, client, svc.id, assigned_staff, null, 1, requested_start, duration,
    svc.price * case when svc.booking_unit in ('days','nights','hours')
      then greatest(1, duration / case when svc.booking_unit in ('days','nights') then 1440 else 60 end)
      else 1 end,
    'admin', left(trim(appointment_notes), 500))
  returning id into booking;
  return booking;
end
$function$;

-- public.create_internal_booking(uuid, uuid, uuid, date, time without time zone, text, text, boolean)
CREATE OR REPLACE FUNCTION public.create_internal_booking(target_shop uuid, target_service uuid, target_staff uuid, target_date date, target_time time without time zone, customer_name text, customer_phone text, allow_whatsapp boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare shop_row public.barbershops%rowtype;
begin
  if auth.uid() is null or not public.has_barbershop_role(target_shop,array['owner','manager','receptionist']::public.member_role[]) then raise exception 'Acesso negado para criar agendamento neste negócio'; end if;
  select * into shop_row from public.barbershops where id=target_shop;
  if not found then raise exception 'Empresa não encontrada'; end if;
  return public.create_public_booking(shop_row.slug,target_service,target_staff,(target_date+target_time) at time zone shop_row.timezone,customer_name,customer_phone,allow_whatsapp);
end $function$;

-- public.create_public_booking(text, uuid, uuid, timestamp with time zone, text, text, boolean)
CREATE OR REPLACE FUNCTION public.create_public_booking(target_slug text, target_service uuid, target_staff uuid, target_start timestamp with time zone, customer_name text, customer_phone text, allow_whatsapp boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare shop_row public.barbershops%rowtype; service_row public.services%rowtype; staff_row public.staff_profiles%rowtype;
  client_uuid uuid; appointment_uuid uuid; token_value text:=encode(extensions.gen_random_bytes(32),'hex'); normalized_phone text; opening jsonb; local_start timestamp;
begin
  select * into shop_row from public.barbershops where slug=target_slug and active_modules @> array['agenda']::text[];
  if not found then raise exception 'Estabelecimento não encontrado'; end if;
  select * into service_row from public.services where id=target_service and barbershop_id=shop_row.id and active;
  if not found then raise exception 'Serviço indisponível'; end if;
  select * into staff_row from public.staff_profiles where id=target_staff and barbershop_id=shop_row.id and active;
  if not found then raise exception 'Profissional indisponível'; end if;
  normalized_phone:=public.normalize_br_phone(customer_phone);
  if length(trim(customer_name)) not between 2 and 120 or length(normalized_phone) not between 10 and 11 then raise exception 'Confira nome e telefone'; end if;
  if target_start<=now() or target_start>now()+interval '60 days' or extract(minute from target_start)::integer % 15<>0 then raise exception 'Escolha um horário disponível'; end if;
  local_start:=target_start at time zone shop_row.timezone;
  opening:=shop_row.opening_hours->case extract(isodow from local_start::date)::integer when 1 then 'mon' when 2 then 'tue' when 3 then 'wed' when 4 then 'thu' when 5 then 'fri' when 6 then 'sat' else 'sun' end;
  if coalesce((opening->>'closed')::boolean,false) or coalesce(opening->>'open','')='' or local_start::time<(opening->>'open')::time or local_start::time+make_interval(mins=>service_row.duration_minutes)>(opening->>'close')::time then raise exception 'Horário fora do funcionamento'; end if;
  perform pg_advisory_xact_lock(hashtextextended(shop_row.id::text||target_staff::text,0));
  if exists(select 1 from public.appointments a where a.barbershop_id=shop_row.id and a.staff_profile_id=target_staff and a.status in ('requested','scheduled','confirmed','in_progress') and a.starts_at<target_start+make_interval(mins=>service_row.duration_minutes) and a.ends_at>target_start) then raise exception 'Este horário acabou de ser reservado. Escolha outro.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(shop_row.id::text||normalized_phone,1));
  select id into client_uuid from public.clients where barbershop_id=shop_row.id and phone_normalized=normalized_phone limit 1;
  if client_uuid is null then
    insert into public.clients(barbershop_id,name,full_name,phone,phone_normalized,whatsapp_consent,whatsapp_opt_in)
    values(shop_row.id,trim(customer_name),trim(customer_name),normalized_phone,normalized_phone,allow_whatsapp,allow_whatsapp) returning id into client_uuid;
  else
    update public.clients set name=trim(customer_name),full_name=trim(customer_name),phone=normalized_phone,phone_normalized=normalized_phone,
      whatsapp_consent=whatsapp_consent or allow_whatsapp,whatsapp_opt_in=whatsapp_opt_in or allow_whatsapp,updated_at=now() where id=client_uuid;
  end if;
  update public.clients set booking_count=booking_count+1,last_booked_at=target_start,preferred_service_id=service_row.id,preferred_staff_profile_id=staff_row.id,updated_at=now() where id=client_uuid;
  insert into public.appointments(barbershop_id,client_id,service_id,staff_profile_id,starts_at,ends_at,duration_minutes,price,status,source,customer_token_hash)
  values(shop_row.id,client_uuid,service_row.id,staff_row.id,target_start,target_start+make_interval(mins=>service_row.duration_minutes),service_row.duration_minutes,service_row.price,'scheduled','public',encode(extensions.digest(token_value,'sha256'),'hex')) returning id into appointment_uuid;
  insert into public.service_orders(barbershop_id,appointment_id) values(shop_row.id,appointment_uuid);
  insert into public.automation_runs(barbershop_id,event_key,idempotency_key,status,details)
  values(shop_row.id,'appointment.created','appointment.created:'||appointment_uuid,'completed',jsonb_build_object('clientId',client_uuid,'appointmentId',appointment_uuid)) on conflict do nothing;
  return jsonb_build_object('appointment_id',appointment_uuid,'customer_token',token_value,'business_name',shop_row.name,'service_name',service_row.name,'professional_name',staff_row.display_name,'starts_at',target_start,'duration_minutes',service_row.duration_minutes,'price',service_row.price);
end $function$;

-- public.create_public_booking(text, uuid, uuid, timestamp with time zone, text, text, uuid, integer, integer)
CREATE OR REPLACE FUNCTION public.create_public_booking(shop_slug text, target_service uuid, target_staff uuid, requested_start timestamp with time zone, customer_name text, customer_phone text, target_resource uuid DEFAULT NULL::uuid, requested_duration integer DEFAULT NULL::integer, requested_party_size integer DEFAULT 1)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  shop public.barbershops%rowtype;
  svc public.services%rowtype;
  client uuid;
  booking uuid;
  assigned_staff uuid := target_staff;
  duration integer;
  requested_end timestamptz;
  local_start timestamp;
  local_end timestamp;
  day_key text;
  day_hours jsonb;
  day_start timestamptz;
  day_end timestamptz;
begin
  select * into shop from public.barbershops where slug = lower(trim(shop_slug)) and onboarding_step = 'complete';
  if not found then raise exception 'Negócio não encontrado ou ainda não configurado'; end if;
  if requested_start <= now() or requested_start > now() + interval '365 days' then
    raise exception 'Escolha uma data e horário futuros';
  end if;
  if length(trim(customer_name)) < 2 or length(regexp_replace(customer_phone, '[^0-9]', '', 'g')) not between 10 and 13 then
    raise exception 'Confira seu nome e telefone';
  end if;
  if target_resource is not null or requested_party_size <> 1 then raise exception 'Confira os dados do agendamento'; end if;
  select * into svc from public.services where id = target_service and barbershop_id = shop.id and active;
  if not found then raise exception 'Serviço indisponível'; end if;
  duration := coalesce(requested_duration, svc.duration_minutes);
  if duration < svc.min_duration_minutes or duration > svc.max_duration_minutes
     or (svc.booking_unit in ('days','nights') and duration % 1440 <> 0)
     or (svc.booking_unit = 'hours' and duration % 60 <> 0) then
    raise exception 'Duração inválida para este serviço';
  end if;
  requested_end := requested_start + make_interval(mins => duration);
  local_start := requested_start at time zone shop.timezone;
  local_end := requested_end at time zone shop.timezone;
  day_key := case extract(isodow from local_start)::integer
    when 1 then 'mon' when 2 then 'tue' when 3 then 'wed'
    when 4 then 'thu' when 5 then 'fri' when 6 then 'sat' else 'sun' end;
  day_hours := shop.opening_hours -> day_key;
  if day_hours is null or coalesce((day_hours ->> 'closed')::boolean, false)
     or local_start::time < (day_hours ->> 'open')::time then
    raise exception 'Esse dia ou horário está fora do expediente';
  end if;
  if svc.booking_unit in ('minutes', 'hours') then
    if local_start::date <> local_end::date or local_end::time > (day_hours ->> 'close')::time then
      raise exception 'O serviço termina depois do fechamento';
    end if;
  elsif local_start::time <> shop.check_in_time or duration % 1440 <> 0 then
    raise exception 'Confira o horário inicial e a duração do serviço';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(shop.id::text, 0));
  if assigned_staff is not null and not exists (
    select 1 from public.staff_profiles where id = assigned_staff and barbershop_id = shop.id and active
  ) then raise exception 'Profissional indisponível'; end if;
  day_start := (local_start::date::timestamp at time zone shop.timezone);
  day_end := ((local_start::date + 1)::timestamp at time zone shop.timezone);
  if assigned_staff is null and svc.requires_professional then
    select sp.id into assigned_staff
    from public.staff_profiles sp
    where sp.barbershop_id = shop.id and sp.active
      and not exists (
        select 1 from public.appointments a
        where a.barbershop_id = shop.id and a.staff_profile_id = sp.id
          and a.status not in ('cancelled','no_show')
          and tstzrange(a.starts_at, a.starts_at + make_interval(mins => a.duration_minutes), '[)')
              && tstzrange(requested_start, requested_end, '[)')
      )
    order by (
      select count(*) from public.appointments a
      where a.barbershop_id = shop.id and a.staff_profile_id = sp.id
        and a.status not in ('cancelled','no_show') and a.starts_at >= day_start and a.starts_at < day_end
    ), sp.display_name
    limit 1;
    if assigned_staff is null then raise exception 'Não há profissional disponível nesse horário. Escolha outro horário.'; end if;
  end if;
  if exists (
    select 1 from public.appointments a
    where a.barbershop_id = shop.id and a.status not in ('cancelled','no_show')
      and ((assigned_staff is not null and a.staff_profile_id = assigned_staff)
        or (assigned_staff is null and a.staff_profile_id is null))
      and tstzrange(a.starts_at, a.starts_at + make_interval(mins => a.duration_minutes), '[)')
          && tstzrange(requested_start, requested_end, '[)')
  ) then raise exception 'Esse profissional já tem um atendimento nesse horário. Escolha outro horário.'; end if;

  insert into public.clients(barbershop_id, name, phone)
  values (shop.id, trim(customer_name), trim(customer_phone))
  on conflict (barbershop_id, phone_normalized) do update
    set name = excluded.name, phone = excluded.phone, updated_at = now()
  returning id into client;
  insert into public.appointments(barbershop_id, client_id, service_id, staff_profile_id,
    resource_id, party_size, starts_at, duration_minutes, price, source, status)
  values (shop.id, client, svc.id, assigned_staff, null, 1, requested_start, duration,
    svc.price * case when svc.booking_unit in ('days','nights','hours')
      then greatest(1, duration / case when svc.booking_unit in ('days','nights') then 1440 else 60 end)
      else 1 end,
    'public', 'requested')
  returning id into booking;
  return booking;
end
$function$;

-- public.enforce_appointment_schedule()
CREATE OR REPLACE FUNCTION public.enforce_appointment_schedule()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  shop public.barbershops%rowtype;
  svc public.services%rowtype;
  local_start timestamp;
  local_end timestamp;
  day_key text;
  day_hours jsonb;
  day_start timestamptz;
  day_end timestamptz;
  assigned_staff uuid;
begin
  if new.status in ('cancelled', 'no_show') then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.barbershop_id is not distinct from old.barbershop_id
     and new.service_id is not distinct from old.service_id
     and new.staff_profile_id is not distinct from old.staff_profile_id
     and new.starts_at is not distinct from old.starts_at
     and new.duration_minutes is not distinct from old.duration_minutes
     and (new.status is not distinct from old.status or old.status not in ('cancelled', 'no_show')) then
    return new;
  end if;

  if new.starts_at <= now() or new.starts_at > now() + interval '365 days' then
    raise exception 'Escolha uma data e horário futuros';
  end if;
  if new.duration_minutes < 5 or new.duration_minutes > 43200 then
    raise exception 'A duração do atendimento é inválida';
  end if;
  if new.resource_id is not null then
    raise exception 'Agendamentos por sala ou recurso não estão habilitados';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.barbershop_id::text, 0));
  select * into shop from public.barbershops where id = new.barbershop_id;
  if not found then raise exception 'Negócio não encontrado'; end if;
  select * into svc from public.services where id = new.service_id and barbershop_id = new.barbershop_id and active;
  if not found then raise exception 'Serviço indisponível'; end if;

  local_start := new.starts_at at time zone shop.timezone;
  local_end := (new.starts_at + make_interval(mins => new.duration_minutes)) at time zone shop.timezone;
  day_key := case extract(isodow from local_start)::integer
    when 1 then 'mon' when 2 then 'tue' when 3 then 'wed'
    when 4 then 'thu' when 5 then 'fri' when 6 then 'sat' else 'sun' end;
  day_hours := shop.opening_hours -> day_key;
  if day_hours is null or coalesce((day_hours ->> 'closed')::boolean, false)
     or local_start::time < (day_hours ->> 'open')::time then
    raise exception 'Esse dia ou horário está fora do expediente';
  end if;
  if svc.booking_unit in ('minutes', 'hours') then
    if local_start::date <> local_end::date or local_end::time > (day_hours ->> 'close')::time then
      raise exception 'O serviço termina depois do fechamento';
    end if;
  elsif local_start::time <> shop.check_in_time or new.duration_minutes % 1440 <> 0 then
    raise exception 'Confira o horário inicial e a duração do serviço';
  end if;

  if new.staff_profile_id is not null and not exists (
    select 1 from public.staff_profiles
    where id = new.staff_profile_id and barbershop_id = new.barbershop_id and active
  ) then
    raise exception 'O profissional selecionado não está disponível';
  end if;

  if new.staff_profile_id is null and svc.requires_professional then
    day_start := (local_start::date::timestamp at time zone shop.timezone);
    day_end := ((local_start::date + 1)::timestamp at time zone shop.timezone);
    select sp.id into assigned_staff
    from public.staff_profiles sp
    where sp.barbershop_id = new.barbershop_id and sp.active
      and not exists (
        select 1 from public.appointments a
        where a.barbershop_id = new.barbershop_id
          and a.staff_profile_id = sp.id
          and a.status not in ('cancelled', 'no_show')
          and a.id is distinct from new.id
          and tstzrange(a.starts_at, a.starts_at + make_interval(mins => a.duration_minutes), '[)')
              && tstzrange(new.starts_at, new.starts_at + make_interval(mins => new.duration_minutes), '[)')
      )
    order by (
      select count(*) from public.appointments a
      where a.barbershop_id = new.barbershop_id and a.staff_profile_id = sp.id
        and a.status not in ('cancelled', 'no_show')
        and a.starts_at >= day_start and a.starts_at < day_end
    ), sp.display_name
    limit 1;
    if assigned_staff is null then
      raise exception 'Não há profissional disponível nesse horário. Escolha outro horário.';
    end if;
    new.staff_profile_id := assigned_staff;
  end if;

  if exists (
    select 1 from public.appointments a
    where a.barbershop_id = new.barbershop_id
      and a.status not in ('cancelled', 'no_show')
      and a.id is distinct from new.id
      and ((new.staff_profile_id is not null and a.staff_profile_id = new.staff_profile_id)
        or (new.staff_profile_id is null and a.staff_profile_id is null))
      and tstzrange(a.starts_at, a.starts_at + make_interval(mins => a.duration_minutes), '[)')
          && tstzrange(new.starts_at, new.starts_at + make_interval(mins => new.duration_minutes), '[)')
  ) then
    raise exception 'Esse profissional já tem um atendimento nesse horário. Escolha outro horário.';
  end if;

  return new;
end
$function$;

-- public.finish_onboarding(uuid, text, public.member_role, numeric)
CREATE OR REPLACE FUNCTION public.finish_onboarding(target_shop uuid, staff_name text DEFAULT NULL::text, staff_role member_role DEFAULT 'barber'::member_role, commission numeric DEFAULT 0)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  owner_name text;
begin
  if not public.has_barbershop_role(target_shop, array['owner','manager']::public.member_role[]) then
    raise exception 'Negócio não encontrado ou acesso insuficiente';
  end if;
  if staff_name is not null and length(trim(staff_name)) > 0 then
    if length(trim(staff_name)) < 2 or staff_role not in ('barber','manager','receptionist') or commission < 0 or commission > 100 then
      raise exception 'Confira nome, função e comissão do profissional';
    end if;
    insert into public.staff_profiles(barbershop_id, display_name, role, commission_rate)
    values (target_shop, trim(staff_name), staff_role, commission);
  elsif not exists (select 1 from public.staff_profiles sp where sp.barbershop_id = target_shop) then
    select p.full_name into owner_name
    from public.barbershop_members m
    join public.profiles p on p.id = m.user_id
    where m.barbershop_id = target_shop and m.role = 'owner'
    order by m.created_at limit 1;
    insert into public.staff_profiles(barbershop_id, user_id, display_name, role, commission_rate)
    select target_shop, m.user_id, coalesce(nullif(trim(owner_name), ''), 'Profissional principal'), 'barber', 0
    from public.barbershop_members m
    where m.barbershop_id = target_shop and m.role = 'owner'
    order by m.created_at limit 1;
  end if;
  update public.barbershops set onboarding_step = 'complete', updated_at = now() where id = target_shop;
end
$function$;

-- public.get_public_booking_page(text)
CREATE OR REPLACE FUNCTION public.get_public_booking_page(shop_slug text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select jsonb_build_object(
  'name', b.name, 'phone', b.phone, 'address', b.address, 'timezone', b.timezone,
  'business_type', b.business_type, 'opening_hours', b.opening_hours,
  'check_in_time', b.check_in_time, 'check_out_time', b.check_out_time,
  'services', coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'category','Opções','duration_minutes',s.duration_minutes,'min_duration_minutes',s.min_duration_minutes,'max_duration_minutes',s.max_duration_minutes,'booking_unit',s.booking_unit,'price',s.price,'requires_resource',s.requires_resource,'requires_professional',s.requires_professional) order by s.name) from public.services s where s.barbershop_id=b.id and s.active), '[]'::jsonb),
  'professionals', coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.display_name) order by p.display_name) from public.staff_profiles p where p.barbershop_id=b.id and p.active), '[]'::jsonb),
  'resources', coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'name',r.name,'kind',r.kind,'capacity',r.capacity) order by r.name) from public.booking_resources r where r.barbershop_id=b.id and r.active), '[]'::jsonb)
 )
 from public.barbershops b where b.slug = lower(trim(shop_slug)) and b.onboarding_step = 'complete'
$function$;

-- public.get_public_booking_slots(text, uuid, uuid, date, uuid)
CREATE OR REPLACE FUNCTION public.get_public_booking_slots(shop_slug text, target_service uuid, target_resource uuid, target_date date, target_staff uuid)
 RETURNS TABLE(slot_time text, resource_id uuid, resource_name text, resource_capacity integer, staff_id uuid, staff_name text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  shop public.barbershops%rowtype;
  svc public.services%rowtype;
  hours jsonb;
  day_key text;
  open_at time;
  close_at time;
  step_minutes integer := 15;
begin
  select * into shop from public.barbershops b
  where b.slug = lower(trim(shop_slug)) and b.onboarding_step = 'complete';
  if not found then return; end if;
  select * into svc from public.services
  where id = target_service and barbershop_id = shop.id and active;
  if not found or target_date < (now() at time zone shop.timezone)::date
     or target_date > (now() at time zone shop.timezone)::date + 365 then return; end if;
  if target_resource is not null then return; end if;
  day_key := case extract(isodow from target_date)::integer
    when 1 then 'mon' when 2 then 'tue' when 3 then 'wed'
    when 4 then 'thu' when 5 then 'fri' when 6 then 'sat' else 'sun' end;
  hours := shop.opening_hours -> day_key;
  if hours is null or coalesce((hours ->> 'closed')::boolean, false) then return; end if;
  open_at := (hours ->> 'open')::time;
  close_at := (hours ->> 'close')::time;
  if svc.booking_unit in ('days','nights') then open_at := shop.check_in_time; end if;

  return query
  with candidates as (
    select (target_date + open_at + make_interval(mins => tick))::timestamp as starts_local
    from generate_series(0, greatest(0, floor(extract(epoch from (close_at-open_at))/60)::integer), step_minutes) as ticks(tick)
  ), slots as (
    select c.starts_local,
      (c.starts_local at time zone shop.timezone) as starts_at,
      ((c.starts_local at time zone shop.timezone) + make_interval(mins => svc.duration_minutes)) as ends_at
    from candidates c
    where (svc.booking_unit not in ('minutes','hours') or c.starts_local + make_interval(mins => svc.duration_minutes) <= target_date + close_at)
      and c.starts_local > (now() at time zone shop.timezone)
      and (svc.booking_unit not in ('days','nights') or c.starts_local::time = shop.check_in_time)
  ), staff_options as (
    select sp.id, sp.display_name
    from public.staff_profiles sp
    where sp.barbershop_id = shop.id and sp.active
      and (target_staff is null or sp.id = target_staff)
      and (svc.requires_professional or target_staff is not null)
    union all
    select null::uuid, null::text
    where not svc.requires_professional and target_staff is null
  )
  select to_char(s.starts_local, 'HH24:MI'), null::uuid, null::text, null::integer, p.id, p.display_name
  from slots s cross join staff_options p
  where (p.id is null or not exists (
    select 1 from public.appointments a
    where a.barbershop_id = shop.id and a.staff_profile_id = p.id
      and a.status not in ('cancelled','no_show')
      and tstzrange(a.starts_at, a.starts_at + make_interval(mins => a.duration_minutes), '[)')
          && tstzrange(s.starts_at, s.ends_at, '[)')
  ))
  order by s.starts_local, p.display_name nulls first;
end
$function$;

-- public.has_barbershop_role(uuid, public.member_role[])
CREATE OR REPLACE FUNCTION public.has_barbershop_role(target_id uuid, allowed member_role[])
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists (select 1 from public.barbershop_members m where m.barbershop_id = target_id and m.user_id = (select auth.uid()) and m.role = any(allowed))
$function$;

-- public.is_barbershop_member(uuid)
CREATE OR REPLACE FUNCTION public.is_barbershop_member(target_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists (select 1 from public.barbershop_members m where m.barbershop_id = target_id and m.user_id = (select auth.uid()))
$function$;

-- public.normalize_br_phone(text)
CREATE OR REPLACE FUNCTION public.normalize_br_phone(phone_value text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
 SET search_path TO ''
AS $function$
  select case
    when length(regexp_replace(coalesce(phone_value,''),'\D','','g')) in (12,13)
      and left(regexp_replace(coalesce(phone_value,''),'\D','','g'),2)='55'
      then substr(regexp_replace(coalesce(phone_value,''),'\D','','g'),3)
    else regexp_replace(coalesce(phone_value,''),'\D','','g')
  end
$function$;

-- public.prevent_duplicate_business_phone()
CREATE OR REPLACE FUNCTION public.prevent_duplicate_business_phone()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  phone_digits text := regexp_replace(coalesce(new.phone, ''), '[^0-9]', '', 'g');
begin
  if length(phone_digits) >= 10 then
    perform pg_advisory_xact_lock(hashtextextended(phone_digits, 1));
    if exists (
      select 1 from public.barbershops b
      where b.id is distinct from new.id
        and regexp_replace(b.phone, '[^0-9]', '', 'g') = phone_digits
    ) then
      raise exception 'Este telefone já está vinculado a um negócio. Entre na conta existente.';
    end if;
  end if;
  return new;
end;
$function$;

-- public.public_booking_catalog(text)
CREATE OR REPLACE FUNCTION public.public_booking_catalog(target_slug text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
select jsonb_build_object('business',jsonb_build_object('id',b.id,'name',b.name,'slug',b.slug,'phone',b.phone,'address',b.address,'timezone',b.timezone,'opening_hours',b.opening_hours),
  'services',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'duration_minutes',s.duration_minutes,'price',s.price) order by s.name) from public.services s where s.barbershop_id=b.id and s.active),'[]'::jsonb),
  'professionals',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.display_name) order by p.display_name) from public.staff_profiles p where p.barbershop_id=b.id and p.active),'[]'::jsonb))
from public.barbershops b where b.slug=target_slug and b.active_modules @> array['agenda']::text[] limit 1
$function$;

-- public.public_booking_slots(text, uuid, date, uuid)
CREATE OR REPLACE FUNCTION public.public_booking_slots(target_slug text, target_service uuid, target_day date, target_staff uuid DEFAULT NULL::uuid)
 RETURNS TABLE(starts_at timestamp with time zone, staff_profile_id uuid, staff_name text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare shop public.barbershops%rowtype; duration_value integer; day_config jsonb; local_open timestamp; local_close timestamp;
begin
  select * into shop from public.barbershops where slug=target_slug and active_modules @> array['agenda']::text[];
  if not found or target_day<(now() at time zone shop.timezone)::date or target_day>(now() at time zone shop.timezone)::date+60 then return; end if;
  select duration_minutes into duration_value from public.services where id=target_service and barbershop_id=shop.id and active;
  if duration_value is null then return; end if;
  day_config:=shop.opening_hours->case extract(isodow from target_day)::integer when 1 then 'mon' when 2 then 'tue' when 3 then 'wed' when 4 then 'thu' when 5 then 'fri' when 6 then 'sat' else 'sun' end;
  if coalesce((day_config->>'closed')::boolean,false) or coalesce(day_config->>'open','')='' then return; end if;
  local_open:=target_day+(day_config->>'open')::time; local_close:=target_day+(day_config->>'close')::time-make_interval(mins=>duration_value);
  return query select slot.local_time at time zone shop.timezone, staff.id, staff.display_name from generate_series(local_open,local_close,interval '15 minutes') slot(local_time)
  cross join public.staff_profiles staff where staff.barbershop_id=shop.id and staff.active and (target_staff is null or staff.id=target_staff)
  and slot.local_time>(now() at time zone shop.timezone) and not exists(select 1 from public.appointments a where a.barbershop_id=shop.id and a.staff_profile_id=staff.id
    and a.status in ('requested','scheduled','confirmed','in_progress') and a.starts_at<(slot.local_time+make_interval(mins=>duration_value)) at time zone shop.timezone and a.ends_at>slot.local_time at time zone shop.timezone);
end $function$;

-- public.public_order_details(text)
CREATE OR REPLACE FUNCTION public.public_order_details(customer_token text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
select jsonb_build_object('business',jsonb_build_object('name',b.name,'slug',b.slug,'phone',b.phone),
  'appointment',jsonb_build_object('id',a.id,'starts_at',a.starts_at,'status',a.status,'client_name',c.full_name,'service_name',s.name,'professional_name',p.display_name,'duration_minutes',a.duration_minutes,'service_price',a.price),
  'order',jsonb_build_object('id',o.id,'status',o.status,'items',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'product_id',i.product_id,'name',i.product_name,'quantity',i.quantity,'unit_price',i.unit_price,'line_total',i.quantity*i.unit_price) order by i.created_at) from public.service_order_items i where i.order_id=o.id),'[]'::jsonb)),
  'products',coalesce((select jsonb_agg(jsonb_build_object('id',pr.id,'name',pr.name,'price',pr.unit_price,'available',pr.quantity-pr.reserved_quantity) order by pr.name) from public.products pr where pr.barbershop_id=b.id and pr.active and pr.available_to_customer and pr.quantity>pr.reserved_quantity),'[]'::jsonb))
from public.appointments a join public.barbershops b on b.id=a.barbershop_id join public.clients c on c.id=a.client_id left join public.services s on s.id=a.service_id left join public.staff_profiles p on p.id=a.staff_profile_id join public.service_orders o on o.appointment_id=a.id
where a.customer_token_hash=encode(extensions.digest(customer_token,'sha256'),'hex') and a.status in ('requested','scheduled','confirmed','in_progress') limit 1
$function$;

-- public.refresh_smart_alerts()
CREATE OR REPLACE FUNCTION public.refresh_smart_alerts()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare changed integer:=0; affected integer:=0;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'Service role required'; end if;
  insert into public.central_alerts(barbershop_id,alert_type,dedupe_key,title,summary,severity,product_id,metadata,last_detected_at,updated_at)
  select p.barbershop_id,'inventory_low','inventory_low:'||p.id,'Produto no nível mínimo de estoque',p.name||' está com '||(p.quantity-p.reserved_quantity)||' unidade(s); mínimo definido: '||p.minimum_quantity||'.','warning',p.id,jsonb_build_object('productName',p.name,'quantity',p.quantity-p.reserved_quantity,'minimumQuantity',p.minimum_quantity),now(),now()
  from public.products p join public.barbershops b on b.id=p.barbershop_id where p.active and p.quantity-p.reserved_quantity<=p.minimum_quantity and b.active_modules @> array['alertas']::text[]
  on conflict(barbershop_id,dedupe_key) do update set title=excluded.title,summary=excluded.summary,metadata=excluded.metadata,last_detected_at=now(),updated_at=now(),status=case when central_alerts.status='dismissed' then 'dismissed' else 'open' end;
  get diagnostics changed=row_count; affected:=affected+changed;
  with gaps as(select a.barbershop_id,a.client_id,a.starts_at,lag(a.starts_at) over(partition by a.barbershop_id,a.client_id order by a.starts_at) previous_at from public.appointments a where a.status='completed'),
  averages as(select barbershop_id,client_id,max(starts_at) last_at,avg(extract(epoch from(starts_at-previous_at))/86400.0) average_days from gaps group by barbershop_id,client_id having count(previous_at)>=2),
  due as(select av.*,c.full_name,c.phone,c.whatsapp_opt_in,round(extract(epoch from(now()-av.last_at))/86400)::integer days_since from averages av join public.clients c on c.id=av.client_id where av.average_days>0 and now()>av.last_at+make_interval(secs=>(av.average_days*1.2*86400)::double precision))
  insert into public.central_alerts(barbershop_id,alert_type,dedupe_key,title,summary,severity,client_id,metadata,last_detected_at,updated_at)
  select d.barbershop_id,'client_return','client_return:'||d.client_id,'Cliente pode estar na hora de voltar',d.full_name||' está há '||d.days_since||' dias sem atendimento.','info',d.client_id,jsonb_build_object('phone',d.phone,'whatsappOptIn',d.whatsapp_opt_in,'daysSinceVisit',d.days_since,'averageGapDays',round(d.average_days)),now(),now()
  from due d join public.barbershops b on b.id=d.barbershop_id where b.active_modules @> array['alertas']::text[]
  on conflict(barbershop_id,dedupe_key) do update set title=excluded.title,summary=excluded.summary,metadata=excluded.metadata,last_detected_at=now(),updated_at=now(),status=case when central_alerts.status='dismissed' then 'dismissed' else 'open' end;
  get diagnostics changed=row_count; affected:=affected+changed;
  return affected;
end $function$;

-- public.register_pdv_sale(uuid, uuid, text, jsonb)
CREATE OR REPLACE FUNCTION public.register_pdv_sale(target_shop uuid, target_client uuid, target_payment_method text, target_items jsonb)
 RETURNS sales
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare sale_row public.sales%rowtype; item jsonb; product_row public.products%rowtype; amount numeric; total_amount_value numeric:=0;
begin
  if auth.uid() is null or not public.has_barbershop_role(target_shop,array['owner','manager','receptionist']::public.member_role[]) then raise exception 'Acesso negado ao caixa deste negócio'; end if;
  if target_payment_method not in ('pix','cash','debit_card','credit_card') or jsonb_typeof(target_items)<>'array' or jsonb_array_length(target_items)=0 then raise exception 'Confira pagamento e itens'; end if;
  if target_client is not null and not exists(select 1 from public.clients where id=target_client and barbershop_id=target_shop) then raise exception 'Cliente não pertence a este negócio'; end if;
  insert into public.sales(barbershop_id,client_id,created_by,subtotal,total,total_amount,payment_method,status) values(target_shop,target_client,auth.uid(),0,0,0,target_payment_method,'paid') returning * into sale_row;
  for item in select value from jsonb_array_elements(target_items) loop
    select * into product_row from public.products where id=(item->>'product_id')::uuid and barbershop_id=target_shop and active for update;
    if not found then raise exception 'Produto não encontrado'; end if;
    amount:=(item->>'quantity')::numeric;
    if amount<=0 or amount>100 or product_row.quantity-product_row.reserved_quantity<amount then raise exception 'Estoque insuficiente para %',product_row.name; end if;
    insert into public.sale_items(sale_id,product_id,service_id,item_name,product_name,quantity,unit_price,total,barbershop_id)
    values(sale_row.id,product_row.id,null,product_row.name,product_row.name,amount::integer,product_row.unit_price,round(amount*product_row.unit_price,2),target_shop);
    total_amount_value:=total_amount_value+round(amount*product_row.unit_price,2);
    update public.products set quantity=quantity-amount,updated_at=now() where id=product_row.id;
  end loop;
  if total_amount_value<=0 then raise exception 'O total da venda precisa ser maior que zero'; end if;
  update public.sales set subtotal=total_amount_value,total=total_amount_value,total_amount=total_amount_value where id=sale_row.id returning * into sale_row;
  insert into public.cash_movements(barbershop_id,kind,source,description,amount,payment_method,sale_id,created_by) values(target_shop,'income','pdv','Venda PDV '||left(sale_row.id::text,8),total_amount_value,target_payment_method,sale_row.id,auth.uid());
  insert into public.automation_runs(barbershop_id,event_key,idempotency_key,status,details) values(target_shop,'sale.paid','sale.paid:'||sale_row.id,'completed',jsonb_build_object('saleId',sale_row.id)) on conflict do nothing;
  return sale_row;
end $function$;

-- public.remove_public_order_item(text, uuid)
CREATE OR REPLACE FUNCTION public.remove_public_order_item(customer_token text, target_item uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare order_uuid uuid; item_row public.service_order_items%rowtype;
begin
  select o.id into order_uuid from public.appointments a join public.service_orders o on o.appointment_id=a.id
  where a.customer_token_hash=encode(extensions.digest(customer_token,'sha256'),'hex') and a.status in ('requested','scheduled','confirmed','in_progress') and o.status='open' limit 1;
  if order_uuid is null then raise exception 'Comanda não encontrada ou já encerrada'; end if;
  select * into item_row from public.service_order_items where id=target_item and order_id=order_uuid for update;
  if not found then raise exception 'Item não encontrado'; end if;
  if item_row.product_id is not null then update public.products set reserved_quantity=greatest(0,reserved_quantity-item_row.quantity),updated_at=now() where id=item_row.product_id; end if;
  delete from public.service_order_items where id=target_item;
end $function$;

-- public.rls_auto_enable()
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        SELECT c.relname INTO tbl FROM pg_catalog.pg_class c WHERE c.oid = cmd.objid;
        EXECUTE format('alter table if exists %I.%I enable row level security', cmd.schema_name, tbl);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

-- public.update_appointment_status(uuid, text)
CREATE OR REPLACE FUNCTION public.update_appointment_status(target_appointment uuid, target_status text)
 RETURNS appointments
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare appointment_row public.appointments%rowtype;
begin
  if target_status not in ('confirmed','in_progress','cancelled','no_show') then raise exception 'Status inválido'; end if;
  select * into appointment_row from public.appointments where id=target_appointment for update;
  if not found or not public.has_barbershop_role(appointment_row.barbershop_id,array['owner','manager','receptionist','barber']::public.member_role[]) then raise exception 'Agendamento não encontrado ou acesso negado'; end if;
  if appointment_row.status not in ('requested','scheduled','confirmed','in_progress') then raise exception 'Este agendamento já foi finalizado'; end if;
  update public.appointments set status=target_status,updated_at=now() where id=target_appointment returning * into appointment_row;
  if target_status in ('cancelled','no_show') then update public.service_orders set status='cancelled',updated_at=now() where appointment_id=target_appointment and status='open'; end if;
  insert into public.automation_runs(barbershop_id,event_key,idempotency_key,status,details) values(appointment_row.barbershop_id,'appointment.'||target_status,'appointment.'||target_status||':'||target_appointment,'completed',jsonb_build_object('appointmentId',target_appointment)) on conflict do nothing;
  return appointment_row;
end $function$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
drop trigger if exists prevent_duplicate_business_phone on public.barbershops;
CREATE TRIGGER prevent_duplicate_business_phone BEFORE INSERT OR UPDATE OF phone ON public.barbershops FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_business_phone();
drop trigger if exists appointments_enforce_schedule on public.appointments;
CREATE TRIGGER appointments_enforce_schedule BEFORE INSERT OR UPDATE OF barbershop_id, service_id, staff_profile_id, starts_at, duration_minutes, status ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.enforce_appointment_schedule();
drop trigger if exists carvel_sync_legacy_client_columns on public.clients;
CREATE TRIGGER carvel_sync_legacy_client_columns BEFORE INSERT OR UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.carvel_sync_legacy_client_columns();
drop trigger if exists carvel_sync_appointment_end on public.appointments;
CREATE TRIGGER carvel_sync_appointment_end BEFORE INSERT OR UPDATE OF starts_at, duration_minutes, ends_at ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.carvel_sync_appointment_end();
drop trigger if exists carvel_sync_legacy_product_columns on public.products;
CREATE TRIGGER carvel_sync_legacy_product_columns BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.carvel_sync_legacy_product_columns();
drop trigger if exists carvel_sync_legacy_sales_columns on public.sales;
CREATE TRIGGER carvel_sync_legacy_sales_columns BEFORE INSERT OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.carvel_sync_legacy_sales_columns();
drop trigger if exists carvel_track_completed_appointment on public.appointments;
CREATE TRIGGER carvel_track_completed_appointment AFTER UPDATE OF status ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.carvel_track_completed_appointment();

-- ---------------------------------------------------------------------------
-- Row Level Security e políticas
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.barbershops enable row level security;
alter table public.barbershop_members enable row level security;
alter table public.services enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.booking_resources enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.products enable row level security;
alter table public.cash_sessions enable row level security;
alter table public.service_orders enable row level security;
alter table public.service_order_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.cash_movements enable row level security;
alter table public.cash_transactions enable row level security;
alter table public.commission_entries enable row level security;
alter table public.payment_fee_rates enable row level security;
alter table public.central_alerts enable row level security;
alter table public.automation_settings enable row level security;
alter table public.automation_runs enable row level security;
alter table public.message_outbox enable row level security;
drop policy if exists "Members create appointments" on public.appointments;
create policy "Members create appointments" on public.appointments for insert to authenticated
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'barber'::member_role, 'receptionist'::member_role]));
drop policy if exists "Members read appointments" on public.appointments;
create policy "Members read appointments" on public.appointments for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Members update appointments" on public.appointments;
create policy "Members update appointments" on public.appointments for update to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'barber'::member_role, 'receptionist'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'barber'::member_role, 'receptionist'::member_role]));
drop policy if exists "Owners managers delete appointments" on public.appointments;
create policy "Owners managers delete appointments" on public.appointments for delete to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Members read automation runs" on public.automation_runs;
create policy "Members read automation runs" on public.automation_runs for select to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Members read automation settings" on public.automation_settings;
create policy "Members read automation settings" on public.automation_settings for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Owners managers manage automation settings" on public.automation_settings;
create policy "Owners managers manage automation settings" on public.automation_settings for all to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Members read memberships" on public.barbershop_members;
create policy "Members read memberships" on public.barbershop_members for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Shop creator adds self as owner" on public.barbershop_members;
create policy "Shop creator adds self as owner" on public.barbershop_members for insert to authenticated
  with check (((user_id = ( SELECT auth.uid() AS uid)) AND (role = 'owner'::member_role) AND (NOT is_barbershop_member(barbershop_id))));
drop policy if exists "Authenticated users create shops" on public.barbershops;
create policy "Authenticated users create shops" on public.barbershops for insert to authenticated
  with check (true);
drop policy if exists "Members read their shops" on public.barbershops;
create policy "Members read their shops" on public.barbershops for select to authenticated
  using (is_barbershop_member(id));
drop policy if exists "Owners and managers update shop" on public.barbershops;
create policy "Owners and managers update shop" on public.barbershops for update to authenticated
  using (has_barbershop_role(id, ARRAY['owner'::member_role, 'manager'::member_role]))
  with check (has_barbershop_role(id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Owners delete shop" on public.barbershops;
create policy "Owners delete shop" on public.barbershops for delete to authenticated
  using (has_barbershop_role(id, ARRAY['owner'::member_role]));
drop policy if exists "Managers manage booking resources" on public.booking_resources;
create policy "Managers manage booking resources" on public.booking_resources for all to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Members read booking resources" on public.booking_resources;
create policy "Members read booking resources" on public.booking_resources for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Managers create manual cash movements" on public.cash_movements;
create policy "Managers create manual cash movements" on public.cash_movements for insert to authenticated
  with check (((source = 'manual'::text) AND has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role])));
drop policy if exists "Members read cash movements" on public.cash_movements;
create policy "Members read cash movements" on public.cash_movements for select to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'receptionist'::member_role]));
drop policy if exists "Managers manage cash sessions" on public.cash_sessions;
create policy "Managers manage cash sessions" on public.cash_sessions for all to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'receptionist'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'receptionist'::member_role]));
drop policy if exists "Members read cash sessions" on public.cash_sessions;
create policy "Members read cash sessions" on public.cash_sessions for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Cash operators create transactions" on public.cash_transactions;
create policy "Cash operators create transactions" on public.cash_transactions for insert to authenticated
  with check (((created_by = ( SELECT auth.uid() AS uid)) AND has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'receptionist'::member_role])));
drop policy if exists "Members read cash transactions" on public.cash_transactions;
create policy "Members read cash transactions" on public.cash_transactions for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Owners managers delete cash transactions" on public.cash_transactions;
create policy "Owners managers delete cash transactions" on public.cash_transactions for delete to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Managers resolve central alerts" on public.central_alerts;
create policy "Managers resolve central alerts" on public.central_alerts for update to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Members read central alerts" on public.central_alerts;
create policy "Members read central alerts" on public.central_alerts for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Members create clients" on public.clients;
create policy "Members create clients" on public.clients for insert to authenticated
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'barber'::member_role, 'receptionist'::member_role]));
drop policy if exists "Members read clients" on public.clients;
create policy "Members read clients" on public.clients for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Members update clients" on public.clients;
create policy "Members update clients" on public.clients for update to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'barber'::member_role, 'receptionist'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'barber'::member_role, 'receptionist'::member_role]));
drop policy if exists "Owners managers delete clients" on public.clients;
create policy "Owners managers delete clients" on public.clients for delete to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Owners and partners read commissions" on public.commission_entries;
create policy "Owners and partners read commissions" on public.commission_entries for select to authenticated
  using ((has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]) OR (EXISTS ( SELECT 1
   FROM staff_profiles sp
  WHERE ((sp.id = commission_entries.staff_profile_id) AND (sp.user_id = auth.uid()))))));
drop policy if exists "Managers create message outbox" on public.message_outbox;
create policy "Managers create message outbox" on public.message_outbox for insert to authenticated
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'receptionist'::member_role]));
drop policy if exists "Members read message outbox" on public.message_outbox;
create policy "Members read message outbox" on public.message_outbox for select to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'receptionist'::member_role]));
drop policy if exists "Managers read payment fee rates" on public.payment_fee_rates;
create policy "Managers read payment fee rates" on public.payment_fee_rates for select to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Owners manage payment fee rates" on public.payment_fee_rates;
create policy "Owners manage payment fee rates" on public.payment_fee_rates for all to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role]));
drop policy if exists "Members read products" on public.products;
create policy "Members read products" on public.products for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Owners managers manage products" on public.products;
create policy "Owners managers manage products" on public.products for all to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile" on public.profiles for insert to authenticated
  with check ((id = ( SELECT auth.uid() AS uid)));
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated
  using ((id = ( SELECT auth.uid() AS uid)));
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated
  using ((id = ( SELECT auth.uid() AS uid)))
  with check ((id = ( SELECT auth.uid() AS uid)));
drop policy if exists "Cash operators create sale items" on public.sale_items;
create policy "Cash operators create sale items" on public.sale_items for insert to authenticated
  with check ((EXISTS ( SELECT 1
   FROM sales s
  WHERE ((s.id = sale_items.sale_id) AND has_barbershop_role(s.barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'receptionist'::member_role])))));
drop policy if exists "Members read sale items" on public.sale_items;
create policy "Members read sale items" on public.sale_items for select to authenticated
  using ((EXISTS ( SELECT 1
   FROM sales s
  WHERE ((s.id = sale_items.sale_id) AND is_barbershop_member(s.barbershop_id)))));
drop policy if exists "Cash operators create sales" on public.sales;
create policy "Cash operators create sales" on public.sales for insert to authenticated
  with check (((created_by = ( SELECT auth.uid() AS uid)) AND has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role, 'receptionist'::member_role])));
drop policy if exists "Members read sales" on public.sales;
create policy "Members read sales" on public.sales for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Members read service order items" on public.service_order_items;
create policy "Members read service order items" on public.service_order_items for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Members read service orders" on public.service_orders;
create policy "Members read service orders" on public.service_orders for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Members read services" on public.services;
create policy "Members read services" on public.services for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Owners managers create services" on public.services;
create policy "Owners managers create services" on public.services for insert to authenticated
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Owners managers delete services" on public.services;
create policy "Owners managers delete services" on public.services for delete to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Owners managers update services" on public.services;
create policy "Owners managers update services" on public.services for update to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Members read staff profiles" on public.staff_profiles;
create policy "Members read staff profiles" on public.staff_profiles for select to authenticated
  using (is_barbershop_member(barbershop_id));
drop policy if exists "Owners managers create staff profiles" on public.staff_profiles;
create policy "Owners managers create staff profiles" on public.staff_profiles for insert to authenticated
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Owners managers delete staff profiles" on public.staff_profiles;
create policy "Owners managers delete staff profiles" on public.staff_profiles for delete to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));
drop policy if exists "Owners managers update staff profiles" on public.staff_profiles;
create policy "Owners managers update staff profiles" on public.staff_profiles for update to authenticated
  using (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]))
  with check (has_barbershop_role(barbershop_id, ARRAY['owner'::member_role, 'manager'::member_role]));

-- ---------------------------------------------------------------------------
-- Grants de EXECUTE capturados (anon/authenticated). Funções que não aparecem
-- aqui não tinham grant explícito para esses papéis no momento da leitura.
-- Observação: refresh_smart_alerts exige auth.role() = 'service_role' (job de
-- backend) e não é executável pelo app.
-- ---------------------------------------------------------------------------
grant execute on function public.add_public_order_item(text, uuid, numeric) to anon, authenticated;
grant execute on function public.advance_appointment(uuid, text) to authenticated;
grant execute on function public.advance_onboarding(uuid, public.onboarding_step) to authenticated;
grant execute on function public.bootstrap_barbershop(text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.bootstrap_barbershop(text, text, text, text, text, text, text, text, text[]) to authenticated;
grant execute on function public.close_service_order(uuid, text) to authenticated;
grant execute on function public.create_admin_appointment(uuid, text, text, uuid, uuid, timestamp with time zone, text, uuid, integer, integer) to authenticated;
grant execute on function public.create_internal_booking(uuid, uuid, uuid, date, time without time zone, text, text, boolean) to authenticated;
grant execute on function public.create_public_booking(text, uuid, uuid, timestamp with time zone, text, text, boolean) to anon, authenticated;
grant execute on function public.create_public_booking(text, uuid, uuid, timestamp with time zone, text, text, uuid, integer, integer) to anon, authenticated;
grant execute on function public.finish_onboarding(uuid, text, public.member_role, numeric) to authenticated;
grant execute on function public.get_public_booking_page(text) to anon, authenticated;
grant execute on function public.get_public_booking_slots(text, uuid, uuid, date, uuid) to anon, authenticated;
grant execute on function public.has_barbershop_role(uuid, public.member_role[]) to authenticated;
grant execute on function public.is_barbershop_member(uuid) to authenticated;
grant execute on function public.public_booking_catalog(text) to anon, authenticated;
grant execute on function public.public_booking_slots(text, uuid, date, uuid) to anon, authenticated;
grant execute on function public.public_order_details(text) to anon, authenticated;
grant execute on function public.register_pdv_sale(uuid, uuid, text, jsonb) to authenticated;
grant execute on function public.remove_public_order_item(text, uuid) to anon, authenticated;
grant execute on function public.update_appointment_status(uuid, text) to authenticated;
