import { Check, Clock3 } from 'lucide-react';
import HoursForm from '@/app/painel/ui/hours-form';
import { saveOpeningHours } from '@/app/painel/actions';
import { canManage, type PanelContext } from '@/lib/panel/context';
import { DAY_KEYS } from '@/lib/panel/hours';
import { WEEKDAYS } from '@/lib/time';

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function HorariosView({ ctx }: { ctx: PanelContext }) {
  const manage = canManage(ctx.role);
  const days = ORDER.map((weekday) => {
    const key = DAY_KEYS[weekday];
    const day = ctx.shop.opening_hours?.[key];
    return { key, label: WEEKDAYS[weekday], open: Boolean(day && !day.closed), start: day?.open || '09:00', end: day?.close || '18:00' };
  });

  return <div className="settings-workspace">
    <aside className="settings-tabs hours-scope">
      <span className="dialog-extra-label">Horário de funcionamento</span>
      <p className="form-hint">Vale para a agenda, para o painel e para a página pública: o banco recusa agendamentos fora destes horários.</p>
      <p className="form-hint"><span className="soon-badge">Em breve</span> Horário próprio por profissional e intervalos de almoço.</p>
    </aside>
    <section className="workspace-card settings-panel">
      <div className="settings-panel-heading"><span className="settings-icon"><Clock3 size={19}/></span><div><h3>Horário geral da barbearia</h3><p>Os horários livres da página pública são oferecidos em intervalos de 15 minutos.</p></div></div>
      {manage ? <HoursForm action={saveOpeningHours} days={days}/>
        : <div className="hours-list">{days.map((d) => <div key={d.key}><b>{d.label}</b><span>{d.open ? `${d.start} — ${d.end}` : 'Fechado'}</span>{d.open && <Check size={14}/>}</div>)}</div>}
    </section>
  </div>;
}
