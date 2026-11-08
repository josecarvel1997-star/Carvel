import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCheck, Clock3, CreditCard, Scissors, UserRound, UsersRound } from 'lucide-react';
import type { PanelContext } from '@/lib/panel/context';
import { STATUS_LABEL, type AppointmentStatus } from '@/lib/panel/types';
import { formatDate, isValidDate, timeInZone, todayInZone } from '@/lib/time';
import { loadAppointments, loadClientOptions, loadClientsByIds, loadServices, loadStaff } from './data';
import { AppointmentDialog, brl, durationLabel, EmptyState, NewAppointmentDialog, StatusActions, StatusPill, statusClass, toMap, type Lookup } from './shared';

const FILTERS: (AppointmentStatus | 'todos')[] = ['todos', 'scheduled', 'confirmed', 'done', 'no_show', 'cancelled'];

async function loadDay(ctx: PanelContext, date: string) {
  const [services, staff, appointments] = await Promise.all([loadServices(ctx), loadStaff(ctx), loadAppointments(ctx, date, 1, { includeCancelled: true })]);
  const clients = await loadClientsByIds(ctx, appointments.map((a) => a.client_id));
  const lookup: Lookup = { services: toMap(services), staff: toMap(staff), clients: toMap(clients) };
  return { services, staff, appointments, lookup };
}

