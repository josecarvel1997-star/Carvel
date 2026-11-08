'use client';

import { useActionState, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { initialActionState, type ActionState } from '@/lib/panel/types';

type Day = { weekday: number; label: string; open: boolean; start: string; end: string; breakStart: string; breakEnd: string };
type Props = { action: (state: ActionState, form: FormData) => Promise<ActionState>; staffId: string; inherit: boolean; days: Day[] };

export default function HoursForm({ action, staffId, inherit, days }: Props) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [mode, setMode] = useState(inherit ? 'inherit' : 'custom');
  const [openDays, setOpenDays] = useState(() => Object.fromEntries(days.map((d) => [d.weekday, d.open])));
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (state.at) { setVisible(true); const t = window.setTimeout(() => setVisible(false), 3200); return () => window.clearTimeout(t); } }, [state]);
  const locked = Boolean(staffId) && mode === 'inherit';

  return <form action={formAction} className="hours-form">
    <input type="hidden" name="staff_id" value={staffId}/>
    {staffId && <div className="hours-mode">
      <label><input type="radio" name="mode" value="inherit" checked={mode === 'inherit'} onChange={() => setMode('inherit')}/> Usar horário da barbearia</label>
      <label><input type="radio" name="mode" value="custom" checked={mode === 'custom'} onChange={() => setMode('custom')}/> Horário próprio</label>
    </div>}
    <div className={`hours-grid ${locked ? 'is-locked' : ''}`}>
      <div className="hours-grid-head"><span>Dia</span><span>Abre</span><span>Fecha</span><span>Intervalo (opcional)</span></div>
      {days.map((d) => <div className="hours-grid-row" key={d.weekday}>
        <label className="checkbox-row"><input type="checkbox" name={`open_${d.weekday}`} checked={Boolean(openDays[d.weekday])} disabled={locked} onChange={(e) => setOpenDays((cur) => ({ ...cur, [d.weekday]: e.target.checked }))}/> {d.label}</label>
        <input type="time" name={`start_${d.weekday}`} defaultValue={d.start} disabled={locked || !openDays[d.weekday]} aria-label={`${d.label}: abre`}/>
        <input type="time" name={`end_${d.weekday}`} defaultValue={d.end} disabled={locked || !openDays[d.weekday]} aria-label={`${d.label}: fecha`}/>
        <span className="hours-break"><input type="time" name={`break_start_${d.weekday}`} defaultValue={d.breakStart} disabled={locked || !openDays[d.weekday]} aria-label={`${d.label}: início do intervalo`}/><i>até</i><input type="time" name={`break_end_${d.weekday}`} defaultValue={d.breakEnd} disabled={locked || !openDays[d.weekday]} aria-label={`${d.label}: fim do intervalo`}/></span>
      </div>)}
    </div>
    <div className="settings-save-row"><span>{state.at && !state.ok ? <b className="form-error-inline">{state.message}</b> : 'Os horários livres da página pública são calculados a partir daqui, em intervalos de 30 minutos.'}</span><button className="workspace-primary-button" disabled={pending}><Check size={15}/>{pending ? 'Salvando…' : 'Salvar horários'}</button></div>
    {visible && state.ok && <div className="workspace-toast" role="status"><Check size={16}/>{state.message}</div>}
  </form>;
}
