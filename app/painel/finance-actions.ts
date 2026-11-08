'use server';

import { actionContext, checked, dbMessage, done, fail, isUuid, NO_ACCESS, parseMoney, text } from '@/lib/panel/action-utils';
import { PAYMENT_METHODS, type ActionState, type PaymentMethod } from '@/lib/panel/types';

const MANAGERS = ['owner', 'manager'] as const;
const CASH_OPERATORS = ['owner', 'manager', 'receptionist'] as const;
const isPayment = (value: string): value is PaymentMethod => (PAYMENT_METHODS as readonly string[]).includes(value);
const money = (raw: string) => { const v = parseMoney(raw); return Number.isFinite(v) ? Math.round(v * 100) / 100 : NaN; };

// ---------------------------------------------------------------------------
// Caixa: sessões (cash_sessions) e suprimento/sangria (cash_transactions)
// ---------------------------------------------------------------------------
export async function openCashSession(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...CASH_OPERATORS]);
  if (!ctx) return fail(NO_ACCESS);
  const amount = money(text(form, 'opening_amount') || '0');
  if (!Number.isFinite(amount) || amount < 0 || amount > 9999999) return fail('Informe um valor de abertura válido.');
  const { error } = await ctx.supabase.from('cash_sessions').insert({ barbershop_id: ctx.shopId, opened_by: ctx.user.id, opening_amount: amount });
  if (error) return fail(error.code === '23505' ? 'Já existe um caixa aberto.' : dbMessage(error, 'Não foi possível abrir o caixa.'));
  return done('Caixa aberto.');
}

export async function closeCashSession(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...CASH_OPERATORS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), amount = money(text(form, 'closing_amount'));
  if (!isUuid(id)) return fail('Caixa inválido.');
  if (!text(form, 'closing_amount') || !Number.isFinite(amount) || amount < 0 || amount > 9999999) return fail('Informe o valor contado no caixa.');
  const { data, error } = await ctx.supabase.from('cash_sessions').update({ closed_at: new Date().toISOString(), closing_amount: amount }).eq('id', id).eq('barbershop_id', ctx.shopId).is('closed_at', null).select('id');
  if (error) return fail(dbMessage(error, 'Não foi possível fechar o caixa.'));
  if (!data?.length) return fail('Este caixa já foi fechado.');
  return done('Caixa fechado.');
}

export async function addCashTransaction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...CASH_OPERATORS]);
  if (!ctx) return fail(NO_ACCESS);
  const sessionId = text(form, 'session_id'), direction = text(form, 'direction'), description = text(form, 'description'), amount = money(text(form, 'amount'));
  const method = text(form, 'payment_method') || 'cash';
  if (!isUuid(sessionId)) return fail('Abra o caixa antes de lançar.');
  if (direction !== 'in' && direction !== 'out') return fail('Escolha entrada ou saída.');
  if (description.length < 2 || description.length > 160) return fail('Descreva o lançamento (2 a 160 caracteres).');
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999) return fail('Informe um valor maior que zero.');
  if (!isPayment(method)) return fail('Forma de pagamento inválida.');
  const { data: session } = await ctx.supabase.from('cash_sessions').select('id').eq('id', sessionId).eq('barbershop_id', ctx.shopId).is('closed_at', null).maybeSingle();
  if (!session) return fail('O caixa não está aberto.');
  const { error } = await ctx.supabase.from('cash_transactions').insert({ barbershop_id: ctx.shopId, session_id: sessionId, created_by: ctx.user.id, direction, description, amount, payment_method: method });
  if (error) return fail(dbMessage(error, 'Não foi possível lançar.'));
  return done(direction === 'in' ? 'Suprimento lançado.' : 'Sangria lançada.');
}

export async function deleteCashTransaction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id');
  if (!isUuid(id)) return fail('Lançamento inválido.');
  const { data, error } = await ctx.supabase.from('cash_transactions').delete().eq('id', id).eq('barbershop_id', ctx.shopId).select('id');
  if (error) return fail(dbMessage(error, 'Não foi possível excluir.'));
  if (!data?.length) return fail('Lançamento não encontrado.');
  return done('Lançamento excluído.');
}

