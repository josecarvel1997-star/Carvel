import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCheck, Clock3, CreditCard, Package, Receipt, Scissors, Trash2, UserRound, UsersRound } from 'lucide-react';
import FormDialog from '@/app/painel/ui/form-dialog';
import ActionButton from '@/app/painel/ui/action-button';
import { addOrderItem, closeServiceOrder, openServiceOrder, removeOrderItem } from '@/app/painel/finance-actions';
import { canOperateCash, type PanelContext } from '@/lib/panel/context';
import { isActiveStatus, PAYMENT_LABEL, PAYMENT_METHODS, STATUS_LABEL, type Appointment, type AppointmentStatus, type Product, type ServiceOrder, type ServiceOrderItem } from '@/lib/panel/types';
import { formatDate, isValidDate, timeInZone, todayInZone } from '@/lib/time';
import { loadAppointments, loadClientOptions, loadClientsByIds, loadOrders, loadProducts, loadServices, loadStaff } from './data';
import { AppointmentDialog, brl, durationLabel, EmptyState, NewAppointmentDialog, StatusActions, StatusPill, statusClass, toMap, type Lookup } from './shared';

const FILTERS: (AppointmentStatus | 'todos')[] = ['todos', 'requested', 'scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled'];
const ORDER_LABEL = { open: 'Comanda aberta', closed: 'Comanda paga', cancelled: 'Comanda cancelada' } as const;

async function loadDay(ctx: PanelContext, date: string) {
  const [services, staff, appointments] = await Promise.all([loadServices(ctx), loadStaff(ctx), loadAppointments(ctx, date, 1, { includeInactive: true })]);
  const [clients, { orders, items }] = await Promise.all([loadClientsByIds(ctx, appointments.map((a) => a.client_id)), loadOrders(ctx, appointments.map((a) => a.id))]);
  const lookup: Lookup = { services: toMap(services), staff: toMap(staff), clients: toMap(clients) };
  return { services, staff, appointments, lookup, orders, items };
}

export default async function AtendimentosView({ ctx, params }: { ctx: PanelContext; params: Record<string, string | undefined> }) {
  const tz = ctx.shop.timezone;
  const today = todayInZone(tz);
  const date = params.data && isValidDate(params.data) ? params.data : today;
  const filter = FILTERS.includes(params.status as AppointmentStatus) ? params.status as AppointmentStatus | 'todos' : 'todos';
  const cash = canOperateCash(ctx.role);
  const [{ appointments, lookup, orders, items }, products] = await Promise.all([loadDay(ctx, date), cash ? loadProducts(ctx, true) : Promise.resolve([] as Product[])]);
  const count = (...status: AppointmentStatus[]) => appointments.filter((a) => status.includes(a.status)).length;
  const visible = filter === 'todos' ? appointments : appointments.filter((a) => a.status === filter);
  const href = (status: string) => `/painel/atendimentos?${new URLSearchParams({ ...(date !== today ? { data: date } : {}), ...(status !== 'todos' ? { status } : {}) })}`;

  return <>
    <div className="appointment-status-summary">
      <div><span className="status-summary-dot scheduled"/><small>Agendados e confirmados</small><b>{count('requested', 'scheduled', 'confirmed')}</b></div>
      <div><span className="status-summary-dot progress"/><small>Em atendimento</small><b>{count('in_progress')}</b></div>
      <div><span className="status-summary-dot done"/><small>Concluídos</small><b>{count('completed')}</b></div>
      <div><span className="status-summary-dot confirmed"/><small>Faltas e cancelamentos</small><b>{count('no_show', 'cancelled')}</b></div>
    </div>
    <section className="workspace-card appointments-board">
      <div className="appointments-board-head"><div><h3>{date === today ? 'Atendimentos de hoje' : 'Atendimentos do dia'}</h3><p>{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}</p></div><form className="agenda-date-jump" action="/painel/atendimentos"><input type="date" name="data" defaultValue={date} aria-label="Escolher dia"/><button className="date-today-button">Ver</button></form></div>
      <div className="appointment-filter-tabs">{FILTERS.map((item) => <Link key={item} href={href(item)} className={filter === item ? 'active' : ''}>{item === 'todos' ? 'Todos' : STATUS_LABEL[item]}<small>{item === 'todos' ? appointments.length : count(item)}</small></Link>)}</div>
      <div className="appointments-demo-list">
        {visible.map((a) => {
          const client = lookup.clients.get(a.client_id), service = lookup.services.get(a.service_id), staff = a.staff_profile_id ? lookup.staff.get(a.staff_profile_id) : undefined;
          const order = orders.get(a.id);
          return <article className="appointment-demo-row" key={a.id}>
            <div className="appointment-demo-time"><b>{timeInZone(a.starts_at, tz)}</b><span>{durationLabel(a.duration_minutes)}</span></div>
            <div className={`appointment-demo-rail rail-${statusClass(a.status).replace('status-', '')}`}><i/></div>
            <div className="appointment-demo-main">
              <div className="appointment-demo-title"><div><span className="appointment-demo-client"><UserRound size={14}/>{client?.full_name ?? 'Cliente'}</span><b>{service?.name ?? 'Serviço'}{a.source === 'public' ? ' · agendado online' : ''}</b></div><StatusPill status={a.status}/></div>
              <div className="appointment-demo-details"><span><Scissors size={13}/>{staff?.display_name ?? 'Sem profissional'}</span><b>{brl(a.price)}</b></div>
              {a.notes && <p className="appointment-note">{a.notes}</p>}
              <StatusActions appointment={a} hasOpenOrder={order?.status === 'open'}/>
              <OrderPanel appointment={a} order={order} items={order ? items.get(order.id) ?? [] : []} products={products} canOperate={cash}/>
            </div>
            <AppointmentDialog appointment={a} lookup={lookup} timezone={tz} hasOpenOrder={order?.status === 'open'} triggerClassName="workspace-secondary-button appointment-detail-button" trigger={isActiveStatus(a.status) ? 'Editar' : 'Detalhes'}/>
          </article>;
        })}
        {!visible.length && <EmptyState title="Nenhum atendimento aqui">Não há atendimentos {filter === 'todos' ? 'neste dia' : 'com este status neste dia'}.</EmptyState>}
      </div>
    </section>
  </>;
}