export default async function AtendimentosView({ ctx, params }: { ctx: PanelContext; params: Record<string, string | undefined> }) {
  const tz = ctx.shop.timezone;
  const today = todayInZone(tz);
  const date = params.data && isValidDate(params.data) ? params.data : today;
  const filter = FILTERS.includes(params.status as AppointmentStatus) ? params.status as AppointmentStatus | 'todos' : 'todos';
  const { appointments, lookup } = await loadDay(ctx, date);
  const count = (status: AppointmentStatus) => appointments.filter((a) => a.status === status).length;
  const visible = filter === 'todos' ? appointments : appointments.filter((a) => a.status === filter);
  const href = (status: string) => `/painel/atendimentos?${new URLSearchParams({ ...(date !== today ? { data: date } : {}), ...(status !== 'todos' ? { status } : {}) })}`;

  return <>
    <div className="appointment-status-summary">
      <div><span className="status-summary-dot scheduled"/><small>Agendados</small><b>{count('scheduled')}</b></div>
      <div><span className="status-summary-dot confirmed"/><small>Confirmados</small><b>{count('confirmed')}</b></div>
      <div><span className="status-summary-dot done"/><small>Concluídos</small><b>{count('done')}</b></div>
      <div><span className="status-summary-dot progress"/><small>Faltas e cancelamentos</small><b>{count('no_show') + count('cancelled')}</b></div>
    </div>
    <section className="workspace-card appointments-board">
      <div className="appointments-board-head"><div><h3>{date === today ? 'Atendimentos de hoje' : 'Atendimentos do dia'}</h3><p>{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}</p></div><form className="agenda-date-jump" action="/painel/atendimentos"><input type="date" name="data" defaultValue={date} aria-label="Escolher dia"/><button className="date-today-button">Ver</button></form></div>
      <div className="appointment-filter-tabs">{FILTERS.map((item) => <Link key={item} href={href(item)} className={filter === item ? 'active' : ''}>{item === 'todos' ? 'Todos' : STATUS_LABEL[item]}<small>{item === 'todos' ? appointments.length : count(item)}</small></Link>)}</div>
      <div className="appointments-demo-list">
        {visible.map((a) => {
          const client = lookup.clients.get(a.client_id), service = lookup.services.get(a.service_id), staff = lookup.staff.get(a.staff_id);
          const minutes = (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000;
          return <article className="appointment-demo-row" key={a.id}>
            <div className="appointment-demo-time"><b>{timeInZone(a.starts_at, tz)}</b><span>{durationLabel(minutes)}</span></div>
            <div className={`appointment-demo-rail rail-${statusClass(a.status).replace('status-', '')}`}><i/></div>
            <div className="appointment-demo-main">
              <div className="appointment-demo-title"><div><span className="appointment-demo-client"><UserRound size={14}/>{client?.name ?? 'Cliente'}</span><b>{service?.name ?? 'Serviço'}{a.source === 'public' ? ' · agendado online' : ''}</b></div><StatusPill status={a.status}/></div>
              <div className="appointment-demo-details"><span><Scissors size={13}/>{staff?.display_name ?? 'Profissional'}</span><b>{brl(a.price)}</b></div>
              {a.notes && <p className="appointment-note">{a.notes}</p>}
              <StatusActions appointment={a}/>
            </div>
            <AppointmentDialog appointment={a} lookup={lookup} timezone={tz} triggerClassName="workspace-secondary-button appointment-detail-button" trigger="Editar"/>
          </article>;
        })}
        {!visible.length && <EmptyState title="Nenhum atendimento aqui">Não há atendimentos {filter === 'todos' ? 'neste dia' : 'com este status neste dia'}.</EmptyState>}
      </div>
    </section>
  </>;
}

/** Visão geral para gerentes e recepção: números reais do dia e próximos horários. */
export async function OverviewView({ ctx }: { ctx: PanelContext }) {
  const tz = ctx.shop.timezone;
  const today = todayInZone(tz);
  const [{ services, staff, appointments, lookup }, clientOptions, { count: clientCount }] = await Promise.all([
    loadDay(ctx, today), loadClientOptions(ctx),
    ctx.supabase.from('clients').select('id', { count: 'exact', head: true }).eq('barbershop_id', ctx.shop.id),
  ]);
  const active = appointments.filter((a) => a.status !== 'cancelled');
  const doneValue = active.filter((a) => a.status === 'done').reduce((sum, a) => sum + a.price, 0);
  const upcoming = active.filter((a) => (a.status === 'scheduled' || a.status === 'confirmed') && new Date(a.ends_at).getTime() > Date.now()).slice(0, 6);
  return <>
    <div className="dashboard-welcome"><div><span>RESUMO DO DIA</span><h2>{active.length ? `${active.length} atendimento(s) hoje.` : 'Nenhum atendimento marcado hoje.'}</h2><p>Os números abaixo vêm da agenda real da barbearia.</p></div>{staff.some((s) => s.active) && services.some((s) => s.active) && <NewAppointmentDialog services={services} staff={staff} clients={clientOptions} date={today} triggerClassName="welcome-cta"/>}<div className="welcome-decoration"><CalendarDays size={104}/></div></div>
    <div className="workspace-metrics overview-metrics">
      <Metric icon={<CalendarDays size={18}/>} tone="lavender" label="Agendamentos hoje" value={String(active.length)} caption={`${appointments.filter((a) => a.status === 'confirmed').length} confirmados`}/>
      <Metric icon={<CheckCheck size={18}/>} tone="green" label="Concluídos hoje" value={String(appointments.filter((a) => a.status === 'done').length)} caption="atendimentos finalizados"/>
      <Metric icon={<CreditCard size={18}/>} tone="copper" label="Valor concluído hoje" value={brl(doneValue)} caption="soma dos atendimentos concluídos"/>
      <Metric icon={<UsersRound size={18}/>} tone="blue" label="Clientes cadastrados" value={String(clientCount ?? 0)} caption="na base da barbearia"/>
    </div>
    <section className="workspace-card upcoming-card"><div className="card-heading"><div><h3>Próximos atendimentos</h3><p>Agendados e confirmados para hoje</p></div><Link className="workspace-link-button" href="/painel/agenda">Ver agenda <ArrowRight size={15}/></Link></div>
      <div className="upcoming-list">{upcoming.map((a) => { const client = lookup.clients.get(a.client_id); return <div className="upcoming-item" key={a.id}><time>{timeInZone(a.starts_at, tz)}</time><span className="appointment-avatar">{(client?.name ?? '?').slice(0, 2).toUpperCase()}</span><span className="upcoming-person"><b>{client?.name ?? 'Cliente'}</b><small>{lookup.services.get(a.service_id)?.name} · {lookup.staff.get(a.staff_id)?.display_name}</small></span><StatusPill status={a.status}/><b className="upcoming-price">{brl(a.price)}</b></div>; })}
        {!upcoming.length && <EmptyState title="Sem próximos horários hoje"><Clock3 size={14}/> Novos agendamentos aparecem aqui automaticamente.</EmptyState>}</div>
    </section>
  </>;
}

function Metric({ icon, label, value, caption, tone }: { icon: React.ReactNode; label: string; value: string; caption: string; tone: string }) {
  return <article className="workspace-metric"><div className={`metric-symbol ${tone}`}>{icon}</div><span>{label}</span><div className="metric-value-row"><strong>{value}</strong></div><p>{caption}</p></article>;
}
