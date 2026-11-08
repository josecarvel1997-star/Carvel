import Link from 'next/link';
import { ChevronLeft, ChevronRight, Percent } from 'lucide-react';
import type { PanelContext } from '@/lib/panel/context';
import { dateInZone, formatDate, timeInZone, todayInZone, zonedToUtc } from '@/lib/time';
import { loadStaff } from './data';
import { brl, EmptyState, initials } from './shared';

type Entry = { id: string; staff_profile_id: string; service_gross: number; product_gross: number; fee_share: number; commission_rate: number; product_commission_rate: number; commission_amount: number; status: 'accrued' | 'paid' | 'cancelled'; created_at: string };
const STATUS = { accrued: 'A pagar', paid: 'Paga', cancelled: 'Cancelada' } as const;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const n = (v: unknown) => Number(v ?? 0);

/** Comissões gravadas por close_service_order. O RLS mostra tudo para proprietário/gerente e só as próprias para o profissional. */
export default async function ComissoesView({ ctx, params }: { ctx: PanelContext; params: Record<string, string | undefined> }) {
  const tz = ctx.shop.timezone;
  const currentMonth = todayInZone(tz).slice(0, 7);
  const month = params.mes && MONTH_RE.test(params.mes) && params.mes <= currentMonth ? params.mes : currentMonth;
  const [y, m] = month.split('-').map(Number);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
  const [staff, { data }] = await Promise.all([
    loadStaff(ctx),
    ctx.supabase.from('commission_entries').select('id, staff_profile_id, service_gross, product_gross, fee_share, commission_rate, product_commission_rate, commission_amount, status, created_at').eq('barbershop_id', ctx.shop.id)
      .gte('created_at', zonedToUtc(`${month}-01`, '00:00', tz).toISOString()).lt('created_at', zonedToUtc(`${next}-01`, '00:00', tz).toISOString()).order('created_at', { ascending: false }).limit(2000),
  ]);
  const entries = ((data ?? []) as Entry[]).map((e) => ({ ...e, service_gross: n(e.service_gross), product_gross: n(e.product_gross), fee_share: n(e.fee_share), commission_amount: n(e.commission_amount), commission_rate: n(e.commission_rate), product_commission_rate: n(e.product_commission_rate) }));
  const valid = entries.filter((e) => e.status !== 'cancelled');
  const byStaff = new Map<string, Entry[]>();
  for (const e of valid) byStaff.set(e.staff_profile_id, [...(byStaff.get(e.staff_profile_id) ?? []), e]);
  const visibleStaff = ctx.role === 'barber' ? staff.filter((s) => s.id === ctx.staffProfileId) : staff.filter((s) => s.active || byStaff.has(s.id));
  const sum = (list: Entry[], key: 'service_gross' | 'product_gross' | 'commission_amount') => list.reduce((acc, e) => acc + e[key], 0);
  const monthLabel = formatDate(`${month}-15`, { month: 'long', year: 'numeric' });
  const staffName = new Map(staff.map((s) => [s.id, s.display_name]));

  return <>
    <div className="finance-toolbar"><div className="agenda-date-tools">
      <Link className="workspace-icon-button" href={`/painel/comissoes?mes=${prev}`} aria-label="Mês anterior"><ChevronLeft size={17}/></Link>
      {month < currentMonth ? <Link className="workspace-icon-button" href={`/painel/comissoes?mes=${next}`} aria-label="Próximo mês"><ChevronRight size={17}/></Link> : <span className="workspace-icon-button" aria-hidden><ChevronRight size={17}/></span>}
      <b>{monthLabel}</b>
    </div></div>
    <div className="team-highlight-row">
      <div><span>Comandas com comissão</span><b>{valid.length}</b></div>
      <div><span>Base (serviços + produtos)</span><b>{brl(sum(valid, 'service_gross') + sum(valid, 'product_gross'))}</b></div>
      <div><span>Comissões do mês</span><b>{brl(sum(valid, 'commission_amount'))}</b></div>
      <span/>
    </div>
    {ctx.role === 'barber' && !ctx.staffProfileId && <EmptyState title="Seu login não está ligado a um profissional">Peça ao proprietário para vincular seu acesso ao seu cadastro na equipe.</EmptyState>}
    {visibleStaff.length > 0 && <div className="team-card-grid">{visibleStaff.map((s) => { const list = byStaff.get(s.id) ?? []; return <article className="workspace-card team-card" key={s.id}>
      <div className="team-card-top"><span className="team-avatar lavender">{initials(s.display_name)}</span></div>
      <h3>{s.display_name}</h3><p><Percent size={12}/> {s.commission_rate.toLocaleString('pt-BR')}% serviços · {s.product_commission_rate.toLocaleString('pt-BR')}% produtos (percentual atual)</p>
      <div className="team-stats"><span><small>Comandas</small><b>{list.length}</b></span><span><small>Serviços</small><b>{brl(sum(list, 'service_gross'))}</b></span><span><small>Produtos</small><b>{brl(sum(list, 'product_gross'))}</b></span><span><small>Comissão</small><b>{brl(sum(list, 'commission_amount'))}</b></span></div>
    </article>; })}</div>}
    <section className="workspace-card transactions-card">
      <div className="card-heading"><div><h3>Lançamentos de comissão</h3><p>Cada comanda paga gera um lançamento com o percentual vigente no momento do fechamento.</p></div></div>
      <div className="transaction-list">{entries.slice(0, 200).map((e) => <div className="transaction-row" key={e.id}>
        <span className="transaction-icon"><Percent size={15}/></span>
        <span className="transaction-desc"><b>{staffName.get(e.staff_profile_id) ?? 'Profissional'} · {STATUS[e.status]}</b><span className="transaction-method">Serviço {brl(e.service_gross)} × {e.commission_rate}% · Produtos {brl(e.product_gross)} × {e.product_commission_rate}% · taxa {brl(e.fee_share)} · {formatDate(dateInZone(e.created_at, tz), { day: '2-digit', month: 'short' })} {timeInZone(e.created_at, tz)}</span></span>
        <b className={e.status === 'cancelled' ? 'transaction-negative' : 'transaction-positive'}>{brl(e.commission_amount)}</b>
      </div>)}</div>
      {!entries.length && <EmptyState title="Nenhuma comissão neste mês">As comissões aparecem quando uma comanda é fechada em Atendimentos.</EmptyState>}
      <p className="finance-separation-note">Marcar comissões como pagas: em breve (o banco ainda não permite essa alteração pelo app).</p>
    </section>
  </>;
}
