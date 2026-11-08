'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { initialActionState, type ActionState } from '@/lib/panel/types';

type ProductOption = { id: string; name: string; price: number; available: number };
type ClientOption = { id: string; label: string };
type Props = {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  products: ProductOption[];
  clients: ClientOption[];
  paymentMethods: { value: string; label: string }[];
};

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Venda de balcão (PDV): monta o carrinho no navegador; a venda é validada e gravada por register_pdv_sale. */
export default function PdvForm({ action, products, clients, paymentMethods }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [pick, setPick] = useState('');
  const [toast, setToast] = useState('');
  const [openedAt, setOpenedAt] = useState(0);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const lines = Object.entries(cart).filter(([id, qty]) => qty > 0 && byId.has(id)).map(([id, qty]) => ({ product: byId.get(id)!, qty }));
  const total = lines.reduce((sum, l) => sum + l.qty * l.product.price, 0);

  useEffect(() => {
    if (!state.at || !state.ok) return;
    setOpen(false); setCart({}); setToast(state.message);
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [state]);

  const change = (id: string, delta: number) => setCart((cur) => {
    const max = Math.min(100, byId.get(id)?.available ?? 0);
    const next = Math.max(0, Math.min(max, (cur[id] ?? 0) + delta));
    return { ...cur, [id]: next };
  });

  return <>
    <button type="button" className="workspace-primary-button compact" onClick={() => { setOpenedAt(Date.now()); setOpen(true); }} disabled={!products.length} title={products.length ? undefined : 'Cadastre produtos com estoque para vender'}><ShoppingCart size={16}/>Nova venda (PDV)</button>
    {open && <div className="drawer-backdrop modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="demo-modal" role="dialog" aria-modal="true" aria-label="Nova venda">
        <header><div><span className="workspace-date-label">PDV</span><h2>Nova venda</h2><p>O estoque é conferido e baixado no momento da gravação.</p></div><button type="button" className="workspace-icon-button" onClick={() => setOpen(false)} aria-label="Fechar"><X size={18}/></button></header>
        <form action={formAction} className="demo-form">
          <input type="hidden" name="items" value={JSON.stringify(lines.map((l) => ({ product_id: l.product.id, quantity: l.qty })))}/>
          <div className="demo-form-row two">
            <label>Produto<select value={pick} onChange={(e) => setPick(e.target.value)}><option value="">Selecione</option>{products.map((p) => <option key={p.id} value={p.id} disabled={p.available < 1}>{p.name} · {brl(p.price)} · {p.available} disp.</option>)}</select></label>
            <label>&nbsp;<button type="button" className="workspace-secondary-button" disabled={!pick} onClick={() => { change(pick, 1); setPick(''); }}><Plus size={14}/>Adicionar</button></label>
          </div>
          <div className="pdv-cart">
            {lines.map((l) => <div className="pdv-line" key={l.product.id}>
              <span>{l.product.name}<small>{brl(l.product.price)} cada</small></span>
              <span className="pdv-qty"><button type="button" onClick={() => change(l.product.id, -1)} aria-label="Diminuir"><Minus size={12}/></button><b>{l.qty}</b><button type="button" onClick={() => change(l.product.id, 1)} aria-label="Aumentar"><Plus size={12}/></button></span>
              <b>{brl(l.qty * l.product.price)}</b>
              <button type="button" className="link-button danger" onClick={() => setCart((cur) => ({ ...cur, [l.product.id]: 0 }))} aria-label="Remover"><Trash2 size={13}/></button>
            </div>)}
            {!lines.length && <p className="form-hint">Nenhum produto no carrinho.</p>}
            <div className="pdv-total"><span>Total</span><b>{brl(total)}</b></div>
          </div>
          <div className="demo-form-row two">
            <label>Forma de pagamento<select name="payment_method" required defaultValue=""><option value="" disabled>Selecione</option>{paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
            <label>Cliente (opcional)<select name="client_id" defaultValue=""><option value="">Venda sem cliente</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
          </div>
          {!state.ok && state.message && state.at > openedAt && <div className="form-error" role="alert">{state.message}</div>}
          <div className="demo-modal-actions"><button type="button" className="workspace-secondary-button" onClick={() => setOpen(false)}>Fechar</button><button type="submit" className="workspace-primary-button" disabled={pending || !lines.length}><Check size={16}/>{pending ? 'Registrando…' : `Registrar ${brl(total)}`}</button></div>
        </form>
      </section>
    </div>}
    {toast && <div className="workspace-toast" role="status"><Check size={16}/>{toast}</div>}
  </>;
}
