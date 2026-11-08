'use server';

import { createClient } from '@/lib/supabase/server';
import { isValidDate, timeInZone } from '@/lib/time';
import type { Booking, BookingState, PublicSlot } from './types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TZ_RE = /^[A-Za-z_]+(\/[A-Za-z_+-]+)*$/;
/** Mensagens das exceções de create_public_booking que podem ser mostradas ao cliente. */
const KNOWN_ERRORS = ['Confira nome e telefone', 'Escolha um horário disponível', 'Horário fora do funcionamento', 'Este horário acabou de ser reservado. Escolha outro.', 'Serviço indisponível', 'Profissional indisponível', 'Estabelecimento não encontrado'];
const friendly = (message?: string) => KNOWN_ERRORS.find((known) => message?.includes(known)) ?? 'Não foi possível concluir agora. Tente novamente em instantes.';

/** Horários livres (público, sem login) via public_booking_slots, executável pelo anon. */
export async function getPublicSlots(slug: string, timezone: string, serviceId: string, staffId: string | null, day: string): Promise<{ ok: boolean; message: string; slots: PublicSlot[] }> {
  if (!SLUG_RE.test(slug) || !TZ_RE.test(timezone) || !UUID_RE.test(serviceId) || (staffId && !UUID_RE.test(staffId)) || !isValidDate(day)) return { ok: false, message: 'Seleção inválida.', slots: [] };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('public_booking_slots', { target_slug: slug, target_service: serviceId, target_day: day, target_staff: staffId || null });
  if (error) return { ok: false, message: 'Não foi possível carregar os horários.', slots: [] };
  const rows = ((data ?? []) as { starts_at: string; staff_profile_id: string; staff_name: string }[])
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at) || a.staff_name.localeCompare(b.staff_name, 'pt-BR'));
  // Um horário por início: com “sem preferência”, fica o primeiro profissional livre.
  const seen = new Set<number>();
  const slots: PublicSlot[] = [];
  for (const r of rows) {
    const key = new Date(r.starts_at).getTime();
    if (seen.has(key)) continue;
    seen.add(key);
    slots.push({ start: new Date(key).toISOString(), label: timeInZone(r.starts_at, timezone), staffId: r.staff_profile_id, staffName: r.staff_name });
  }
  return { ok: true, message: '', slots };
}

export async function bookPublic(_prev: BookingState, form: FormData): Promise<BookingState> {
  const value = (key: string) => String(form.get(key) ?? '').trim();
  const slug = value('slug'), serviceId = value('service_id'), staffId = value('staff_id'), startsAt = value('starts_at');
  const name = value('client_name'), phone = value('client_phone').replace(/\D/g, '');
  const fail = (message: string): BookingState => ({ ok: false, message, at: Date.now() });
  if (!SLUG_RE.test(slug) || !UUID_RE.test(serviceId) || !UUID_RE.test(staffId)) return fail('Seleção inválida. Recomece o agendamento.');
  if (!startsAt || Number.isNaN(Date.parse(startsAt))) return fail('Escolha um horário.');
  if (name.length < 2 || name.length > 120) return fail('Confira nome e telefone.');
  const national = phone.replace(/^55(?=\d{10,11}$)/, '');
  if (national.length < 10 || national.length > 11) return fail('Informe um telefone válido com DDD.');
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_public_booking', { target_slug: slug, target_service: serviceId, target_staff: staffId, target_start: new Date(startsAt).toISOString(), customer_name: name, customer_phone: national, allow_whatsapp: form.get('allow_whatsapp') === 'on' });
  if (error || !data) return fail(friendly(error?.message));
  const booking = data as Booking;
  return { ok: true, message: 'Agendamento confirmado.', at: Date.now(), booking: { ...booking, price: Number(booking.price), duration_minutes: Number(booking.duration_minutes) } };
}
