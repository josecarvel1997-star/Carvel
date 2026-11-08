'use client';

import { useActionState, useEffect, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { initialActionState, type ActionState } from '@/lib/panel/types';

type Props = {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  children: ReactNode;
  className?: string;
  confirmMessage?: string;
  title?: string;
};

/** Botão isolado que dispara uma Server Action com campos ocultos (mudar status, excluir…). */
export default function ActionButton({ action, fields, children, className = 'workspace-secondary-button', confirmMessage, title }: Props) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [notice, setNotice] = useState<ActionState | null>(null);
  useEffect(() => {
    if (!state.at) return;
    setNotice(state);
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [state]);
  return <form action={formAction} className="inline-action" onSubmit={(event) => { if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault(); }}>
    {Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value}/>)}
    <button type="submit" className={className} disabled={pending} title={title}>{children}</button>
    {notice && <div className={`workspace-toast ${notice.ok ? '' : 'toast-error'}`} role="status">{notice.ok && <Check size={16}/>}{notice.message}</div>}
  </form>;
}
