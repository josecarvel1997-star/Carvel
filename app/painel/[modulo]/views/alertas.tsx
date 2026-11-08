import Link from 'next/link';
import { AlertTriangle, Bell, CheckCheck, Package, RefreshCw, RotateCcw, UserRound, X } from 'lucide-react';
import ActionButton from '@/app/painel/ui/action-button';
import { refreshAlerts, setAlertsModule, setAlertStatus } from '@/app/painel/finance-actions';
import { canManage, type PanelContext } from '@/lib/panel/context';
import { dateInZone, formatDate, timeInZone } from '@/lib/time';
import { EmptyState } from './shared';

type Alert = { id: string; alert_type: 'client_return' | 'inventory_low' | 'schedule_idle'; title: string; summary: string; severity: 'info' | 'warning' | 'urgent'; status: 'open' | 'resolved' | 'dismissed'; client_id: string | null; product_id: string | null; last_detected_at: string };
const TABS = ['open', 'resolved', 'dismissed'] as const;
const TAB_LABEL = { open: 'Abertos', resolved: 'Resolvidos', dismissed: 'Dispensados' } as const;

export default async function AlertasView({ ctx, params }: { ctx: PanelContext; params: Record<string, string | undefined> }) {
  const tz = ctx.shop.timezone;
  const tab = TABS.includes(params.status as (typeof TABS)[number]) ? params.status as (typeof TABS)[number] : 'open';
  const manage = canManage(ctx.role);
  const { data } = await ctx.supabase.from('central_alerts').select('id, alert_type, title, summary, severity, status, client_id, product_id, last_detected_at').eq('barbershop_id', ctx.shop.id).eq('status', tab).order('last_detected_at', { ascending: false }).limit(200);
  const alerts = (data ?? []) as Alert[];
  const moduleOn = ctx.shop.active_modules.includes('alertas');

  return <>
    <section className="workspace-card transactions-card">
      <div className="card-heading"><div><h3><Bell size={15}/> Como os alertas funcionam</h3><p>O banco gera alertas de produto no estoque mínimo e de clientes que passaram do intervalo habitual entre visitas. {moduleOn ? 'Os alertas automáticos estão ativos para este negócio.' : 'Os alertas automáticos estão desativados para este negócio.'}</p></div>
        {manage && <span className="card-actions">
          <ActionButton action={refreshAlerts} fields={{}} className="workspace-secondary-button"><RefreshCw size={14}/>Verificar agora</ActionButton>
          <ActionButton action={setAlertsModule} fields={{ enable: moduleOn ? 'false' : 'true' }} className={moduleOn ? 'workspace-secondary-button' : 'workspace-primary-button compact'}>{moduleOn ? 'Desativar automáticos' : 'Ativar automáticos'}</ActionButton>
        </span>}
      </div>
    </section>
    <section className="workspace-card appointments-board">
      <div className="appointment-filter-tabs">{TABS.map((t) => <Link key={t} href={t === 'open' ? '/painel/alertas' : `/painel/alertas?status=${t}`} className={tab === t ? 'active' : ''}>{TAB_LABEL[t]}</Link>)}</div>
      <div className="transaction-list">{alerts.map((a) => <div className="transaction-row" key={a.id}>
        <span className={`transaction-icon ${a.severity === 'info' ? '' : 'out'}`}>{a.alert_type === 'inventory_low' ? <Package size={15}/> : a.alert_type === 'client_return' ? <UserRound size={15}/> : <AlertTriangle size={15}/>}</span>
        <span className="transaction-desc"><b>{a.title}</b><span className="transaction-method">{a.summary} · detectado em {formatDate(dateInZone(a.last_detected_at, tz), { day: '2-digit', month: 'short' })} {timeInZone(a.last_detected_at, tz)}</span></span>
        <span className="card-actions">
          {a.alert_type === 'inventory_low' && <Link className="link-button" href="/painel/estoque">Estoque</Link>}
          {a.alert_type === 'client_return' && a.client_id && <Link className="link-button" href={`/painel/clientes?cliente=${a.client_id}`}>Cliente</Link>}
          {manage && tab === 'open' && <ActionButton action={setAlertStatus} fields={{ id: a.id, status: 'resolved' }} className="link-button" title="Resolver"><CheckCheck size={13}/></ActionButton>}
          {manage && tab === 'open' && <ActionButton action={setAlertStatus} fields={{ id: a.id, status: 'dismissed' }} className="link-button danger" title="Dispensar"><X size={13}/></ActionButton>}
          {manage && tab !== 'open' && <ActionButton action={setAlertStatus} fields={{ id: a.id, status: 'open' }} className="link-button" title="Reabrir"><RotateCcw size={13}/></ActionButton>}
        </span>
      </div>)}</div>
      {!alerts.length && <EmptyState title={tab === 'open' ? 'Nenhum alerta aberto' : `Nenhum alerta ${TAB_LABEL[tab].toLowerCase()}`}>{tab === 'open' ? 'Quando um produto chegar ao mínimo ou um cliente passar do tempo habitual de retorno, o alerta aparece aqui.' : ''}</EmptyState>}
      <p className="finance-separation-note">Envio de mensagens de retorno por WhatsApp: em breve.</p>
    </section>
  </>;
}