// ---------------------------------------------------------------------------
// Lançamentos manuais do financeiro (cash_movements, source = 'manual')
// ---------------------------------------------------------------------------
export async function addManualMovement(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const kind = text(form, 'kind'), description = text(form, 'description'), amount = money(text(form, 'amount')), method = text(form, 'payment_method');
  if (kind !== 'income' && kind !== 'expense') return fail('Escolha receita ou despesa.');
  if (description.length < 2 || description.length > 180) return fail('Descreva o lançamento (2 a 180 caracteres).');
  if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999) return fail('Informe um valor maior que zero.');
  if (method && !isPayment(method) && method !== 'other') return fail('Forma de pagamento inválida.');
  const { error } = await ctx.supabase.from('cash_movements').insert({ barbershop_id: ctx.shopId, kind, source: 'manual', description, amount, payment_method: method || null, created_by: ctx.user.id });
  if (error) return fail(dbMessage(error, 'Não foi possível lançar.'));
  return done(kind === 'income' ? 'Receita lançada.' : 'Despesa lançada.');
}

// ---------------------------------------------------------------------------
// Taxas por forma de pagamento (payment_fee_rates, só proprietário)
// ---------------------------------------------------------------------------
export async function saveFeeRates(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext(['owner']);
  if (!ctx) return fail(NO_ACCESS);
  const rows = [];
  for (const method of PAYMENT_METHODS) {
    const fee = money(text(form, `fee_${method}`) || '0');
    if (!Number.isFinite(fee) || fee < 0 || fee > 30) return fail('As taxas devem ficar entre 0% e 30%.');
    rows.push({ barbershop_id: ctx.shopId, payment_method: method, fee_percent: fee, updated_at: new Date().toISOString() });
  }
  const { error } = await ctx.supabase.from('payment_fee_rates').upsert(rows, { onConflict: 'barbershop_id,payment_method' });
  if (error) return fail(dbMessage(error, 'Não foi possível salvar as taxas.'));
  return done('Taxas salvas. Elas valem para as próximas comandas fechadas.');
}

// ---------------------------------------------------------------------------
// PDV (register_pdv_sale)
// ---------------------------------------------------------------------------
export async function registerSale(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...CASH_OPERATORS]);
  if (!ctx) return fail(NO_ACCESS);
  const method = text(form, 'payment_method'), clientId = text(form, 'client_id');
  if (!isPayment(method)) return fail('Escolha a forma de pagamento.');
  if (clientId && !isUuid(clientId)) return fail('Cliente inválido.');
  let parsed: unknown;
  try { parsed = JSON.parse(text(form, 'items') || '[]'); } catch { return fail('Itens inválidos.'); }
  if (!Array.isArray(parsed) || !parsed.length || parsed.length > 50) return fail('Adicione pelo menos um produto.');
  const merged = new Map<string, number>();
  for (const raw of parsed) {
    const item = raw as { product_id?: unknown; quantity?: unknown };
    const productId = String(item.product_id ?? ''), quantity = Number(item.quantity);
    if (!isUuid(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) return fail('Confira os produtos e as quantidades (1 a 100).');
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }
  const items = [...merged].map(([product_id, quantity]) => ({ product_id, quantity }));
  if (items.some((i) => i.quantity > 100)) return fail('Quantidade máxima por produto: 100.');
  const { error } = await ctx.supabase.rpc('register_pdv_sale', { target_shop: ctx.shopId, target_client: clientId || null, target_payment_method: method, target_items: items });
  if (error) return fail(dbMessage(error, 'Não foi possível registrar a venda.'));
  return done('Venda registrada.');
}

