'use server';

import { actionContext, checked, dbMessage, digits, done, fail, isUuid, NO_ACCESS, parseMoney, text } from '@/lib/panel/action-utils';
import { DAY_KEYS } from '@/lib/panel/hours';
import { isActiveStatus, type ActionState, type AppointmentStatus } from '@/lib/panel/types';
import { addDays, isValidDate, isValidTime, timeToMinutes, todayInZone, zonedToUtc } from '@/lib/time';

const MANAGERS = ['owner', 'manager'] as const;

// ---------------------------------------------------------------------------
// Agendamentos
// ---------------------------------------------------------------------------

/**
 * Novo agendamento:
 *  - proprietário/gerente/recepção com profissional definido → create_internal_booking
 *    (cria cliente, agendamento e já abre a comanda);
 *  - barbeiro, serviço sem profissional ou data além de 60 dias → create_admin_appointment.
 * Edição: UPDATE direto em appointments; o trigger enforce_appointment_schedule revalida
 * expediente e conflitos, e carvel_sync_appointment_end recalcula ends_at.
 */
export async function saveAppointment(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext();
  if (!ctx) return fail(NO_ACCESS);
  const { supabase, shopId, timezone, role } = ctx;
  const id = text(form, 'id'), serviceId = text(form, 'service_id'), staffId = text(form, 'staff_id');
  const date = text(form, 'date'), time = text(form, 'time'), notes = text(form, 'notes'), rawPrice = text(form, 'price');
  if (id && !isUuid(id)) return fail('Agendamento inválido.');
  if (!isUuid(serviceId)) return fail('Escolha um serviço.');
  if (staffId && !isUuid(staffId)) return fail('Profissional inválido.');
  if (!isValidDate(date) || !isValidTime(time)) return fail('Informe data e horário válidos.');
  if (notes.length > 500) return fail('Observações muito longas (máximo 500 caracteres).');

  const { data: service } = await supabase.from('services').select('id, duration_minutes, price, requires_professional, active').eq('id', serviceId).eq('barbershop_id', shopId).maybeSingle();
  if (!service) return fail('Serviço não encontrado.');
  // Sem profissional e serviço que exige profissional: o banco atribui o profissional ativo mais livre.
  if (staffId) {
    const { data: staff } = await supabase.from('staff_profiles').select('id').eq('id', staffId).eq('barbershop_id', shopId).maybeSingle();
    if (!staff) return fail('Profissional não encontrado.');
  }
  let price: number | null = null;
  if (rawPrice) { price = parseMoney(rawPrice); if (!Number.isFinite(price) || price < 0 || price > 99999999) return fail('Valor inválido.'); }
  const starts = zonedToUtc(date, time, timezone);
  if (starts.getTime() <= Date.now()) return fail('Escolha uma data e horário futuros.');

  if (id) {
    const { data: current } = await supabase.from('appointments').select('id, status, duration_minutes').eq('id', id).eq('barbershop_id', shopId).maybeSingle();
    if (!current) return fail('Agendamento não encontrado.');
    if (!isActiveStatus(current.status as AppointmentStatus)) return fail('Este agendamento já foi finalizado e não pode ser editado.');
    const duration = Number(text(form, 'duration_minutes') || current.duration_minutes);
    if (!Number.isInteger(duration) || duration < 5 || duration > 480) return fail('A duração deve ficar entre 5 e 480 minutos.');
    const payload: Record<string, unknown> = { service_id: serviceId, staff_profile_id: staffId || null, starts_at: starts.toISOString(), duration_minutes: duration, notes, updated_at: new Date().toISOString() };
    if (price !== null) payload.price = price;
    const { data, error } = await supabase.from('appointments').update(payload).eq('id', id).eq('barbershop_id', shopId).select('id');
    if (error) return fail(dbMessage(error, 'Não foi possível salvar o agendamento.'));
    if (!data?.length) return fail('Agendamento não encontrado.');
    return done('Agendamento atualizado.');
  }

  // Cliente: existente (pelo id) ou novo (nome + telefone). As funções do banco identificam o cliente pelo telefone.
  let customerName = text(form, 'client_name'), customerPhone = digits(text(form, 'client_phone'));
  const clientId = text(form, 'client_id');
  if (clientId) {
    if (!isUuid(clientId)) return fail('Cliente inválido.');
    const { data: client } = await supabase.from('clients').select('full_name, phone_normalized, phone').eq('id', clientId).eq('barbershop_id', shopId).maybeSingle();
    if (!client) return fail('Cliente não encontrado.');
    customerName = client.full_name;
    customerPhone = digits(client.phone_normalized || client.phone || '');
  }
  if (customerName.length < 2 || customerName.length > 120) return fail('Escolha um cliente ou informe o nome do novo cliente.');
  if (customerPhone.length < 10 || customerPhone.length > 13) return fail('O telefone do cliente (com DDD) é obrigatório para agendar.');
  const allowWhatsapp = checked(form, 'allow_whatsapp');

  const withinInternalRules = Boolean(staffId) && ['owner', 'manager', 'receptionist'].includes(role)
    && timeToMinutes(time) % 15 === 0 && date <= addDays(todayInZone(timezone), 60) && customerPhone.replace(/^55(?=\d{10,11}$)/, '').length <= 11;
  let appointmentId: string | null = null;
  if (withinInternalRules) {
    const { data, error } = await supabase.rpc('create_internal_booking', { target_shop: shopId, target_service: serviceId, target_staff: staffId, target_date: date, target_time: time, customer_name: customerName, customer_phone: customerPhone, allow_whatsapp: allowWhatsapp });
    if (error) return fail(dbMessage(error, 'Não foi possível criar o agendamento.'));
    appointmentId = (data as { appointment_id?: string } | null)?.appointment_id ?? null;
  } else {
    const { data, error } = await supabase.rpc('create_admin_appointment', { target_shop: shopId, customer_name: customerName, customer_phone: customerPhone, target_service: serviceId, target_staff: staffId || null, requested_start: starts.toISOString(), appointment_notes: notes });
    if (error) return fail(dbMessage(error, 'Não foi possível criar o agendamento.'));
    appointmentId = (data as string | null) ?? null;
  }
  if (appointmentId && (price !== null || (withinInternalRules && notes))) {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (price !== null) patch.price = price;
    if (withinInternalRules && notes) patch.notes = notes;
    await supabase.from('appointments').update(patch).eq('id', appointmentId).eq('barbershop_id', shopId);
  }
  if (clientId && allowWhatsapp) await supabase.from('clients').update({ whatsapp_opt_in: true }).eq('id', clientId).eq('barbershop_id', shopId);
  return done(withinInternalRules ? 'Agendamento criado e comanda aberta.' : 'Agendamento criado.');
}

