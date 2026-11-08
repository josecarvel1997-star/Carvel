'use client';

import { useActionState, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, Pencil, Plus, X } from 'lucide-react';
import { initialActionState, type ActionState } from '@/lib/panel/types';

type Props = {
  title: string;
  description?: string;
  eyebrow?: string;
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  submitLabel: string;
  trigger: ReactNode;
  triggerClassName?: string;
  triggerIcon?: 'plus' | 'edit';
  triggerLabel?: string;
  triggerStyle?: CSSProperties;
  extra?: ReactNode;
  children: ReactNode;
};

/** Diálogo com formulário ligado a uma Server Action (useActionState). Fecha sozinho quando a action dá certo. */
export default function FormDialog({ title, description, eyebrow, action, submitLabel, trigger, triggerClassName = 'workspace-primary-button', triggerIcon, triggerLabel, triggerStyle, extra, children }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [toast, setToast] = useState('');
  const [openedAt, setOpenedAt] = useState(0);

  useEffect(() => {
    if (!state.at) return;
    if (state.ok) {
      setOpen(false);
      setToast(state.message);
      const timer = window.setTimeout(() => setToast(''), 2800);
      return () => window.clearTimeout(timer);
    }
  }, [state]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return <>
    <button type="button" className={triggerClassName} onClick={() => { setOpenedAt(Date.now()); setOpen(true); }} aria-label={triggerLabel} style={triggerStyle}>
      {triggerIcon === 'plus' && <Plus size={16}/>}{triggerIcon === 'edit' && <Pencil size={14}/>}{trigger}
    </button>
    {open && <div className="drawer-backdrop modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="demo-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header><div>{eyebrow && <span className="workspace-date-label">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div><button type="button" className="workspace-icon-button" onClick={() => setOpen(false)} aria-label="Fechar"><X size={18}/></button></header>
        <form action={formAction} className="demo-form">
          {children}
          {!state.ok && state.message && state.at > openedAt && <div className="form-error" role="alert">{state.message}</div>}
          <div className="demo-modal-actions"><button type="button" className="workspace-secondary-button" onClick={() => setOpen(false)}>Fechar</button><button type="submit" className="workspace-primary-button" disabled={pending}><Check size={16}/>{pending ? 'Salvando…' : submitLabel}</button></div>
        </form>
        {extra && <div className="dialog-extra">{extra}</div>}
      </section>
    </div>}
    {toast && <div className="workspace-toast" role="status"><Check size={16}/>{toast}</div>}
  </>;
}