// ---------------------------------------------------------------------------
// Produtos e estoque (products, owner/manager). quantity/unit_price são as colunas
// atuais; o trigger mantém stock_quantity/price.
// ---------------------------------------------------------------------------
export async function saveProduct(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), name = text(form, 'name'), category = text(form, 'category'), sku = text(form, 'sku');
  const price = money(text(form, 'unit_price')), quantity = Number(text(form, 'quantity') || '0'), minimum = Number(text(form, 'minimum_quantity') || '0');
  if (id && !isUuid(id)) return fail('Produto inválido.');
  if (name.length < 2 || name.length > 120) return fail('Informe o nome do produto (2 a 120 caracteres).');
  if (category.length > 60 || sku.length > 60) return fail('Categoria ou código muito longos.');
  if (!text(form, 'unit_price') || !Number.isFinite(price) || price < 0 || price > 9999999) return fail('Informe um preço válido.');
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 1000000) return fail('Quantidade em estoque inválida.');
  if (!Number.isInteger(minimum) || minimum < 0 || minimum > 1000000) return fail('Estoque mínimo inválido.');
  const payload = { name, category, sku, unit_price: price, quantity, minimum_quantity: minimum, active: checked(form, 'active'), available_to_customer: checked(form, 'available_to_customer'), updated_at: new Date().toISOString() };
  const query = id
    ? ctx.supabase.from('products').update(payload).eq('id', id).eq('barbershop_id', ctx.shopId).select('id')
    : ctx.supabase.from('products').insert({ ...payload, barbershop_id: ctx.shopId }).select('id');
  const { data, error } = await query;
  if (error) return fail(error.code === '23505' ? 'Já existe um produto com este código (SKU).' : error.code === '23514' ? 'O estoque não pode ficar abaixo da quantidade reservada em comandas abertas.' : dbMessage(error, 'Não foi possível salvar o produto.'));
  if (!data?.length) return fail('Produto não encontrado.');
  return done(id ? 'Produto atualizado.' : 'Produto cadastrado.');
}

export async function deleteProduct(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id');
  if (!isUuid(id)) return fail('Produto inválido.');
  const { data, error } = await ctx.supabase.from('products').delete().eq('id', id).eq('barbershop_id', ctx.shopId).select('id');
  if (error?.code === '23503') {
    const { error: updateError } = await ctx.supabase.from('products').update({ active: false, updated_at: new Date().toISOString() }).eq('id', id).eq('barbershop_id', ctx.shopId);
    return updateError ? fail('Não foi possível desativar o produto.') : done('O produto está em comandas, então foi desativado em vez de excluído.');
  }
  if (error) return fail(dbMessage(error, 'Não foi possível excluir o produto.'));
  if (!data?.length) return fail('Produto não encontrado.');
  return done('Produto excluído.');
}

export async function restockProduct(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), add = Number(text(form, 'amount'));
  if (!isUuid(id)) return fail('Produto inválido.');
  if (!Number.isInteger(add) || add < 1 || add > 100000) return fail('Informe quantas unidades entraram (número inteiro).');
  const { data: product } = await ctx.supabase.from('products').select('quantity').eq('id', id).eq('barbershop_id', ctx.shopId).maybeSingle();
  if (!product) return fail('Produto não encontrado.');
  const { data, error } = await ctx.supabase.from('products').update({ quantity: Number(product.quantity) + add, updated_at: new Date().toISOString() }).eq('id', id).eq('barbershop_id', ctx.shopId).eq('quantity', product.quantity).select('id');
  if (error) return fail(dbMessage(error, 'Não foi possível atualizar o estoque.'));
  if (!data?.length) return fail('O estoque mudou enquanto você editava. Tente de novo.');
  return done(`Entrada de ${add} unidade(s) registrada.`);
}

// ---------------------------------------------------------------------------
// Comandas (service_orders). Fechar usa close_service_order (gera venda,
// lançamentos de caixa, baixa de estoque e comissão). Abrir/lançar itens usa as
// funções da migration aditiva 202611080002.
// ---------------------------------------------------------------------------
export async function openServiceOrder(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...CASH_OPERATORS]);
  if (!ctx) return fail(NO_ACCESS);
  const appointmentId = text(form, 'appointment_id');
  if (!isUuid(appointmentId)) return fail('Agendamento inválido.');
  const { data: appt } = await ctx.supabase.from('appointments').select('id').eq('id', appointmentId).eq('barbershop_id', ctx.shopId).maybeSingle();
  if (!appt) return fail('Agendamento não encontrado.');
  const { error } = await ctx.supabase.rpc('open_service_order', { target_appointment: appointmentId });
  if (error) return fail(dbMessage(error, 'Não foi possível abrir a comanda.'));
  return done('Comanda aberta.');
}

