import type { PanelContext } from '@/lib/panel/context';
import type { Appointment, BookingResource, ClientOption, Product, Service, ServiceOrder, ServiceOrderItem, Staff } from '@/lib/panel/types';
import { addDays, zonedToUtc } from '@/lib/time';

type Ctx = Pick<PanelContext, 'supabase' | 'shop'>;
const num = (value: unknown) => Number(value ?? 0);
export const APPOINTMENT_COLUMNS = 'id, client_id, service_id, staff_profile_id, starts_at, ends_at, duration_minutes, status, price, notes, source';
export const normalizeAppointment = (a: Appointment): Appointment => ({ ...a, price: num(a.price), duration_minutes: num(a.duration_minutes) });

export async function loadServices({ supabase, shop }: Ctx): Promise<Service[]> {
  const { data } = await supabase.from('services').select('id, name, category, duration_minutes, price, active, requires_professional').eq('barbershop_id', shop.id).order('name');
  return ((data ?? []) as Service[]).map((s) => ({ ...s, price: num(s.price), duration_minutes: num(s.duration_minutes) }));
}

export async function loadStaff({ supabase, shop }: Ctx): Promise<Staff[]> {
  const { data } = await supabase.from('staff_profiles').select('id, display_name, role, commission_rate, product_commission_rate, active, user_id').eq('barbershop_id', shop.id).order('display_name');
  return ((data ?? []) as Staff[]).map((s) => ({ ...s, commission_rate: num(s.commission_rate), product_commission_rate: num(s.product_commission_rate) }));
}

export async function loadResources({ supabase, shop }: Ctx): Promise<BookingResource[]> {
  const { data } = await supabase.from('booking_resources').select('id, name, kind, capacity, active').eq('barbershop_id', shop.id).order('name');
  return (data ?? []) as BookingResource[];
}

export async function loadProducts({ supabase, shop }: Ctx, onlyActive = false): Promise<Product[]> {
  let query = supabase.from('products').select('id, name, category, sku, unit_price, quantity, reserved_quantity, minimum_quantity, active, available_to_customer').eq('barbershop_id', shop.id).order('name');
  if (onlyActive) query = query.eq('active', true);
  const { data } = await query.limit(1000);
  return ((data ?? []) as Product[]).map((p) => ({ ...p, unit_price: num(p.unit_price), quantity: num(p.quantity), reserved_quantity: num(p.reserved_quantity), minimum_quantity: num(p.minimum_quantity) }));
}

/** Agendamentos cujo início cai entre fromDate 00:00 e (fromDate + days) 00:00 no fuso da barbearia. */
export async function loadAppointments({ supabase, shop }: Ctx, fromDate: string, days: number, opts: { includeInactive?: boolean; staffId?: string } = {}): Promise<Appointment[]> {
  let query = supabase.from('appointments').select(APPOINTMENT_COLUMNS)
    .eq('barbershop_id', shop.id)
    .gte('starts_at', zonedToUtc(fromDate, '00:00', shop.timezone).toISOString())
    .lt('starts_at', zonedToUtc(addDays(fromDate, days), '00:00', shop.timezone).toISOString())
    .order('starts_at');
  if (!opts.includeInactive) query = query.not('status', 'in', '(cancelled,no_show)');
  if (opts.staffId) query = query.eq('staff_profile_id', opts.staffId);
  const { data } = await query.limit(2000);
  return ((data ?? []) as Appointment[]).map(normalizeAppointment);
}

export async function loadClientsByIds({ supabase, shop }: Ctx, ids: string[]): Promise<ClientOption[]> {
  const unique = [...new Set(ids)];
  if (!unique.length) return [];
  const rows: ClientOption[] = [];
  for (let i = 0; i < unique.length; i += 150) {
    const { data } = await supabase.from('clients').select('id, full_name, phone').eq('barbershop_id', shop.id).in('id', unique.slice(i, i + 150));
    rows.push(...((data ?? []) as ClientOption[]));
  }
  return rows;
}

/** Lista usada no seletor de cliente (agenda e PDV). */
export async function loadClientOptions({ supabase, shop }: Ctx): Promise<ClientOption[]> {
  const { data } = await supabase.from('clients').select('id, full_name, phone').eq('barbershop_id', shop.id).order('full_name').limit(1000);
  return (data ?? []) as ClientOption[];
}

/** Comandas (service_orders) e itens dos agendamentos informados. */
export async function loadOrders({ supabase, shop }: Ctx, appointmentIds: string[]) {
  const orders = new Map<string, ServiceOrder>();
  const items = new Map<string, ServiceOrderItem[]>();
  if (!appointmentIds.length) return { orders, items };
  const { data } = await supabase.from('service_orders').select('id, appointment_id, status').eq('barbershop_id', shop.id).in('appointment_id', appointmentIds.slice(0, 300));
  for (const order of (data ?? []) as ServiceOrder[]) orders.set(order.appointment_id, order);
  const orderIds = [...orders.values()].map((o) => o.id);
  if (orderIds.length) {
    const { data: itemData } = await supabase.from('service_order_items').select('id, order_id, product_id, product_name, quantity, unit_price').eq('barbershop_id', shop.id).in('order_id', orderIds).order('created_at');
    for (const item of (itemData ?? []) as ServiceOrderItem[]) items.set(item.order_id, [...(items.get(item.order_id) ?? []), { ...item, quantity: num(item.quantity), unit_price: num(item.unit_price) }]);
  }
  return { orders, items };
}