const RPC_STATUSES: AppointmentStatus[] = ['confirmed', 'in_progress', 'cancelled', 'no_show'];

/**
 * Mudanças de status:
 *  - confirmar / iniciar / cancelar / não compareceu → update_appointment_status;
 *  - concluir sem cobrança e reabrir (cancelado/falta → confirmado) → advance_appointment.
 * Concluir com pagamento é o fechamento da comanda (close_service_order).
 */
export async function setAppointmentStatus(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext();
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), status = text(form, 'status') as AppointmentStatus;
  if (!isUuid(id)) return fail('Agendamento inválido.');
  const { data: current } = await ctx.supabase.from('appointments').select('status').eq('id', id).eq('barbershop_id', ctx.shopId).maybeSingle();
  if (!current) return fail('Agendamento não encontrado.');
  const from = current.status as AppointmentStatus;

  if (RPC_STATUSES.includes(status) && isActiveStatus(from)) {
    const { error } = await ctx.supabase.rpc('update_appointment_status', { target_appointment: id, target_status: status });
    if (error) return fail(dbMessage(error, 'Não foi possível alterar o status.'));
    return done(status === 'cancelled' ? 'Agendamento cancelado.' : 'Status atualizado.');
  }
  if (status === 'completed' && isActiveStatus(from)) {
    const { data: order } = await ctx.supabase.from('service_orders').select('status').eq('appointment_id', id).eq('barbershop_id', ctx.shopId).maybeSingle();
    if (order?.status === 'open') return fail('Este atendimento tem comanda aberta. Feche a comanda em Atendimentos para concluir com o pagamento.');
    const { error } = await ctx.supabase.rpc('advance_appointment', { target_id: id, next_status: 'completed' });
    if (error) return fail(dbMessage(error, 'Não foi possível concluir o atendimento.'));
    return done('Atendimento concluído.');
  }
  if (status === 'confirmed' && (from === 'cancelled' || from === 'no_show')) {
    const { error } = await ctx.supabase.rpc('advance_appointment', { target_id: id, next_status: 'confirmed' });
    if (error) return fail(dbMessage(error, 'Não foi possível reabrir o agendamento.'));
    return done('Agendamento reaberto.');
  }
  return fail('Mudança de status não permitida.');
}