export async function addOrderItem(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...CASH_OPERATORS]);
  if (!ctx) return fail(NO_ACCESS);
  const orderId = text(form, 'order_id'), productId = text(form, 'product_id'), quantity = Number(text(form, 'quantity') || '1');
  if (!isUuid(orderId)) return fail('Comanda inválida.');
  if (!isUuid(productId)) return fail('Escolha um produto.');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) return fail('Quantidade entre 1 e 50.');
  const { data: order } = await ctx.supabase.from('service_orders').select('id').eq('id', orderId).eq('barbershop_id', ctx.shopId).maybeSingle();
  if (!order) return fail('Comanda não encontrada.');
  const { error } = await ctx.supabase.rpc('add_service_order_item', { target_order: orderId, target_product: productId, target_quantity: quantity });
  if (error) return fail(dbMessage(error, 'Não foi possível lançar o produto.'));
  return done('Produto lançado na comanda.');
}

export async function removeOrderItem(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...CASH_OPERATORS]);
  if (!ctx) return fail(NO_ACCESS);
  const itemId = text(form, 'item_id');
  if (!isUuid(itemId)) return fail('Item inválido.');
  const { error } = await ctx.supabase.rpc('remove_service_order_item', { target_item: itemId });
  if (error) return fail(dbMessage(error, 'Não foi possível remover o item.'));
  return done('Item removido.');
}

export async function closeServiceOrder(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...CASH_OPERATORS]);
  if (!ctx) return fail(NO_ACCESS);
  const orderId = text(form, 'order_id'), method = text(form, 'payment_method');
  if (!isUuid(orderId)) return fail('Comanda inválida.');
  if (!isPayment(method)) return fail('Escolha a forma de pagamento.');
  const { data: order } = await ctx.supabase.from('service_orders').select('id').eq('id', orderId).eq('barbershop_id', ctx.shopId).maybeSingle();
  if (!order) return fail('Comanda não encontrada.');
  const { error } = await ctx.supabase.rpc('close_service_order', { target_order: orderId, target_payment_method: method });
  if (error) return fail(dbMessage(error, 'Não foi possível fechar a comanda.'));
  return done('Comanda paga e atendimento concluído.');
}

// ---------------------------------------------------------------------------
// Central de alertas (central_alerts)
// ---------------------------------------------------------------------------
export async function setAlertStatus(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const id = text(form, 'id'), status = text(form, 'status');
  if (!isUuid(id) || !['open', 'resolved', 'dismissed'].includes(status)) return fail('Alerta inválido.');
  const { data, error } = await ctx.supabase.from('central_alerts').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('barbershop_id', ctx.shopId).select('id');
  if (error) return fail(dbMessage(error, 'Não foi possível atualizar o alerta.'));
  if (!data?.length) return fail('Alerta não encontrado.');
  return done(status === 'resolved' ? 'Alerta resolvido.' : status === 'dismissed' ? 'Alerta dispensado.' : 'Alerta reaberto.');
}

export async function refreshAlerts(_prev: ActionState, _form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const { data, error } = await ctx.supabase.rpc('refresh_shop_alerts', { target_shop: ctx.shopId });
  if (error) return fail(dbMessage(error, 'Não foi possível atualizar os alertas.'));
  return done(`Alertas atualizados (${Number(data ?? 0)} verificado(s)).`);
}

/** Inclui 'alertas' em barbershops.active_modules, condição do job refresh_smart_alerts. */
export async function setAlertsModule(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await actionContext([...MANAGERS]);
  if (!ctx) return fail(NO_ACCESS);
  const enable = checked(form, 'enable');
  const modules = new Set(ctx.activeModules);
  if (enable) modules.add('alertas'); else modules.delete('alertas');
  const { data, error } = await ctx.supabase.from('barbershops').update({ active_modules: [...modules], updated_at: new Date().toISOString() }).eq('id', ctx.shopId).select('id');
  if (error) return fail(dbMessage(error, 'Não foi possível salvar.'));
  if (!data?.length) return fail(NO_ACCESS);
  return done(enable ? 'Alertas automáticos ativados.' : 'Alertas automáticos desativados.');
}
