'use client';

import { useActionState, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { initialActionState, type ActionState } from '@/lib/panel/types';

type Day = { key: string; label: string; open: boolean; start: string; end: string };
type Props = { action: (state: ActionState, form: FormData) => Promise<ActionState>; days: Day[] };

/** Edita barbershops.opening_hours (abre/fecha por dia da semana). */
export default function HoursForm({ action, days }: Props) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [openDays, setOpenDays] = useState(() => Object.fromEntries(days.map((d) => [d.key, d.open])));
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (state.at) { setVisible(true); const t = window.setTimeout(() => setVisible(false), 3200); return () => window.clearTimeout(t); } }, [state]);

  return <form action={formAction} className="hours-form">
    <div className="hours-grid">
      <div className="hours-grid-head"><span>Dia</span><span>Abre</span><span>Fecha</span><span/></div>
      {days.map((d) => <div className="hours-grid-row" key={d.key}>
        <label className="checkbox-row"><input type="checkbox" name={`open_${d.key}`} checked={Boolean(openDays[d.key])} onChange={(e) => setOpenDays((cur) => ({ ...cur, [d.key]: e.target.checked }))}/> {d.label}</label>
        {/* Campos de dias fechados continuam sendo enviados (readOnly) para preservar o último horário salvo. */}
        <input type="time" name={`start_${d.key}`} defaultValue={d.start} readOnly={!openDays[d.key]} aria-label={`${d.label}: abre`}/>
        <input type="time" name={`end_${d.key}`} defaultValue={d.end} readOnly={!openDays[d.key]} aria-label={`${d.label}: fecha`}/>
        <span className="form-hint">{openDays[d.key] ? '' : 'Fechado'}</span>
      </div>)}
    </div>
    <div className="settings-save-row"><span>{state.at && !state.ok ? <b className="form-error-inline">{state.message}</b> : 'Agendamentos já marcados não são alterados.'}</span><button className="workspace-primary-button" disabled={pending}><Check size={15}/>{pending ? 'Salvando…' : 'Salvar horários'}</button></div>
    {visible && state.ok && <div className="workspace-toast" role="status"><Check size={16}/>{state.message}</div>}
  </form>;
}
