'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isValidDate, isValidTime, timeToMinutes, zonedToUtc } from '@/lib/time';
import type { ActionState, AppointmentStatus, MemberRole } from '@/lib/panel/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES: AppointmentStatus[] = ['scheduled', 'confirmed', 'done', 'cancelled', 'no_show'];

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
const ok = (message: string): ActionState => ({ ok: true, message, at: Date.now() });
const fail = (message: string): ActionState => ({ ok: false, message, at: Date.now() });
const digits = (value: string) => value.replace(/\D/g, '');
const isUuid = (value: string) => UUID_RE.test(value);
const parseMoney = (value: string) => Number(value.replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));

/** Toda action confirma sessão e associação à barbearia no servidor; o RLS é a segunda barreira. */
async function actionContext(roles?: MemberRole[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');
  const { data } = await supabase.from('barbershop_members').select('barbershop_id, role, created_at, barbershops(timezone)').eq('user_id', user.id).order('created_at').limit(1);
  const membership = data?.[0] as { barbershop_id: string; role: MemberRole; barbershops: unknown } | undefined;
  if (!membership) return null;
  const shopRow = (Array.isArray(membership.barbershops) ? membership.barbershops[0] : membership.barbershops) as { timezone?: string } | null;
  if (roles && !roles.includes(membership.role)) return null;
  return { supabase, shopId: membership.barbershop_id, role: membership.role, timezone: shopRow?.timezone || 'America/Sao_Paulo' };
}
const NO_ACCESS = 'Você não tem permissão para esta ação.';
const done = (message: string) => { revalidatePath('/painel', 'layout'); return ok(message); };

function dbMessage(error: { code?: string; message: string }, fallback: string) {
  if (error.code === '23P01') return 'Esse profissional já tem um atendimento nesse horário.';
  if (error.code === '42501') return NO_ACCESS;
  return fallback;
}

// ---------------------------------------------------------------------------
// Agendamentos
// ---------------------------------------------------------------------------
export async function saveAppointment(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext();
  if (!ctx) return fail(NO_ACCESS);
  const { supabase, shopId, timezone } = ctx;
  const id = text(form, 'id'), serviceId = text(form, 'service_id'), staffId = text(form, 'staff_id');
  const date = text(form, 'date'), time = text(form, 'time'), notes = text(form, 'notes'), rawPrice = text(form, 'price');
  if (id && !isUuid(id)) return fail('Agendamento inválido.');
  if (!isUuid(serviceId)) return fail('Escolha um serviço.');
  if (!isUuid(staffId)) return fail('Escolha um profissional.');
  if (!isValidDate(date) || !isValidTime(time)) return fail('Informe data e horário válidos.');
  if (notes.length > 2000) return fail('Observações muito longas.');

  const [{ data: service }, { data: staff }] = await Promise.all([
    supabase.from('services').select('id, duration_minutes, price').eq('id', serviceId).eq('barbershop_id', shopId).maybeSingle(),
    supabase.from('staff_profiles').select('id, active').eq('id', staffId).eq('barbershop_id', shopId).maybeSingle(),
  ]);
  if (!service) return fail('Serviço não encontrado.');
  if (!staff) return fail('Profissional não encontrado.');
  let price = Number(service.price);
  if (rawPrice) { price = parseMoney(rawPrice); if (!Number.isFinite(price) || price < 0 || price > 99999999) return fail('Valor inválido.'); }
  const starts = zonedToUtc(date, time, timezone);
  const ends = new Date(starts.getTime() + Number(service.duration_minutes) * 60000);
  const payload = { service_id: serviceId, staff_id: staffId, starts_at: starts.toISOString(), ends_at: ends.toISOString(), price, notes };

  if (id) {
    const { data, error } = await supabase.from('appointments').update(payload).eq('id', id).eq('barbershop_id', shopId).select('id');
    if (error) return fail(dbMessage(error, 'Não foi possível salvar o agendamento.'));
    if (!data?.length) return fail('Agendamento não encontrado.');
    return done('Agendamento atualizado.');
  }

  if (!staff.active) return fail('Este profissional está inativo.');
  let clientId = text(form, 'client_id');
  if (clientId) {
    if (!isUuid(clientId)) return fail('Cliente inválido.');
    const { data: client } = await supabase.from('clients').select('id').eq('id', clientId).eq('barbershop_id', shopId).maybeSingle();
    if (!client) return fail('Cliente não encontrado.');
  } else {
    const name = text(form, 'client_name'), phone = digits(text(form, 'client_phone'));
    if (name.length < 2 || name.length > 100) return fail('Escolha um cliente ou informe o nome do novo cliente.');
    if (phone && (phone.length < 8 || phone.length > 15)) return fail('Telefone do cliente inválido.');
    if (phone) {
      const { data: existing } = await supabase.from('clients').select('id').eq('barbershop_id', shopId).eq('phone', phone).maybeSingle();
      if (existing) clientId = existing.id;
    }
    if (!clientId) {
      const { data: created, error } = await supabase.from('clients').insert({ barbershop_id: shopId, name, phone: phone || null }).select('id').single();
      if (error || !created) return fail(dbMessage(error ?? { message: '' }, 'Não foi possível cadastrar o cliente.'));
      clientId = created.id;
    }
  }
  const { error } = await supabase.from('appointments').insert({ ...payload, barbershop_id: shopId, client_id: clientId, status: 'scheduled', source: 'panel' });
  if (error) return fail(dbMessage(error, 'Não foi possível criar o agendamento.'));
  return done('Agendamento criado.');
}

export async function setAppointmentStatus(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext();
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), status = text(form, 'status') as AppointmentStatus;
  if (!isUuid(id) || !STATUSES.includes(status)) return fail('Status inválido.');
  const { data, error } = await ctx.supabase.from('appointments').update({ status }).eq('id', id).eq('barbershop_id', ctx.shopId).select('id');
  if (error) return fail(dbMessage(error, 'Não foi possível alterar o status.'));
  if (!data?.length) return fail('Agendamento não encontrado.');
  return done(status === 'cancelled' ? 'Agendamento cancelado.' : 'Status atualizado.');
}