// ---------------------------------------------------------------------------
// Clientes (clients.full_name / phone; o trigger mantém name e phone_normalized)
// ---------------------------------------------------------------------------
export async function saveClient(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext();
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), name = text(form, 'full_name'), phone = digits(text(form, 'phone')), email = text(form, 'email').toLowerCase(), notes = text(form, 'notes');
  if (id && !isUuid(id)) return fail('Cliente inválido.');
  if (name.length < 2 || name.length > 120) return fail('Informe o nome do cliente (2 a 120 caracteres).');
  if (phone.length < 10 || phone.length > 13) return fail('Informe o telefone com DDD (obrigatório).');
  if (email && (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) return fail('E-mail inválido.');
  if (notes.length > 2000) return fail('Observações muito longas.');
  const payload = { name, full_name: name, phone, email, notes, whatsapp_opt_in: checked(form, 'whatsapp_opt_in'), updated_at: new Date().toISOString() };
  const query = id
    ? ctx.supabase.from('clients').update(payload).eq('id', id).eq('barbershop_id', ctx.shopId).select('id')
    : ctx.supabase.from('clients').insert({ ...payload, barbershop_id: ctx.shopId }).select('id');
  const { data, error } = await query;
  if (error) return fail(error.code === '23505' ? 'Já existe um cliente com este telefone.' : dbMessage(error, 'Não foi possível salvar o cliente.'));
  if (!data?.length) return fail('Cliente não encontrado.');
  return done(id ? 'Cliente atualizado.' : 'Cliente cadastrado.');
}

export async function deleteClient(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
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
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), name = text(form, 'name'), category = text(form, 'category'), duration = Number(text(form, 'duration_minutes')), price = parseMoney(text(form, 'price'));
  if (id && !isUuid(id)) return fail('Serviço inválido.');
  if (name.length < 2 || name.length > 100) return fail('Informe o nome do serviço (2 a 100 caracteres).');
  if (category.length > 60) return fail('Categoria muito longa.');
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) return fail('A duração deve ficar entre 5 e 480 minutos.');
  if (!text(form, 'price') || !Number.isFinite(price) || price < 0 || price > 99999999) return fail('Informe um preço válido.');
  const payload = { name, category, duration_minutes: duration, price, active: checked(form, 'active'), requires_professional: checked(form, 'requires_professional') };
  const query = id
    ? ctx.supabase.from('services').update(payload).eq('id', id).eq('barbershop_id', ctx.shopId).select('id')
    : ctx.supabase.from('services').insert({ ...payload, barbershop_id: ctx.shopId }).select('id');
  const { data, error } = await query;
  if (error) return fail(error.code === '23505' ? 'Já existe um serviço com este nome.' : error.code === '23514' ? 'A duração precisa respeitar o mínimo e o máximo configurados para o serviço.' : dbMessage(error, 'Não foi possível salvar o serviço.'));
  if (!data?.length) return fail('Serviço não encontrado.');
  return done(id ? 'Serviço atualizado.' : 'Serviço criado.');
}

export async function deleteService(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
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
// Salas e recursos (booking_resources, owner/manager)
// ---------------------------------------------------------------------------
export async function saveResource(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), name = text(form, 'name'), kind = text(form, 'kind'), capacity = Number(text(form, 'capacity') || '1');
  if (id && !isUuid(id)) return fail('Recurso inválido.');
  if (name.length < 2 || name.length > 100) return fail('Informe o nome (2 a 100 caracteres).');
  if (!['room', 'studio', 'space'].includes(kind)) return fail('Tipo inválido.');
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) return fail('Capacidade inválida.');
  const payload = { name, kind, capacity, active: checked(form, 'active'), updated_at: new Date().toISOString() };
  const query = id
    ? ctx.supabase.from('booking_resources').update(payload).eq('id', id).eq('barbershop_id', ctx.shopId).select('id')
    : ctx.supabase.from('booking_resources').insert({ ...payload, barbershop_id: ctx.shopId }).select('id');
  const { data, error } = await query;
  if (error) return fail(error.code === '23505' ? 'Já existe um recurso com este nome.' : dbMessage(error, 'Não foi possível salvar.'));
  if (!data?.length) return fail('Recurso não encontrado.');
  return done(id ? 'Recurso atualizado.' : 'Recurso cadastrado.');
}

