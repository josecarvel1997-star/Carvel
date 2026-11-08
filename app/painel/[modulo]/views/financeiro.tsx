import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, CreditCard, Landmark, Percent, Receipt, Trash2, Wallet } from 'lucide-react';
import FormDialog from '@/app/painel/ui/form-dialog';
import ActionButton from '@/app/painel/ui/action-button';
import PdvForm from '@/app/painel/ui/pdv-form';
import { addCashTransaction, addManualMovement, closeCashSession, deleteCashTransaction, openCashSession, registerSale, saveFeeRates } from '@/app/painel/finance-actions';
import { canManage, canOperateCash, type PanelContext } from '@/lib/panel/context';
import { PAYMENT_LABEL, PAYMENT_METHODS } from '@/lib/panel/types';
import { addDays, dateInZone, formatDate, timeInZone, todayInZone, zonedToUtc } from '@/lib/time';
import { loadClientOptions, loadProducts } from './data';
import { brl, EmptyState, formatPhone } from './shared';

type Session = { id: string; opened_at: string; closed_at: string | null; opening_amount: number; closing_amount: number | null };
type Movement = { id: string; kind: 'income' | 'expense'; source: 'pdv' | 'service_order' | 'manual'; description: string; amount: number; payment_method: string | null; created_at: string };
type Transaction = { id: string; direction: 'in' | 'out'; description: string; amount: number; payment_method: string; created_at: string };
type Sale = { id: string; total_amount: number; payment_method: string; status: string; created_at: string; service_order_id: string | null; processing_fee: number; client_id: string | null };

const SOURCE_LABEL = { pdv: 'Venda PDV', service_order: 'Comanda', manual: 'Lançamento manual' } as const;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const n = (v: unknown) => Number(v ?? 0);
const methodOptions = PAYMENT_METHODS.map((m) => ({ value: m, label: PAYMENT_LABEL[m] }));

function monthBounds(month: string, tz: string) {
  const [y, m] = month.split('-').map(Number);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
  return { start: zonedToUtc(`${month}-01`, '00:00', tz).toISOString(), end: zonedToUtc(`${next}-01`, '00:00', tz).toISOString(), next, prev };
}

