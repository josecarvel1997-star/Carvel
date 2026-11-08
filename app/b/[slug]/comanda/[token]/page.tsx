import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, Package, Scissors, Trash2, UserRound } from 'lucide-react';
import Brand from '@/app/components/brand';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/panel/context';
import { STATUS_LABEL, type AppointmentStatus } from '@/lib/panel/types';
import { addMyItem, removeMyItem } from './actions';

export const metadata: Metadata = { title: 'Meu atendimento · Agenda Certa', robots: { index: false, follow: false } };

const TOKEN_RE = /^[0-9a-f]{64}$/;
type Details = {
  business: { name: string; slug: string; phone: string };
  appointment: { id: string; starts_at: string; status: AppointmentStatus; client_name: string; service_name: string; professional_name: string; duration_minutes: number; service_price: number };
  order: { id: string; status: string; items: { id: string; product_id: string | null; name: string; quantity: number; unit_price: number; line_total: number }[] };
  products: { id: string; name: string; price: number; available: number }[];
};
const brl = (v: number) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Página pessoal do cliente (link com token devolvido por create_public_booking). Usa public_order_details. */
export default async function MyOrderPage({ params, searchParams }: { params: Promise<{ slug: string; token: string }>; searchParams: Promise<{ erro?: string }> }) {
  const { slug, token } = await params;
  const { erro } = await searchParams;
  let details: Details | null = null, timezone = 'America/Sao_Paulo';
  if (TOKEN_RE.test(token) && hasSupabaseEnv()) {
    const supabase = await createClient();
    const [{ data }, { data: catalog }] = await Promise.all([supabase.rpc('public_order_details', { customer_token: token }), supabase.rpc('public_booking_catalog', { target_slug: slug })]);
    details = (data as Details | null) ?? null;
    timezone = (catalog as { business?: { timezone?: string } } | null)?.business?.timezone || timezone;
  }
  if (!details || details.business.slug !== slug) {
    return <main className="setup"><section className="setup-card"><Brand/><h1>Atendimento não encontrado</h1><p>Este link não existe, ou o atendimento já foi concluído ou cancelado.</p><Link className="button" href={`/b/${slug}`}>Fazer um agendamento</Link></section></main>;
  }
  const { business, appointment, order, products } = details;
  const total = Number(appointment.service_price) + order.items.reduce((s, i) => s + Number(i.line_total), 0);
  const when = new Date(appointment.starts_at).toLocaleString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: timezone });
  const open = order.status === 'open';

  return <main className="setup"><section className="setup-card">
    <Brand/>
    <span className="eyebrow">{business.name.toLocaleUpperCase('pt-BR')} · {STATUS_LABEL[appointment.status] ?? appointment.status}</span>
    <h1>Olá, {appointment.client_name.split(' ')[0]}!</h1>
    <div className="public-confirm-summary">
      <span><Scissors size={15}/>{appointment.service_name} · {brl(appointment.service_price)}</span>
      <span><UserRound size={15}/>{appointment.professional_name ?? 'Profissional da casa'}</span>
      <span><CalendarDays size={15}/>{when}</span>
    </div>
    <h2>Sua comanda</h2>
    {erro && <div className="notice error">{erro}</div>}
    <div className="public-confirm-summary">
      <span><Scissors size={15}/>Serviço <b>{brl(appointment.service_price)}</b></span>
      {order.items.map((i) => <span key={i.id}><Package size={15}/>{Number(i.quantity)}× {i.name} <b>{brl(i.line_total)}</b>{open && <form action={removeMyItem}><input type="hidden" name="slug" value={slug}/><input type="hidden" name="token" value={token}/><input type="hidden" name="item_id" value={i.id}/><button className="quiet-button" aria-label={`Remover ${i.name}`}><Trash2 size={14}/></button></form>}</span>)}
      <span><b>Total previsto: {brl(total)}</b></span>
    </div>
    {open && products.length > 0 && <form action={addMyItem} className="form-stack">
      <input type="hidden" name="slug" value={slug}/><input type="hidden" name="token" value={token}/>
      <div className="two-col">
        <label>Adicionar produto<select name="product_id" required defaultValue=""><option value="" disabled>Selecione</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {brl(p.price)}</option>)}</select></label>
        <label>Quantidade<input name="quantity" type="number" min={1} max={50} defaultValue={1}/></label>
      </div>
      <button className="button">Adicionar à comanda</button>
    </form>}
    <small>O pagamento é feito no estabelecimento.{business.phone ? ` Dúvidas: ${business.phone}.` : ''}</small>
  </section></main>;
}