export async function deleteResource(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id');
  if (!isUuid(id)) return fail('Recurso inválido.');
  const { data, error } = await ctx.supabase.from('booking_resources').delete().eq('id', id).eq('barbershop_id', ctx.shopId).select('id');
  if (error) return fail(dbMessage(error, 'Não foi possível excluir.'));
  if (!data?.length) return fail('Recurso não encontrado.');
  return done('Recurso excluído.');
}

// ---------------------------------------------------------------------------
// Equipe (owner/manager)
// ---------------------------------------------------------------------------
export async function saveStaff(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), name = text(form, 'display_name'), role = text(form, 'role');
  const commission = parseMoney(text(form, 'commission_rate') || '0'), productCommission = parseMoney(text(form, 'product_commission_rate') || '0');
  if (id && !isUuid(id)) return fail('Profissional inválido.');
  if (name.length < 2 || name.length > 100) return fail('Informe o nome do profissional (2 a 100 caracteres).');
  if (!['barber', 'manager', 'receptionist'].includes(role)) return fail('Função inválida.');
  if (!Number.isFinite(commission) || commission < 0 || commission > 100) return fail('A comissão de serviços deve ficar entre 0 e 100%.');
  if (!Number.isFinite(productCommission) || productCommission < 0 || productCommission > 100) return fail('A comissão de produtos deve ficar entre 0 e 100%.');
  const payload = { display_name: name, role, commission_rate: commission, product_commission_rate: productCommission, active: checked(form, 'active') };
  const query = id
    ? ctx.supabase.from('staff_profiles').update(payload).eq('id', id).eq('barbershop_id', ctx.shopId).select('id')
    : ctx.supabase.from('staff_profiles').insert({ ...payload, barbershop_id: ctx.shopId }).select('id');
  const { data, error } = await query;
  if (error) return fail(dbMessage(error, 'Não foi possível salvar o profissional.'));
  if (!data?.length) return fail('Profissional não encontrado.');
  return done(id ? 'Profissional atualizado.' : 'Profissional adicionado.');
}

/** Excluir apagaria o vínculo dos agendamentos (FK ON DELETE SET NULL), então quem tem histórico é só desativado. */
export async function deleteStaff(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id');
  if (!isUuid(id)) return fail('Profissional inválido.');
  const deactivate = async () => {
    const { error } = await ctx.supabase.from('staff_profiles').update({ active: false }).eq('id', id).eq('barbershop_id', ctx.shopId);
    return error ? fail('Não foi possível desativar o profissional.') : done('O profissional tem histórico, então foi desativado em vez de excluído.');
  };
  const { count } = await ctx.supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('barbershop_id', ctx.shopId).eq('staff_profile_id', id);
  if (count) return deactivate();
  const { data, error } = await ctx.supabase.from('staff_profiles').delete().eq('id', id).eq('barbershop_id', ctx.shopId).select('id');
  if (error?.code === '23503') return deactivate();
  if (error) return fail(dbMessage(error, 'Não foi possível excluir o profissional.'));
  if (!data?.length) return fail('Profissional não encontrado.');
  return done('Profissional removido.');
}

// ---------------------------------------------------------------------------
// Horário de funcionamento (barbershops.opening_hours, owner/manager)
// ---------------------------------------------------------------------------
export async function saveOpeningHours(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const hours: Record<string, { open: string; close: string; closed: boolean }> = {};
  for (const key of DAY_KEYS) {
    const open = checked(form, `open_${key}`);
    const start = text(form, `start_${key}`) || '09:00', end = text(form, `end_${key}`) || '18:00';
    if (!isValidTime(start) || !isValidTime(end)) return fail('Use horários no formato HH:MM.');
    if (open && timeToMinutes(end) <= timeToMinutes(start)) return fail('O fechamento precisa ser depois da abertura.');
    hours[key] = { open: start, close: end, closed: !open };
  }
  if (Object.values(hours).every((d) => d.closed)) return fail('Marque pelo menos um dia de funcionamento.');
  const { data, error } = await ctx.supabase.from('barbershops').update({ opening_hours: hours, updated_at: new Date().toISOString() }).eq('id', ctx.shopId).select('id');
  if (error) return fail(dbMessage(error, 'Não foi possível salvar os horários.'));
  if (!data?.length) return fail(NO_ACCESS);
  return done('Horários salvos.');
}