/** Comanda do atendimento: produtos lançados, total e fechamento com pagamento (close_service_order). */
function OrderPanel({ appointment, order, items, products, canOperate }: { appointment: Appointment; order?: ServiceOrder; items: ServiceOrderItem[]; products: Product[]; canOperate: boolean }) {
  if (!order) {
    if (!canOperate || !isActiveStatus(appointment.status)) return null;
    return <div className="order-panel"><span className="order-panel-title"><Receipt size={14}/> Sem comanda</span><ActionButton action={openServiceOrder} fields={{ appointment_id: appointment.id }} className="workspace-secondary-button small"><Receipt size={14}/>Abrir comanda</ActionButton></div>;
  }
  const productTotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const total = appointment.price + productTotal;
  const open = order.status === 'open' && canOperate;
  const available = products.filter((p) => p.quantity - p.reserved_quantity > 0);
  return <div className="order-panel">
    <span className="order-panel-title"><Receipt size={14}/> {ORDER_LABEL[order.status]} · <b>{brl(total)}</b></span>
    <div className="order-items">
      <span><Scissors size={12}/> Serviço <b>{brl(appointment.price)}</b></span>
      {items.map((i) => <span key={i.id}><Package size={12}/> {i.quantity}× {i.product_name} <b>{brl(i.quantity * i.unit_price)}</b>{open && <ActionButton action={removeOrderItem} fields={{ item_id: i.id }} className="link-button danger" title="Remover item"><Trash2 size={12}/></ActionButton>}</span>)}
    </div>
    {open && <div className="status-actions">
      <FormDialog title="Lançar produto" eyebrow="COMANDA" description="O produto fica reservado no estoque e é baixado quando a comanda é paga." action={addOrderItem} submitLabel="Lançar" trigger="Lançar produto" triggerIcon="plus" triggerClassName="workspace-secondary-button small">
        <input type="hidden" name="order_id" value={order.id}/>
        {available.length ? <div className="demo-form-row two">
          <label>Produto<select name="product_id" required defaultValue=""><option value="" disabled>Selecione</option>{available.map((p) => <option key={p.id} value={p.id}>{p.name} · {brl(p.unit_price)} · {p.quantity - p.reserved_quantity} disp.</option>)}</select></label>
          <label>Quantidade<input name="quantity" type="number" min={1} max={50} step={1} defaultValue={1} required/></label>
        </div> : <p className="form-hint">Nenhum produto ativo com estoque disponível. Cadastre em Produtos e estoque.</p>}
      </FormDialog>
      <FormDialog title="Fechar comanda" eyebrow="COMANDA" description={`Total ${brl(total)}. Ao confirmar, a venda é registrada, o caixa recebe o lançamento, o estoque é baixado, a comissão é apurada e o atendimento fica concluído.`} action={closeServiceOrder} submitLabel="Confirmar pagamento" trigger="Fechar e receber" triggerClassName="workspace-primary-button compact">
        <input type="hidden" name="order_id" value={order.id}/>
        <label>Forma de pagamento<select name="payment_method" required defaultValue=""><option value="" disabled>Selecione</option>{PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_LABEL[m]}</option>)}</select></label>
        <small className="form-hint">A taxa da forma de pagamento (Caixa e financeiro → Taxas) é descontada do valor retido e da base da comissão.</small>
      </FormDialog>
    </div>}
  </div>;
}