export async function cancelAppointment(prev: ActionState, form: FormData): Promise<ActionState> {
  const data = new FormData();
  data.set('id', text(form, 'id'));
  data.set('status', 'cancelled');
  return setAppointmentStatus(prev, data);
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------
export async function saveClient(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext();
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), name = text(form, 'name'), phone = digits(text(form, 'phone')), email = text(form, 'email').toLowerCase(), notes = text(form, 'notes');
  if (id && !isUuid(id)) return fail('Cliente inválido.');
  if (name.length < 2 || name.length > 100) return fail('Informe o nome do cliente (2 a 100 caracteres).');
  if (phone && (phone.length < 8 || phone.length > 15)) return fail('Telefone inválido. Use DDD + número.');
  if (email && (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) return fail('E-mail inválido.');
  if (notes.length > 2000) return fail('Observações muito longas.');
  const payload = { name, phone: phone || null, email: email || null, notes };
  const query = id
    ? ctx.supabase.from('clients').update(payload).eq('id', id).eq('barbershop_id', ctx.shopId).select('id')
    : ctx.supabase.from('clients').insert({ ...payload, barbershop_id: ctx.shopId }).select('id');
  const { data, error } = await query;
  if (error) return fail(error.code === '23505' ? 'Já existe um cliente com este telefone.' : dbMessage(error, 'Não foi possível salvar o cliente.'));
  if (!data?.length) return fail('Cliente não encontrado.');
  return done(id ? 'Cliente atualizado.' : 'Cliente cadastrado.');
}

export async function deleteClient(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext();
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id');
  if (!isUuid(id)) return fail('Cliente inválido.');
  const { data, error } = await ctx.supabase.from('clients').delete().eq('id', id).eq('barbershop_id', ctx.shopId).select('id');
  if (error) return fail(error.code === '23503' ? 'Este cliente tem agendamentos no histórico e não pode ser excluído.' : dbMessage(error, 'Não foi possível excluir o cliente.'));
  if (!data?.length) return fail('Cliente não encontrado.');
  return done('Cliente excluído.');
}

// ---------------------------------------------------------------------------
// Serviços (owner/manager)
// ---------------------------------------------------------------------------
export async function saveService(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext(['owner', 'manager']);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), name = text(form, 'name'), duration = Number(text(form, 'duration_minutes')), price = parseMoney(text(form, 'price'));
  const active = form.get('active') === 'on' || form.get('active') === 'true';
  if (id && !isUuid(id)) return fail('Serviço inválido.');
  if (name.length < 2 || name.length > 100) return fail('Informe o nome do serviço (2 a 100 caracteres).');
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) return fail('A duração deve ficar entre 5 e 480 minutos.');
  if (!text(form, 'price') || !Number.isFinite(price) || price < 0 || price > 99999999) return fail('Informe um preço válido.');
  const payload = { name, duration_minutes: duration, price, active };
  const query = id
    ? ctx.supabase.from('services').update(payload).eq('id', id).eq('barbershop_id', ctx.shopId).select('id')
    : ctx.supabase.from('services').insert({ ...payload, barbershop_id: ctx.shopId }).select('id');
  const { data, error } = await query;
  if (error) return fail(error.code === '23505' ? 'Já existe um serviço com este nome.' : dbMessage(error, 'Não foi possível salvar o serviço.'));
  if (!data?.length) return fail('Serviço não encontrado.');
  return done(id ? 'Serviço atualizado.' : 'Serviço criado.');
}

