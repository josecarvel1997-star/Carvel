import Link from 'next/link';
import { ArrowRight, CalendarDays, Heart, Search, Sparkles, Trash2, UsersRound, X } from 'lucide-react';
import FormDialog from '@/app/painel/ui/form-dialog';
import ActionButton from '@/app/painel/ui/action-button';
import { deleteClient, saveClient } from '@/app/painel/actions';
import type { PanelContext } from '@/lib/panel/context';
import { canManage } from '@/lib/panel/context';
import { isActiveStatus, type Appointment, type Client } from '@/lib/panel/types';
import { addDays, dateInZone, formatDate, timeInZone, todayInZone, zonedToUtc } from '@/lib/time';
import { APPOINTMENT_COLUMNS, loadServices, loadStaff } from './data';

const CLIENT_COLUMNS = 'id, full_name, phone, email, notes, whatsapp_opt_in, created_at, completed_visits, last_completed_at';
import { brl, EmptyState, formatPhone, initials, StatusPill } from './shared';

const UUID_RE = /^[0-9a-f-]{36}$/i;
const COLORS = ['rose', 'blue', 'lavender', 'green', 'amber'];
const colorFor = (id: string) => COLORS[parseInt(id.slice(0, 2), 16) % COLORS.length];

function ClientFields({ client }: { client?: Client }) {
  return <>
    {client && <input type="hidden" name="id" value={client.id}/>}
    <label>Nome completo<input name="full_name" required minLength={2} maxLength={120} defaultValue={client?.full_name} placeholder="Ex.: Ana Souza"/></label>
    <div className="demo-form-row two"><label>Telefone com DDD<input name="phone" type="tel" required defaultValue={formatPhone(client?.phone)} placeholder="(11) 99999-9999"/></label><label>E-mail<input name="email" type="email" defaultValue={client?.email ?? ''} placeholder="Opcional"/></label></div>
    <label>Observações e preferências<textarea name="notes" maxLength={2000} defaultValue={client?.notes} placeholder="Ex.: prefere máquina 2 nas laterais"/></label>
    <label className="checkbox-row"><input type="checkbox" name="whatsapp_opt_in" defaultChecked={client?.whatsapp_opt_in ?? false}/> Autoriza contato por WhatsApp</label>
  </>;
}

export function NewClientDialog() {
  return <FormDialog title="Novo cliente" eyebrow="CLIENTES" action={saveClient} submitLabel="Cadastrar" trigger="Novo cliente" triggerIcon="plus"><ClientFields/></FormDialog>;
}