/** Visão geral para gerentes e recepção: números reais do dia e próximos horários. */
export async function OverviewView({ ctx }: { ctx: PanelContext }) {
  const tz = ctx.shop.timezone;
  const today = todayInZone(tz);
  const [{ services, staff, appointments, lookup }, clientOptions, { count: clientCount }] = await Promise.all([
    loadDay(ctx, today), loadClientOptions(ctx),
    ctx.supabase.from('clients').select('id', { count: 'exact', head: true }).eq('barbershop_id', ctx.shop.id),
  ]);
  const active = appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'no_show');
  const doneValue = appointments.filter((a) => a.status === 'completed').reduce((sum, a) => sum + a.price, 0);
  const upcoming = active.filter((a) => isActiveStatus(a.status) && new Date(a.ends_at).getTime() > Date.now()).slice(0, 6);
  return <>
    <div className="dashboard-welcome"><div><span>RESUMO DO DIA</span><h2>{active.length ? `${active.length} atendimento(s) hoje.` : 'Nenhum atendimento marcado hoje.'}</h2><p>Os números abaixo vêm da agenda real da barbearia.</p></div>{staff.some((s) => s.active) && services.some((s) => s.active) && <NewAppointmentDialog services={services} staff={staff} clients={clientOptions} date={today} triggerClassName="welcome-cta"/>}<div className="welcome-decoration"><CalendarDays size={104}/></div></div>
    <div className="workspace-metrics overview-metrics">
      <Metric icon={<CalendarDays size={18}/>} tone="lavender" label="Agendamentos hoje" value={String(active.length)} caption={`${appointments.filter((a) => a.status === 'confirmed').length} confirmados`}/>
      <Metric icon={<CheckCheck size={18}/>} tone="green" label="Concluídos hoje" value={String(appointments.filter((a) => a.status === 'completed').length)} caption="atendimentos finalizados"/>
      <Metric icon={<CreditCard size={18}/>} tone="copper" label="Serviços concluídos hoje" value={brl(doneValue)} caption="soma do valor dos serviços"/>
      <Metric icon={<UsersRound size={18}/>} tone="blue" label="Clientes cadastrados" value={String(clientCount ?? 0)} caption="na base da barbearia"/>
    </div>
    <section className="workspace-card upcoming-card"><div className="card-heading"><div><h3>Próximos atendimentos</h3><p>Ainda não finalizados hoje</p></div><Link className="workspace-link-button" href="/painel/agenda">Ver agenda <ArrowRight size={15}/></Link></div>
      <div className="upcoming-list">{upcoming.map((a) => { const client = lookup.clients.get(a.client_id); return <div className="upcoming-item" key={a.id}><time>{timeInZone(a.starts_at, tz)}</time><span className="appointment-avatar">{(client?.full_name ?? '?').slice(0, 2).toUpperCase()}</span><span className="upcoming-person"><b>{client?.full_name ?? 'Cliente'}</b><small>{lookup.services.get(a.service_id)?.name} · {a.staff_profile_id ? lookup.staff.get(a.staff_profile_id)?.display_name : 'Sem profissional'}</small></span><StatusPill status={a.status}/><b className="upcoming-price">{brl(a.price)}</b></div>; })}
        {!upcoming.length && <EmptyState title="Sem próximos horários hoje"><Clock3 size={14}/> Novos agendamentos aparecem aqui automaticamente.</EmptyState>}</div>
    </section>
  </>;
}

function Metric({ icon, label, value, caption, tone }: { icon: React.ReactNode; label: string; value: string; caption: string; tone: string }) {
  return <article className="workspace-metric"><div className={`metric-symbol ${tone}`}>{icon}</div><span>{label}</span><div className="metric-value-row"><strong>{value}</strong></div><p>{caption}</p></article>;
}
