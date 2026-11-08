import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NavSelect from '@/app/painel/ui/nav-select';
import type { PanelContext } from '@/lib/panel/context';
import { effectiveHours } from '@/lib/panel/hours';
import { addDays, dateInZone, formatDate, isValidDate, minutesInZone, minutesToTime, startOfWeek, timeInZone, todayInZone, weekdayOf, WEEKDAYS_SHORT } from '@/lib/time';
import { loadAppointments, loadClientOptions, loadClientsByIds, loadHours, loadServices, loadStaff } from './data';
import { AppointmentDialog, EmptyState, NewAppointmentDialog, statusClass, toMap, type Lookup } from './shared';

const PX_PER_MIN = 1.2;
const UUID_RE = /^[0-9a-f-]{36}$/i;

export default async function AgendaView({ ctx, params }: { ctx: PanelContext; params: Record<string, string | undefined> }) {
  const tz = ctx.shop.timezone;
  const today = todayInZone(tz);
  const date = params.data && isValidDate(params.data) ? params.data : today;
  const view = params.visao === 'semana' ? 'semana' : 'dia';
  const staffFilter = params.profissional && UUID_RE.test(params.profissional) ? params.profissional : '';
  const rangeStart = view === 'dia' ? date : startOfWeek(date);
  const days = view === 'dia' ? 1 : 7;

  const [services, staff, hours, appointments, clientOptions] = await Promise.all([
    loadServices(ctx), loadStaff(ctx), loadHours(ctx),
    loadAppointments(ctx, rangeStart, days, { staffId: staffFilter || undefined }),
    loadClientOptions(ctx),
  ]);
  const clients = await loadClientsByIds(ctx, appointments.map((a) => a.client_id));
  const lookup: Lookup = { services: toMap(services), staff: toMap(staff), clients: toMap(clients) };

  const bookable = staff.filter((s) => s.active && s.role !== 'receptionist');
  const withAppointments = new Set(appointments.map((a) => a.staff_id));
  const columns = staff.filter((s) => (staffFilter ? s.id === staffFilter : bookable.includes(s) || withAppointments.has(s.id)));

  const href = (over: { data?: string; visao?: string; profissional?: string }) => {
    const q = new URLSearchParams();
    const next = { data: date, visao: view, profissional: staffFilter, ...over };
    if (next.data && next.data !== today) q.set('data', next.data);
    if (next.visao === 'semana') q.set('visao', 'semana');
    if (next.profissional) q.set('profissional', next.profissional);
    const s = q.toString();
    return `/painel/agenda${s ? `?${s}` : ''}`;
  };
  const staffOptions = [{ value: '', label: 'Todos os profissionais' }, ...staff.filter((s) => s.role !== 'receptionist').map((s) => ({ value: s.id, label: s.display_name + (s.active ? '' : ' (inativo)') }))];
  const staffHrefs = Object.fromEntries(staffOptions.map((o) => [o.value, href({ profissional: o.value })]));
  const dateLabel = view === 'dia'
    ? formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : `${formatDate(rangeStart, { day: 'numeric', month: 'short' })} – ${formatDate(addDays(rangeStart, 6), { day: 'numeric', month: 'short', year: 'numeric' })}`;
  const step = view === 'dia' ? 1 : 7;

  return <div className="agenda-view">
    <div className="agenda-toolbar">
      <div className="agenda-date-tools">
        <Link className="date-today-button" href={href({ data: today })}>Hoje</Link>
        <Link className="workspace-icon-button" href={href({ data: addDays(date, -step) })} aria-label="Anterior"><ChevronLeft size={17}/></Link>
        <Link className="workspace-icon-button" href={href({ data: addDays(date, step) })} aria-label="Próximo"><ChevronRight size={17}/></Link>
        <b>{dateLabel}</b>
        <form className="agenda-date-jump" action="/painel/agenda"><input type="date" name="data" defaultValue={date} aria-label="Ir para a data"/>{view === 'semana' && <input type="hidden" name="visao" value="semana"/>}{staffFilter && <input type="hidden" name="profissional" value={staffFilter}/>}<button className="date-today-button">Ir</button></form>
      </div>
      <div className="agenda-filters">
        <NavSelect label="Filtrar por profissional" value={staffFilter} options={staffOptions} hrefFor={staffHrefs}/>
        <div className="segmented-control"><Link className={view === 'dia' ? 'active' : ''} href={href({ visao: 'dia' })}>Dia</Link><Link className={view === 'semana' ? 'active' : ''} href={href({ visao: 'semana' })}>Semana</Link></div>
      </div>
    </div>

    <section className="workspace-card agenda-card">
      <div className="agenda-card-heading">
        <div><h3>{view === 'dia' ? 'Agenda do dia por profissional' : 'Semana por profissional'}</h3><p>{appointments.length} agendamento(s) ativos neste período. Toque em um horário para editar, mudar o status ou cancelar.</p></div>
        {bookable.length > 0 && services.some((s) => s.active) && <NewAppointmentDialog services={services} staff={staff} clients={clientOptions} date={date} staffId={staffFilter || undefined}/>}
      </div>
      {!bookable.length && !columns.length ? <EmptyState title="Nenhum profissional cadastrado" action={<Link className="workspace-primary-button compact" href="/painel/equipe">Cadastrar profissional</Link>}>A agenda é organizada por profissional. Cadastre quem atende para começar a marcar horários.</EmptyState>
        : !services.some((s) => s.active) ? <EmptyState title="Nenhum serviço ativo" action={<Link className="workspace-primary-button compact" href="/painel/servicos">Cadastrar serviço</Link>}>Cadastre pelo menos um serviço com duração e preço.</EmptyState>
        : view === 'dia' ? <DayGrid ctx={ctx} date={date} columns={columns} appointments={appointments} hours={hours} lookup={lookup}/>
        : <WeekGrid ctx={ctx} start={rangeStart} today={today} columns={columns} appointments={appointments} lookup={lookup} dayHref={(d) => href({ data: d, visao: 'dia' })}/>}
      <div className="agenda-legend"><span><i className="legend-scheduled"/> Agendado</span><span><i className="legend-confirmed"/> Confirmado</span><span><i className="legend-done"/> Concluído</span><span><i className="legend-noshow"/> Não compareceu</span><span><i className="legend-open"/> Horário de trabalho</span></div>
    </section>
  </div>;
}