export default async function ClientesView({ ctx, params }: { ctx: PanelContext; params: Record<string, string | undefined> }) {
  const { supabase, shop } = ctx;
  const tz = shop.timezone;
  const q = (params.q ?? '').trim().slice(0, 80);
  const safe = q.replace(/[,()%*\\"'.:]/g, ' ').trim();
  const qDigits = q.replace(/\D/g, '');
  const monthStart = zonedToUtc(`${todayInZone(tz).slice(0, 8)}01`, '00:00', tz).toISOString();

  let listQuery = supabase.from('clients').select(CLIENT_COLUMNS).eq('barbershop_id', shop.id).order('full_name').limit(100);
  if (safe) listQuery = qDigits.length >= 3 ? listQuery.or(`full_name.ilike.%${safe}%,phone_normalized.ilike.%${qDigits}%`) : listQuery.ilike('full_name', `%${safe}%`);
  const [{ data: listData }, { count: total }, { count: newThisMonth }, { count: doneThisMonth }] = await Promise.all([
    listQuery,
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('barbershop_id', shop.id),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('barbershop_id', shop.id).gte('created_at', monthStart),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('barbershop_id', shop.id).eq('status', 'completed').gte('starts_at', monthStart),
  ]);
  const clients = (listData ?? []) as Client[];
  const ids = clients.map((c) => c.id);
  const { data: historyData } = ids.length ? await supabase.from('appointments').select('client_id, starts_at, status, price').eq('barbershop_id', shop.id).in('client_id', ids).not('status', 'in', '(cancelled,no_show)').order('starts_at', { ascending: false }).limit(3000) : { data: [] };
  const history = (historyData ?? []) as Pick<Appointment, 'client_id' | 'starts_at' | 'status' | 'price'>[];
  const now = Date.now();
  const stats = new Map(ids.map((id) => {
    const rows = history.filter((h) => h.client_id === id);
    const done = rows.filter((h) => h.status === 'completed');
    const next = rows.filter((h) => new Date(h.starts_at).getTime() > now && isActiveStatus(h.status)).at(-1);
    const last = rows.find((h) => new Date(h.starts_at).getTime() <= now);
    return [id, { visits: done.length, total: done.reduce((s, h) => s + Number(h.price), 0), next: next?.starts_at, last: last?.starts_at }];
  }));
  const selected = params.cliente && UUID_RE.test(params.cliente) ? params.cliente : '';
  const base = q ? `/painel/clientes?q=${encodeURIComponent(q)}` : '/painel/clientes';
  const fmt = (iso?: string) => iso ? formatDate(dateInZone(iso, tz), { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return <>
    <div className="client-summary-row">
      <div className="client-summary"><span className="metric-symbol lavender"><UsersRound size={18}/></span><span><small>Clientes cadastrados</small><b>{total ?? 0}</b></span></div>
      <div className="client-summary"><span className="metric-symbol green"><Heart size={18}/></span><span><small>Atendimentos concluídos no mês</small><b>{doneThisMonth ?? 0}</b></span></div>
      <div className="client-summary"><span className="metric-symbol copper"><Sparkles size={18}/></span><span><small>Novos neste mês</small><b>{newThisMonth ?? 0}</b></span></div>
    </div>
    <section className="workspace-card client-table-card">
      <div className="list-toolbar">
        <form className="workspace-search" action="/painel/clientes" role="search"><Search size={16}/><input name="q" placeholder="Buscar por nome ou telefone" defaultValue={q}/>{q && <Link href="/painel/clientes" aria-label="Limpar busca"><X size={14}/></Link>}</form>
        <NewClientDialog/>
      </div>
      <div className="clients-table-wrap"><table className="workspace-table">
        <thead><tr><th>CLIENTE</th><th>ÚLTIMA VISITA</th><th>PRÓXIMO HORÁRIO</th><th>CONCLUÍDOS</th><th>TOTAL GASTO</th><th/></tr></thead>
        <tbody>{clients.map((c) => { const s = stats.get(c.id)!; const link = `${base}${base.includes('?') ? '&' : '?'}cliente=${c.id}`; return <tr key={c.id}>
          <td><span className={`table-avatar ${colorFor(c.id)}`}>{initials(c.full_name)}</span><Link href={link} className="table-person"><b>{c.full_name}</b><small>{formatPhone(c.phone) || c.email || 'Sem contato'}</small></Link></td>
          <td>{fmt(s.last)}</td><td>{s.next ? `${fmt(s.next)} · ${timeInZone(s.next, tz)}` : '—'}</td><td><b>{s.visits}</b></td><td><b>{brl(s.total)}</b></td>
          <td><Link className="row-more" href={link} aria-label={`Ver ${c.full_name}`}><ArrowRight size={16}/></Link></td>
        </tr>; })}</tbody>
      </table>
      {!clients.length && <EmptyState title={q ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}>{q ? 'Tente outro nome ou telefone.' : 'Clientes entram aqui quando você cadastra ou quando alguém agenda pela página pública.'}</EmptyState>}</div>
      <div className="table-footnote">Mostrando {clients.length} de {total ?? 0} cliente(s){clients.length === 100 ? ' · refine a busca para ver outros' : ''}</div>
    </section>
    {selected && <ClientDrawer ctx={ctx} clientId={selected} closeHref={base}/>}
  </>;
}

async function ClientDrawer({ ctx, clientId, closeHref }: { ctx: PanelContext; clientId: string; closeHref: string }) {
  const { supabase, shop } = ctx;
  const tz = shop.timezone;
  const [{ data: clientData }, { data: apptData }, services, staff] = await Promise.all([
    supabase.from('clients').select(CLIENT_COLUMNS).eq('barbershop_id', shop.id).eq('id', clientId).maybeSingle(),
    supabase.from('appointments').select(APPOINTMENT_COLUMNS).eq('barbershop_id', shop.id).eq('client_id', clientId).order('starts_at', { ascending: false }).limit(50),
    loadServices(ctx), loadStaff(ctx),
  ]);
  const client = clientData as Client | null;
  if (!client) return null;
  const history = ((apptData ?? []) as Appointment[]).map((a) => ({ ...a, price: Number(a.price) }));
  const done = history.filter((a) => a.status === 'completed');
  const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? 'Serviço';
  const favorite = Object.entries(done.reduce<Record<string, number>>((acc, a) => ({ ...acc, [a.service_id]: (acc[a.service_id] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0];
  const today = todayInZone(tz);

  return <div className="drawer-backdrop drawer-static">
    <Link href={closeHref} className="drawer-close-area" aria-label="Fechar"/>
    <aside className="client-drawer">
      <div className="drawer-heading"><span>PERFIL DO CLIENTE</span><Link className="workspace-icon-button" href={closeHref} aria-label="Fechar"><X size={18}/></Link></div>
      <div className="drawer-profile"><span className={`drawer-avatar ${colorFor(client.id)}`}>{initials(client.full_name)}</span><h2>{client.full_name}</h2><p>{[formatPhone(client.phone), client.email].filter(Boolean).join(' · ') || 'Sem contato cadastrado'}</p>
        <div className="drawer-actions">
          <FormDialog title="Editar cliente" eyebrow="CLIENTES" action={saveClient} submitLabel="Salvar" trigger="Editar cliente" triggerIcon="edit" triggerClassName="workspace-secondary-button"><ClientFields client={client}/></FormDialog>
          {canManage(ctx.role) && <ActionButton action={deleteClient} fields={{ id: client.id }} className="workspace-secondary-button danger" confirmMessage={`Excluir ${client.full_name}? Clientes com histórico de agendamentos não podem ser excluídos.`}><Trash2 size={14}/>Excluir</ActionButton>}
        </div>
      </div>
      <div className="drawer-stats"><span><small>Atendimentos concluídos</small><b>{done.length}</b></span><span><small>Total gasto</small><b>{brl(done.reduce((s, a) => s + Number(a.price), 0))}</b></span></div>
      <section className="drawer-section"><h3>Preferências</h3>{favorite && <div className="preference-note"><Sparkles size={16}/>Serviço mais feito: {serviceName(favorite[0])}</div>}<p>{client.notes || 'Nenhuma observação cadastrada.'}</p><small className="form-hint">Cliente desde {formatDate(dateInZone(client.created_at, tz), { day: '2-digit', month: 'long', year: 'numeric' })}</small></section>
      <section className="drawer-section"><h3>Histórico de atendimentos</h3>
        {history.map((a) => { const d = dateInZone(a.starts_at, tz); return <div className="history-item" key={a.id}><span><b>{serviceName(a.service_id)}</b><small>{formatDate(d, { day: '2-digit', month: 'short', year: 'numeric' })} · {timeInZone(a.starts_at, tz)} · {staff.find((s) => s.id === a.staff_profile_id)?.display_name ?? 'Sem profissional'}</small></span><span className="history-right"><StatusPill status={a.status}/><b>{brl(Number(a.price))}</b></span></div>; })}
        {!history.length && <p>Nenhum atendimento ainda.</p>}
        <Link className="workspace-link-button" href={`/painel/agenda?data=${addDays(today, 0)}`}><CalendarDays size={14}/> Abrir agenda para marcar</Link>
      </section>
    </aside>
  </div>;
}