export default async function FinanceiroView({ ctx, params }: { ctx: PanelContext; params: Record<string, string | undefined> }) {
  const { supabase, shop, role } = ctx;
  const tz = shop.timezone;
  const currentMonth = todayInZone(tz).slice(0, 7);
  const month = params.mes && MONTH_RE.test(params.mes) && params.mes <= currentMonth ? params.mes : currentMonth;
  const { start, end, next, prev } = monthBounds(month, tz);
  const manage = canManage(role), operate = canOperateCash(role);

  const [{ data: sessionRows }, { data: movementRows }, { data: saleRows }, products, clients, { data: feeRows }] = await Promise.all([
    supabase.from('cash_sessions').select('id, opened_at, closed_at, opening_amount, closing_amount').eq('barbershop_id', shop.id).order('opened_at', { ascending: false }).limit(6),
    supabase.from('cash_movements').select('id, kind, source, description, amount, payment_method, created_at').eq('barbershop_id', shop.id).gte('created_at', start).lt('created_at', end).order('created_at', { ascending: false }).limit(1000),
    supabase.from('sales').select('id, total_amount, payment_method, status, created_at, service_order_id, processing_fee, client_id').eq('barbershop_id', shop.id).gte('created_at', start).lt('created_at', end).order('created_at', { ascending: false }).limit(500),
    operate ? loadProducts(ctx, true) : Promise.resolve([]),
    operate ? loadClientOptions(ctx) : Promise.resolve([]),
    manage ? supabase.from('payment_fee_rates').select('payment_method, fee_percent').eq('barbershop_id', shop.id) : Promise.resolve({ data: [] as { payment_method: string; fee_percent: number }[] }),
  ]);
  const sessions = ((sessionRows ?? []) as Session[]).map((s) => ({ ...s, opening_amount: n(s.opening_amount), closing_amount: s.closing_amount === null ? null : n(s.closing_amount) }));
  const movements = ((movementRows ?? []) as Movement[]).map((m) => ({ ...m, amount: n(m.amount) }));
  const sales = ((saleRows ?? []) as Sale[]).map((s) => ({ ...s, total_amount: n(s.total_amount), processing_fee: n(s.processing_fee) }));
  const fees = new Map(((feeRows ?? []) as { payment_method: string; fee_percent: number }[]).map((f) => [f.payment_method, n(f.fee_percent)]));
  const openSession = sessions.find((s) => !s.closed_at) ?? null;

  // Caixa aberto: suprimentos/sangrias da sessão e movimentos em dinheiro desde a abertura.
  let sessionTx: Transaction[] = [], cashSince = 0;
  if (openSession) {
    const [{ data: txRows }, { data: cashRows }] = await Promise.all([
      supabase.from('cash_transactions').select('id, direction, description, amount, payment_method, created_at').eq('barbershop_id', shop.id).eq('session_id', openSession.id).order('created_at', { ascending: false }).limit(200),
      supabase.from('cash_movements').select('kind, amount').eq('barbershop_id', shop.id).eq('payment_method', 'cash').gte('created_at', openSession.opened_at).limit(2000),
    ]);
    sessionTx = ((txRows ?? []) as Transaction[]).map((t) => ({ ...t, amount: n(t.amount) }));
    cashSince = ((cashRows ?? []) as { kind: string; amount: number }[]).reduce((sum, m) => sum + (m.kind === 'income' ? n(m.amount) : -n(m.amount)), 0);
  }
  const drawerTx = sessionTx.filter((t) => t.payment_method === 'cash').reduce((sum, t) => sum + (t.direction === 'in' ? t.amount : -t.amount), 0);
  const expectedCash = openSession ? openSession.opening_amount + cashSince + drawerTx : 0;

  const income = movements.filter((m) => m.kind === 'income').reduce((s, m) => s + m.amount, 0);
  const expense = movements.filter((m) => m.kind === 'expense').reduce((s, m) => s + m.amount, 0);
  const paidSales = sales.filter((s) => s.status === 'paid');
  const fmtDateTime = (iso: string) => `${formatDate(dateInZone(iso, tz), { day: '2-digit', month: 'short' })} · ${timeInZone(iso, tz)}`;
  const monthLabel = formatDate(`${month}-15`, { month: 'long', year: 'numeric' });
  const clientName = new Map(clients.map((c) => [c.id, c.full_name]));

  return <>
    <div className="finance-toolbar">
      <div className="agenda-date-tools">
        <Link className="workspace-icon-button" href={`/painel/financeiro?mes=${prev}`} aria-label="Mês anterior"><ChevronLeft size={17}/></Link>
        {month < currentMonth ? <Link className="workspace-icon-button" href={`/painel/financeiro?mes=${next}`} aria-label="Próximo mês"><ChevronRight size={17}/></Link> : <span className="workspace-icon-button" aria-hidden><ChevronRight size={17}/></span>}
        <b>{monthLabel}</b>
      </div>
      {operate && <PdvForm action={registerSale} paymentMethods={methodOptions} products={products.map((p) => ({ id: p.id, name: p.name, price: p.unit_price, available: Math.max(0, p.quantity - p.reserved_quantity) }))} clients={clients.map((c) => ({ id: c.id, label: `${c.full_name}${c.phone ? ` · ${formatPhone(c.phone)}` : ''}` }))}/>}
    </div>

    <div className="finance-metrics">
      <Metric icon={<ArrowDownLeft size={18}/>} tone="green" label="Entradas no mês" value={brl(income)} caption="vendas, comandas e receitas manuais"/>
      <Metric icon={<ArrowUpRight size={18}/>} tone="copper" label="Saídas no mês" value={brl(expense)} caption="taxas de pagamento e despesas"/>
      <Metric icon={<Landmark size={18}/>} tone="lavender" label="Resultado" value={brl(income - expense)} caption="entradas menos saídas"/>
      <Metric icon={<Receipt size={18}/>} tone="blue" label="Vendas pagas" value={String(paidSales.length)} caption={`${brl(paidSales.reduce((s, v) => s + v.total_amount, 0))} no mês`}/>
    </div>

    <section className="workspace-card transactions-card">
      <div className="card-heading"><div><h3><Wallet size={15}/> Caixa {openSession ? 'aberto' : 'fechado'}</h3><p>{openSession ? `Aberto em ${fmtDateTime(openSession.opened_at)} com ${brl(openSession.opening_amount)}.` : 'Abra o caixa para registrar suprimentos e sangrias do dia.'}</p></div>
        {operate && (openSession ? <span className="card-actions">
          <FormDialog title="Suprimento ou sangria" eyebrow="CAIXA" action={addCashTransaction} submitLabel="Lançar" trigger="Suprimento / sangria" triggerIcon="plus" triggerClassName="workspace-secondary-button">
            <input type="hidden" name="session_id" value={openSession.id}/>
            <div className="demo-form-row two"><label>Tipo<select name="direction" defaultValue="in"><option value="in">Suprimento (entrada)</option><option value="out">Sangria (saída)</option></select></label><label>Valor (R$)<input name="amount" inputMode="decimal" required placeholder="0,00"/></label></div>
            <label>Descrição<input name="description" required minLength={2} maxLength={160} placeholder="Ex.: troco inicial, retirada para depósito"/></label>
            <label>Forma<select name="payment_method" defaultValue="cash">{methodOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
          </FormDialog>
          <FormDialog title="Fechar caixa" eyebrow="CAIXA" description={`Esperado em dinheiro na gaveta: ${brl(expectedCash)} (abertura + recebimentos em dinheiro + suprimentos − sangrias).`} action={closeCashSession} submitLabel="Fechar caixa" trigger="Fechar caixa" triggerClassName="workspace-primary-button compact">
            <input type="hidden" name="id" value={openSession.id}/>
            <label>Valor contado (R$)<input name="closing_amount" inputMode="decimal" required defaultValue={expectedCash.toFixed(2)}/></label>
          </FormDialog>
        </span> : <FormDialog title="Abrir caixa" eyebrow="CAIXA" action={openCashSession} submitLabel="Abrir caixa" trigger="Abrir caixa" triggerIcon="plus" triggerClassName="workspace-primary-button compact">
          <label>Valor inicial em dinheiro (R$)<input name="opening_amount" inputMode="decimal" defaultValue="0,00"/></label>
        </FormDialog>)}
      </div>
      {openSession && <div className="generic-summary-grid">
        <div><small>Abertura</small><b>{brl(openSession.opening_amount)}</b></div>
        <div><small>Dinheiro recebido − pago desde a abertura</small><b>{brl(cashSince)}</b></div>
        <div><small>Esperado na gaveta</small><b>{brl(expectedCash)}</b></div>
      </div>}
      {openSession && <div className="transaction-list">{sessionTx.map((t) => <div className="transaction-row" key={t.id}>
        <span className={`transaction-icon ${t.direction === 'out' ? 'out' : ''}`}>{t.direction === 'in' ? <ArrowDownLeft size={15}/> : <ArrowUpRight size={15}/>}</span>
        <span className="transaction-desc"><b>{t.description}</b><span className="transaction-method">{t.direction === 'in' ? 'Suprimento' : 'Sangria'} · {PAYMENT_LABEL[t.payment_method] ?? t.payment_method} · {fmtDateTime(t.created_at)}</span></span>
        <b className={t.direction === 'in' ? 'transaction-positive' : 'transaction-negative'}>{t.direction === 'in' ? '+' : '−'}{brl(t.amount)}</b>
        {manage && <ActionButton action={deleteCashTransaction} fields={{ id: t.id }} className="link-button danger" confirmMessage="Excluir este lançamento do caixa?" title="Excluir"><Trash2 size={13}/></ActionButton>}
      </div>)}{!sessionTx.length && <p className="form-hint">Nenhum suprimento ou sangria nesta sessão.</p>}</div>}
      {sessions.filter((s) => s.closed_at).length > 0 && <p className="finance-separation-note">Últimos fechamentos: {sessions.filter((s) => s.closed_at).slice(0, 5).map((s) => `${fmtDateTime(s.closed_at!)} (${brl(s.closing_amount ?? 0)})`).join(' · ')}</p>}
    </section>

    <section className="workspace-card transactions-card">
      <div className="card-heading"><div><h3>Lançamentos de {monthLabel}</h3><p>Gerados automaticamente pelas vendas do PDV e pelas comandas pagas, mais os lançamentos manuais.</p></div>
        {manage && <FormDialog title="Novo lançamento" eyebrow="FINANCEIRO" action={addManualMovement} submitLabel="Lançar" trigger="Novo lançamento" triggerIcon="plus" triggerClassName="workspace-secondary-button">
          <div className="demo-form-row two"><label>Tipo<select name="kind" defaultValue="expense"><option value="expense">Despesa</option><option value="income">Receita</option></select></label><label>Valor (R$)<input name="amount" inputMode="decimal" required placeholder="0,00"/></label></div>
          <label>Descrição<input name="description" required minLength={2} maxLength={180} placeholder="Ex.: aluguel, compra de produtos"/></label>
          <label>Forma de pagamento<select name="payment_method" defaultValue=""><option value="">Não informar</option>{methodOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}<option value="other">Outro</option></select></label>
        </FormDialog>}
      </div>
      <div className="transaction-list">{movements.slice(0, 100).map((m) => <div className="transaction-row" key={m.id}>
        <span className={`transaction-icon ${m.kind === 'expense' ? 'out' : ''}`}>{m.kind === 'income' ? <ArrowDownLeft size={15}/> : <ArrowUpRight size={15}/>}</span>
        <span className="transaction-desc"><b>{m.description}</b><span className="transaction-method">{SOURCE_LABEL[m.source]}{m.payment_method ? ` · ${PAYMENT_LABEL[m.payment_method] ?? m.payment_method}` : ''} · {fmtDateTime(m.created_at)}</span></span>
        <b className={m.kind === 'income' ? 'transaction-positive' : 'transaction-negative'}>{m.kind === 'income' ? '+' : '−'}{brl(m.amount)}</b>
      </div>)}</div>
      {!movements.length && <EmptyState title="Nenhum lançamento neste mês">Vendas no PDV e comandas pagas entram aqui automaticamente.</EmptyState>}
      {movements.length > 100 && <p className="table-footnote">Mostrando os 100 lançamentos mais recentes de {movements.length}.</p>}
    </section>

    <section className="workspace-card transactions-card">
      <div className="card-heading"><div><h3>Vendas de {monthLabel}</h3><p>PDV e comandas pagas.</p></div></div>
      <div className="transaction-list">{sales.slice(0, 50).map((s) => <div className="transaction-row" key={s.id}>
        <span className="transaction-icon"><CreditCard size={15}/></span>
        <span className="transaction-desc"><b>{s.service_order_id ? 'Comanda' : 'Venda PDV'} #{s.id.slice(0, 8)}{s.client_id && clientName.get(s.client_id) ? ` · ${clientName.get(s.client_id)}` : ''}</b><span className="transaction-method">{PAYMENT_LABEL[s.payment_method] ?? s.payment_method} · {fmtDateTime(s.created_at)}{s.processing_fee ? ` · taxa ${brl(s.processing_fee)}` : ''}{s.status !== 'paid' ? ` · ${s.status === 'cancelled' ? 'cancelada' : 'estornada'}` : ''}</span></span>
        <b className="transaction-positive">{brl(s.total_amount)}</b>
      </div>)}</div>
      {!sales.length && <EmptyState title="Nenhuma venda neste mês"/>}
    </section>

    {manage && <section className="workspace-card transactions-card">
      <div className="card-heading"><div><h3><Percent size={15}/> Taxas por forma de pagamento</h3><p>Usadas no fechamento das comandas para calcular a taxa, o valor retido e a base da comissão.{role === 'owner' ? '' : ' Só o proprietário altera.'}</p></div></div>
      {role === 'owner' ? <FeeForm fees={fees}/> : <div className="generic-summary-grid">{PAYMENT_METHODS.map((m) => <div key={m}><small>{PAYMENT_LABEL[m]}</small><b>{(fees.get(m) ?? 0).toLocaleString('pt-BR')}%</b></div>)}</div>}
    </section>}
    <p className="finance-separation-note">Datas no fuso da barbearia. Período: {formatDate(`${month}-01`, { day: '2-digit', month: 'short' })} a {formatDate(addDays(dateInZone(end, tz), -1), { day: '2-digit', month: 'short', year: 'numeric' })}.</p>
  </>;
}

function FeeForm({ fees }: { fees: Map<string, number> }) {
  return <FormDialog title="Taxas por forma de pagamento" eyebrow="FINANCEIRO" action={saveFeeRates} submitLabel="Salvar taxas" trigger={`Pix ${fees.get('pix') ?? 0}% · Dinheiro ${fees.get('cash') ?? 0}% · Débito ${fees.get('debit_card') ?? 0}% · Crédito ${fees.get('credit_card') ?? 0}% — editar`} triggerClassName="workspace-secondary-button">
    <div className="demo-form-row two">{PAYMENT_METHODS.map((m) => <label key={m}>{PAYMENT_LABEL[m]} (%)<input name={`fee_${m}`} type="number" min={0} max={30} step="0.01" defaultValue={fees.get(m) ?? 0}/></label>)}</div>
  </FormDialog>;
}

function Metric({ icon, label, value, caption, tone }: { icon: React.ReactNode; label: string; value: string; caption: string; tone: string }) {
  return <article className="workspace-metric"><div className={`metric-symbol ${tone}`}>{icon}</div><span>{label}</span><div className="metric-value-row"><strong>{value}</strong></div><p>{caption}</p></article>;
}