type GridProps = { ctx: PanelContext; columns: Awaited<ReturnType<typeof loadStaff>>; appointments: Awaited<ReturnType<typeof loadAppointments>>; lookup: Lookup };

function DayGrid({ ctx, date, columns, appointments, hours, lookup }: GridProps & { date: string; hours: Awaited<ReturnType<typeof loadHours>> }) {
  const tz = ctx.shop.timezone;
  const weekday = weekdayOf(date);
  const intervals = new Map(columns.map((c) => [c.id, effectiveHours(hours, ctx.shop, c.id, weekday)]));
  const marks = [...intervals.values()].flat().flatMap((i) => [i.start, i.end]).concat(appointments.flatMap((a) => [minutesInZone(a.starts_at, tz), Math.min(24 * 60, minutesInZone(a.starts_at, tz) + (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000)]));
  const gridStart = Math.floor((marks.length ? Math.min(...marks) : 8 * 60) / 60) * 60;
  const gridEnd = Math.min(24 * 60, Math.ceil((marks.length ? Math.max(...marks) : 19 * 60) / 60) * 60);
  const height = Math.max(60, gridEnd - gridStart) * PX_PER_MIN;
  const hourMarks: number[] = [];
  for (let m = gridStart; m <= gridEnd; m += 60) hourMarks.push(m);

  return <div className="day-grid-wrap">
    <div className="day-grid" style={{ gridTemplateColumns: `52px repeat(${columns.length}, minmax(150px, 1fr))` }}>
      <div className="day-grid-corner"/>
      {columns.map((c) => <div className="day-grid-head" key={c.id}><b>{c.display_name}</b><small>{appointments.filter((a) => a.staff_id === c.id).length} agendamento(s){(intervals.get(c.id) ?? []).length ? '' : ' · folga'}</small></div>)}
      <div className="day-grid-times" style={{ height }}>{hourMarks.map((m) => <time key={m} style={{ top: (m - gridStart) * PX_PER_MIN }}>{minutesToTime(m)}</time>)}</div>
      {columns.map((c) => <div className="day-grid-col" key={c.id} style={{ height, backgroundSize: `100% ${60 * PX_PER_MIN}px` }}>
        {(intervals.get(c.id) ?? []).map((i) => <span key={i.start} className="day-grid-open" style={{ top: (i.start - gridStart) * PX_PER_MIN, height: (i.end - i.start) * PX_PER_MIN }}/>)}
        {appointments.filter((a) => a.staff_id === c.id).map((a) => {
          const start = minutesInZone(a.starts_at, tz);
          const duration = (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000;
          const client = lookup.clients.get(a.client_id), service = lookup.services.get(a.service_id);
          return <AppointmentDialog key={a.id} appointment={a} lookup={lookup} timezone={tz} triggerClassName={`agenda-block ${statusClass(a.status)}`} triggerStyle={{ top: (start - gridStart) * PX_PER_MIN, height: Math.max(22, Math.min(duration, gridEnd - start) * PX_PER_MIN - 2) }}
            trigger={<><b>{timeInZone(a.starts_at, tz)} · {client?.name ?? 'Cliente'}</b><small>{service?.name ?? 'Serviço'}{a.source === 'public' ? ' · online' : ''}</small></>}/>;
        })}
      </div>)}
    </div>
  </div>;
}

function WeekGrid({ ctx, start, today, columns, appointments, lookup, dayHref }: GridProps & { start: string; today: string; dayHref: (date: string) => string }) {
  const tz = ctx.shop.timezone;
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const byCell = new Map<string, typeof appointments>();
  for (const a of appointments) {
    const key = `${a.staff_id}|${dateInZone(a.starts_at, tz)}`;
    byCell.set(key, [...(byCell.get(key) ?? []), a]);
  }
  return <div className="week-grid-wrap"><table className="week-grid">
    <thead><tr><th>Profissional</th>{days.map((d) => <th key={d} className={d === today ? 'is-today' : ''}><Link href={dayHref(d)}>{WEEKDAYS_SHORT[weekdayOf(d)]} {d.slice(8)}</Link></th>)}</tr></thead>
    <tbody>{columns.map((c) => <tr key={c.id}><th>{c.display_name}</th>{days.map((d) => <td key={d} className={d === today ? 'is-today' : ''}>
      {(byCell.get(`${c.id}|${d}`) ?? []).map((a) => <AppointmentDialog key={a.id} appointment={a} lookup={lookup} timezone={tz} triggerClassName={`week-chip ${statusClass(a.status)}`}
        trigger={<><b>{timeInZone(a.starts_at, tz)}</b> {lookup.clients.get(a.client_id)?.name ?? 'Cliente'}</>}/>)}
    </td>)}</tr>)}</tbody>
  </table></div>;
}
