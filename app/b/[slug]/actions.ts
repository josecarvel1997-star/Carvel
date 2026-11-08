'use server';

import { createClient } from '@/lib/supabase/server';
import { isValidDate } from '@/lib/time';
import type { Booking, BookingState, PublicSlot } from './types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KNOWN_ERRORS = ['Informe seu nome completo.', 'Informe um telefone válido com DDD.', 'Este horário não está mais disponível. Escolha outro.', 'Você já tem agendamentos em aberto. Fale com a barbearia para marcar outro.', 'Serviço indisponível', 'Barbearia não encontrada'];
const friendly = (message?: string) => KNOWN_ERRORS.find((known) => message?.includes(known)) ?? 'Não foi possível concluir agora. Tente novamente em instantes.';

/** Horários livres (público, sem login). Só chama a função SECURITY DEFINER exposta ao anon. */
export async function getPublicSlots(slug: string, serviceId: string, staffId: string | null, day: string): Promise<{ ok: boolean; message: string; slots: PublicSlot[] }> {
  if (!SLUG_RE.test(slug) || !UUID_RE.test(serviceId) || (staffId && !UUID_RE.test(staffId)) || !isValidDate(day)) return { ok: false, message: 'Seleção inválida.', slots: [] };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('public_available_slots', { p_slug: slug, p_service_id: serviceId, p_staff_id: staffId || null, p_day: day });
  if (error) return { ok: false, message: friendly(error.message), slots: [] };
  const rows = (data ?? []) as { slot_start: string; slot_label: string; slot_staff_name: string }[];
  return { ok: true, message: '', slots: rows.map((r) => ({ start: r.slot_start, label: r.slot_label, staffName: r.slot_staff_name })) };
}

export async function bookPublic(_prev: BookingState, form: FormData): Promise<BookingState> {
  const value = (key: string) => String(form.get(key) ?? '').trim();
  const slug = value('slug'), serviceId = value('service_id'), staffId = value('staff_id'), startsAt = value('starts_at');
  const name = value('client_name'), phone = value('client_phone').replace(/\D/g, '');
  const fail = (message: string): BookingState => ({ ok: false, message, at: Date.now() });
  if (!SLUG_RE.test(slug) || !UUID_RE.test(serviceId) || (staffId && !UUID_RE.test(staffId))) return fail('Seleção inválida. Recomece o agendamento.');
  if (!startsAt || Number.isNaN(Date.parse(startsAt))) return fail('Escolha um horário.');
  if (name.length < 2 || name.length > 100) return fail('Informe seu nome completo.');
  if (phone.length < 10 || phone.length > 13) return fail('Informe um telefone válido com DDD.');
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('public_book', { p_slug: slug, p_service_id: serviceId, p_staff_id: staffId || null, p_starts_at: startsAt, p_client_name: name, p_client_phone: phone });
  if (error || !data) return fail(friendly(error?.message));
  return { ok: true, message: 'Agendamento confirmado.', at: Date.now(), booking: data as Booking };
}
