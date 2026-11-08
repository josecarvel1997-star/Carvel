import type { PanelContext } from '@/lib/panel/context';
import type { Appointment, Client, Service, Staff, WorkingHour } from '@/lib/panel/types';
import { addDays, zonedToUtc } from '@/lib/time';

type Ctx = Pick<PanelContext, 'supabase' | 'shop'>;
const num = (value: unknown) => Number(value ?? 0);

export async function loadServices({ supabase, shop }: Ctx): Promise<Service[]> {
  const { data } = await supabase.from('services').select('id, name, duration_minutes, price, active').eq('barbershop_id', shop.id).order('name');
  return ((data ?? []) as Service[]).map((s) => ({ ...s, price: num(s.price), duration_minutes: num(s.duration_minutes) }));
}

export async function loadStaff({ supabase, shop }: Ctx): Promise<Staff[]> {
  const { data } = await supabase.from('staff_profiles').select('id, display_name, role, commission_rate, active').eq('barbershop_id', shop.id).order('display_name');
  return ((data ?? []) as Staff[]).map((s) => ({ ...s, commission_rate: num(s.commission_rate) }));
}

export async function loadHours({ supabase, shop }: Ctx): Promise<WorkingHour[]> {
  const { data } = await supabase.from('working_hours').select('staff_id, weekday, start_time, end_time').eq('barbershop_id', shop.id).order('start_time');
  return (data ?? []) as WorkingHour[];
}

/** Agendamentos cujo início cai entre fromDate 00:00 e (fromDate + days) 00:00 no fuso da barbearia. */
export async function loadAppointments({ supabase, shop }: Ctx, fromDate: string, days: number, opts: { includeCancelled?: boolean; staffId?: string } = {}): Promise<Appointment[]> {
  let query = supabase.from('appointments').select('id, client_id, service_id, staff_id, starts_at, ends_at, status, price, notes, source')
    .eq('barbershop_id', shop.id)
    .gte('starts_at', zonedToUtc(fromDate, '00:00', shop.timezone).toISOString())
    .lt('starts_at', zonedToUtc(addDays(fromDate, days), '00:00', shop.timezone).toISOString())
    .order('starts_at');
  if (!opts.includeCancelled) query = query.neq('status', 'cancelled');
  if (opts.staffId) query = query.eq('staff_id', opts.staffId);
  const { data } = await query.limit(2000);
  return ((data ?? []) as Appointment[]).map((a) => ({ ...a, price: num(a.price) }));
}

export async function loadClientsByIds({ supabase, shop }: Ctx, ids: string[]): Promise<Pick<Client, 'id' | 'name' | 'phone'>[]> {
  const unique = [...new Set(ids)];
  if (!unique.length) return [];
  const rows: Pick<Client, 'id' | 'name' | 'phone'>[] = [];
  for (let i = 0; i < unique.length; i += 150) {
    const { data } = await supabase.from('clients').select('id, name, phone').eq('barbershop_id', shop.id).in('id', unique.slice(i, i + 150));
    rows.push(...((data ?? []) as Pick<Client, 'id' | 'name' | 'phone'>[]));
  }
  return rows;
}

/** Lista usada no seletor de cliente do formulário de agendamento. */
export async function loadClientOptions({ supabase, shop }: Ctx) {
  const { data } = await supabase.from('clients').select('id, name, phone').eq('barbershop_id', shop.id).order('name').limit(1000);
  return (data ?? []) as Pick<Client, 'id' | 'name' | 'phone'>[];
}
