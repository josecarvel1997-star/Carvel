import { Check, Clock3 } from 'lucide-react';
import NavSelect from '@/app/painel/ui/nav-select';
import HoursForm from '@/app/painel/ui/hours-form';
import { saveWorkingHours } from '@/app/painel/actions';
import { canManage, type PanelContext } from '@/lib/panel/context';
import { effectiveHours } from '@/lib/panel/hours';
import { minutesToTime, WEEKDAYS } from '@/lib/time';
import { loadHours, loadStaff } from './data';

const UUID_RE = /^[0-9a-f-]{36}$/i;
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function HorariosView({ ctx, params }: { ctx: PanelContext; params: Record<string, string | undefined> }) {
  const [staff, rows] = await Promise.all([loadStaff(ctx), loadHours(ctx)]);
  const bookable = staff.filter((s) => s.role !== 'receptionist');
  const staffId = params.profissional && UUID_RE.test(params.profissional) && bookable.some((s) => s.id === params.profissional) ? params.profissional : '';
  const member = bookable.find((s) => s.id === staffId);
  const hasOwn = Boolean(staffId) && rows.some((r) => r.staff_id === staffId);
  const manage = canManage(ctx.role);

  const days = ORDER.map((weekday) => {
    const intervals = effectiveHours(rows, ctx.shop, staffId || null, weekday);
    const first = intervals[0], last = intervals[intervals.length - 1];
    return {
      weekday, label: WEEKDAYS[weekday], open: intervals.length > 0,
      start: first ? minutesToTime(first.start) : '09:00', end: last ? minutesToTime(last.end) : '19:00',
      breakStart: intervals.length > 1 ? minutesToTime(intervals[0].end) : '', breakEnd: intervals.length > 1 ? minutesToTime(intervals[1].start) : '',
    };
  });
  const options = [{ value: '', label: 'Horário geral da barbearia' }, ...bookable.map((s) => ({ value: s.id, label: s.display_name }))];
  const hrefs = Object.fromEntries(options.map((o) => [o.value, o.value ? `/painel/horarios?profissional=${o.value}` : '/painel/horarios']));
  const usingFallback = !rows.some((r) => r.staff_id === null);

  return <div className="settings-workspace">
    <aside className="settings-tabs hours-scope">
      <span className="dialog-extra-label">Editar horário de</span>
      <NavSelect label="Escolher horário" value={staffId} options={options} hrefFor={hrefs}/>
      <p className="form-hint">O horário geral vale para todos. Um profissional pode ter horário próprio, que substitui o geral só para ele.</p>
    </aside>
    <section className="workspace-card settings-panel">
      <div className="settings-panel-heading"><span className="settings-icon"><Clock3 size={19}/></span><div><h3>{member ? `Horário de ${member.display_name}` : 'Horário geral da barbearia'}</h3><p>{member ? (hasOwn ? 'Este profissional tem horário próprio.' : 'Hoje segue o horário geral da barbearia.') : usingFallback ? 'Baseado no horário informado na configuração inicial. Salve para confirmar.' : 'Usado na agenda e na página pública.'}</p></div></div>
      {manage ? <HoursForm key={staffId || "geral"} action={saveWorkingHours} staffId={staffId} inherit={Boolean(staffId) && !hasOwn} days={days}/>
        : <div className="hours-list">{days.map((d) => <div key={d.weekday}><b>{d.label}</b><span>{d.open ? `${d.start} — ${d.end}${d.breakStart ? ` (intervalo ${d.breakStart}–${d.breakEnd})` : ''}` : 'Fechado'}</span>{d.open && <Check size={14}/>}</div>)}</div>}
    </section>
  </div>;
}
