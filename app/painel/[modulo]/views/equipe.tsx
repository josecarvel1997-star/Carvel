import Link from 'next/link';
import { ArrowRight, Trash2 } from 'lucide-react';
import FormDialog from '@/app/painel/ui/form-dialog';
import ActionButton from '@/app/painel/ui/action-button';
import { deleteStaff, saveStaff } from '@/app/painel/actions';
import { canManage, type PanelContext } from '@/lib/panel/context';
import { ROLE_LABEL, type Staff } from '@/lib/panel/types';
import { todayInZone, zonedToUtc } from '@/lib/time';
import { loadAppointments, loadStaff } from './data';
import { brl, EmptyState, initials } from './shared';

const COLORS = ['rose', 'blue', 'lavender', 'green', 'amber'];

function StaffFields({ staff }: { staff?: Staff }) {
  return <>
    {staff && <input type="hidden" name="id" value={staff.id}/>}
    <label>Nome<input name="display_name" required minLength={2} maxLength={100} defaultValue={staff?.display_name} placeholder="Ex.: Rafael Silva"/></label>
    <div className="demo-form-row two">
      <label>Função<select name="role" defaultValue={staff?.role ?? 'barber'}><option value="barber">Profissional</option><option value="manager">Gerente</option><option value="receptionist">Recepcionista</option></select></label>
    </div>
    <div className="demo-form-row two">
      <label>Comissão sobre serviços (%)<input name="commission_rate" type="number" min={0} max={100} step="0.01" defaultValue={staff?.commission_rate ?? 0}/></label>
      <label>Comissão sobre produtos (%)<input name="product_commission_rate" type="number" min={0} max={100} step="0.01" defaultValue={staff?.product_commission_rate ?? 0}/></label>
    </div>
    <label className="checkbox-row"><input type="checkbox" name="active" defaultChecked={staff ? staff.active : true}/> Ativo (recebe agendamentos)</label>
    <small className="form-hint">Todo profissional ativo aparece na agenda e na página pública. Convite de login para o profissional: em breve.</small>
  </>;
}

export function NewStaffDialog() {
  return <FormDialog title="Adicionar profissional" eyebrow="EQUIPE" action={saveStaff} submitLabel="Adicionar" trigger="Adicionar profissional" triggerIcon="plus"><StaffFields/></FormDialog>;
}

export default async function EquipeView({ ctx }: { ctx: PanelContext }) {
  const tz = ctx.shop.timezone;
  const today = todayInZone(tz);
  const monthStartDate = `${today.slice(0, 8)}01`;
  const monthStart = zonedToUtc(monthStartDate, '00:00', tz).toISOString();
  const [staff, todayAppointments, { data: monthData }, { data: commissionData }] = await Promise.all([
    loadStaff(ctx), loadAppointments(ctx, today, 1),
    ctx.supabase.from('appointments').select('staff_profile_id, price').eq('barbershop_id', ctx.shop.id).eq('status', 'completed').gte('starts_at', monthStart).limit(5000),
    ctx.supabase.from('commission_entries').select('staff_profile_id, commission_amount').eq('barbershop_id', ctx.shop.id).neq('status', 'cancelled').gte('created_at', monthStart).limit(5000),
  ]);
  const monthDone = (monthData ?? []) as { staff_profile_id: string | null; price: number }[];
  const commissions = (commissionData ?? []) as { staff_profile_id: string; commission_amount: number }[];
  const manage = canManage(ctx.role);
  const doneValue = (id: string) => monthDone.filter((a) => a.staff_profile_id === id).reduce((s, a) => s + Number(a.price), 0);
  const commissionOf = (id: string) => commissions.filter((c) => c.staff_profile_id === id).reduce((s, c) => s + Number(c.commission_amount), 0);
  const totalCommission = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);

  return <>
    <div className="team-highlight-row">
      <div><span>Profissionais ativos</span><b>{staff.filter((s) => s.active).length}</b></div>
      <div><span>Agendamentos de hoje</span><b>{todayAppointments.length}</b></div>
      <div><span>Comissões apuradas no mês</span><b>{brl(totalCommission)}</b></div>
      {manage ? <NewStaffDialog/> : <span/>}
    </div>
    {!staff.length ? <EmptyState title="Nenhum profissional cadastrado">Cadastre quem atende para organizar a agenda por profissional.</EmptyState>
      : <div className="team-card-grid">{staff.map((s, i) => <article className={`workspace-card team-card ${s.active ? '' : 'is-inactive'}`} key={s.id}>
        <div className="team-card-top"><span className={`team-avatar ${COLORS[i % COLORS.length]}`}>{initials(s.display_name)}</span>{!s.active && <span className="status-pill status-cancelled">Inativo</span>}</div>
        <h3>{s.display_name}</h3><p>{ROLE_LABEL[s.role]}</p>
        <div className="team-stats"><span><small>Agenda hoje</small><b>{todayAppointments.filter((a) => a.staff_profile_id === s.id).length} atendimento(s)</b></span><span><small>Comissão serviços / produtos</small><b>{s.commission_rate.toLocaleString('pt-BR')}% / {s.product_commission_rate.toLocaleString('pt-BR')}%</b></span><span><small>Concluído no mês</small><b>{brl(doneValue(s.id))}</b></span><span><small>Comissão no mês</small><b>{brl(commissionOf(s.id))}</b></span></div>
        <div className="card-actions spread">
          <Link className="workspace-link-button" href={`/painel/agenda?profissional=${s.id}`}>Ver agenda <ArrowRight size={14}/></Link>
          {manage && <span className="card-actions">
            <FormDialog title="Editar profissional" eyebrow="EQUIPE" action={saveStaff} submitLabel="Salvar" trigger="Editar" triggerClassName="link-button"><StaffFields staff={s}/></FormDialog>
            <ActionButton action={deleteStaff} fields={{ id: s.id }} className="link-button danger" confirmMessage={`Remover ${s.display_name}? Se houver agendamentos no histórico, o cadastro será apenas desativado.`} title="Remover"><Trash2 size={13}/></ActionButton>
          </span>}
        </div>
      </article>)}</div>}
    <p className="demo-inline-note">A comissão é apurada pelo banco no fechamento de cada comanda (serviço e produtos, descontada a taxa da forma de pagamento). Veja o detalhe em Comissões.</p>
  </>;
}