export async function deleteService(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext(['owner', 'manager']);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id');
  if (!isUuid(id)) return fail('Serviço inválido.');
  const { data, error } = await ctx.supabase.from('services').delete().eq('id', id).eq('barbershop_id', ctx.shopId).select('id');
  if (error?.code === '23503') {
    const { error: updateError } = await ctx.supabase.from('services').update({ active: false }).eq('id', id).eq('barbershop_id', ctx.shopId);
    if (updateError) return fail('Não foi possível desativar o serviço.');
    return done('O serviço tem agendamentos no histórico, então foi desativado em vez de excluído.');
  }
  if (error) return fail(dbMessage(error, 'Não foi possível excluir o serviço.'));
  if (!data?.length) return fail('Serviço não encontrado.');
  return done('Serviço excluído.');
}

// ---------------------------------------------------------------------------
// Equipe (owner/manager)
// ---------------------------------------------------------------------------
export async function saveStaff(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext(['owner', 'manager']);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), name = text(form, 'display_name'), role = text(form, 'role'), commission = parseMoney(text(form, 'commission_rate') || '0');
  const active = form.get('active') === 'on' || form.get('active') === 'true';
  if (id && !isUuid(id)) return fail('Profissional inválido.');
  if (name.length < 2 || name.length > 100) return fail('Informe o nome do profissional (2 a 100 caracteres).');
  if (!['barber', 'manager', 'receptionist'].includes(role)) return fail('Função inválida.');
  if (!Number.isFinite(commission) || commission < 0 || commission > 100) return fail('A comissão deve ficar entre 0 e 100%.');
  const payload = { display_name: name, role, commission_rate: commission, active };
  const query = id
    ? ctx.supabase.from('staff_profiles').update(payload).eq('id', id).eq('barbershop_id', ctx.shopId).select('id')
    : ctx.supabase.from('staff_profiles').insert({ ...payload, barbershop_id: ctx.shopId }).select('id');
  const { data, error } = await query;
  if (error) return fail(dbMessage(error, 'Não foi possível salvar o profissional.'));
  if (!data?.length) return fail('Profissional não encontrado.');
  return done(id ? 'Profissional atualizado.' : 'Profissional adicionado.');
}

export async function deleteStaff(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext(['owner', 'manager']);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id');
  if (!isUuid(id)) return fail('Profissional inválido.');
  const { data, error } = await ctx.supabase.from('staff_profiles').delete().eq('id', id).eq('barbershop_id', ctx.shopId).select('id');
  if (error?.code === '23503') {
    const { error: updateError } = await ctx.supabase.from('staff_profiles').update({ active: false }).eq('id', id).eq('barbershop_id', ctx.shopId);
    if (updateError) return fail('Não foi possível desativar o profissional.');
    return done('O profissional tem agendamentos no histórico, então foi desativado em vez de excluído.');
  }
  if (error) return fail(dbMessage(error, 'Não foi possível excluir o profissional.'));
  if (!data?.length) return fail('Profissional não encontrado.');
  return done('Profissional removido.');
}

// ---------------------------------------------------------------------------
// Horários de trabalho (owner/manager)
// ---------------------------------------------------------------------------
export async function saveWorkingHours(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext(['owner', 'manager']);
  if (!ctx) return fail(NO_ACCESS);
  const staffId = text(form, 'staff_id');
  if (staffId && !isUuid(staffId)) return fail('Profissional inválido.');
  const inherit = Boolean(staffId) && text(form, 'mode') === 'inherit';
  const days: { weekday: number; start: string; end: string }[] = [];
  if (!inherit) {
    for (let weekday = 0; weekday < 7; weekday++) {
      if (form.get(`open_${weekday}`) !== 'on') continue;
      const start = text(form, `start_${weekday}`), end = text(form, `end_${weekday}`);
      const breakStart = text(form, `break_start_${weekday}`), breakEnd = text(form, `break_end_${weekday}`);
      if (!isValidTime(start) || !isValidTime(end) || timeToMinutes(end) <= timeToMinutes(start)) return fail('Confira abertura e fechamento: o fechamento precisa ser depois da abertura.');
      if (breakStart || breakEnd) {
        if (!isValidTime(breakStart) || !isValidTime(breakEnd) || timeToMinutes(breakEnd) <= timeToMinutes(breakStart) || timeToMinutes(breakStart) <= timeToMinutes(start) || timeToMinutes(breakEnd) >= timeToMinutes(end)) return fail('O intervalo precisa ficar dentro do horário do dia.');
        days.push({ weekday, start, end: breakStart }, { weekday, start: breakEnd, end });
      } else days.push({ weekday, start, end });
    }
    if (!days.length) return fail(staffId ? 'Marque pelo menos um dia ou escolha “Usar horário da barbearia”.' : 'Marque pelo menos um dia de funcionamento.');
  }
  const { error } = await ctx.supabase.rpc('save_working_hours', { target_shop: ctx.shopId, target_staff: staffId || null, days });
  if (error) return fail(dbMessage(error, 'Não foi possível salvar os horários.'));
  return done(inherit ? 'O profissional passa a seguir o horário da barbearia.' : 'Horários salvos.');
}
