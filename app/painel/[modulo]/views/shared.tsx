import type { CSSProperties, ReactNode } from 'react';
import { Ban, Check, CheckCheck, Play, RotateCcw, UserX } from 'lucide-react';
import FormDialog from '@/app/painel/ui/form-dialog';
import ActionButton from '@/app/painel/ui/action-button';
import { saveAppointment, setAppointmentStatus } from '@/app/painel/actions';
import { dateInZone, formatDate, timeInZone } from '@/lib/time';
import { isActiveStatus, STATUS_LABEL, type Appointment, type AppointmentStatus, type ClientOption, type Service, type Staff } from '@/lib/panel/types';

export const brl = (value: number) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function formatPhone(phone: string | null | undefined) {
  const d = (phone ?? '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone ?? '';
}
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?';
export const durationLabel = (minutes: number) => minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}min` : ''}` : `${minutes} min`;
export const statusClass = (status: AppointmentStatus) => ({ requested: 'status-scheduled', scheduled: 'status-scheduled', confirmed: 'status-confirmed', in_progress: 'status-progress', completed: 'status-done', cancelled: 'status-cancelled', no_show: 'status-noshow' })[status];
export function StatusPill({ status }: { status: AppointmentStatus }) { return <span className={`status-pill ${statusClass(status)}`}>{STATUS_LABEL[status]}</span>; }

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="empty-state"><b>{title}</b>{children && <p>{children}</p>}{action}</div>;
}

export type Lookup = { services: Map<string, Service>; staff: Map<string, Staff>; clients: Map<string, ClientOption> };
export const toMap = <T extends { id: string }>(rows: T[]) => new Map(rows.map((row) => [row.id, row]));

function ServiceAndStaffFields({ services, staff, serviceId, staffId, date, time, price, notes, duration }: { services: Service[]; staff: Staff[]; serviceId?: string; staffId?: string | null; date: string; time: string; price?: string; notes?: string; duration?: number }) {
  const serviceOptions = services.filter((s) => s.active || s.id === serviceId);
  const staffOptions = staff.filter((s) => s.active || s.id === staffId);
  return <>
    <div className="demo-form-row">
      <label>Serviço<select name="service_id" defaultValue={serviceId ?? ''} required><option value="" disabled>Selecione</option>{serviceOptions.map((s) => <option key={s.id} value={s.id}>{s.name} · {durationLabel(s.duration_minutes)} · {brl(s.price)}</option>)}</select></label>
      <label>Profissional<select name="staff_id" defaultValue={staffId ?? ''}><option value="">Sem profissional / qualquer</option>{staffOptions.map((s) => <option key={s.id} value={s.id}>{s.display_name}</option>)}</select></label>
      <label>Data<input name="date" type="date" defaultValue={date} required/></label>
      <label>Horário<input name="time" type="time" step={900} defaultValue={time} required/></label>
      {duration !== undefined && <label>Duração (min)<input name="duration_minutes" type="number" min={5} max={480} step={5} defaultValue={duration}/></label>}
      <label>Valor (R$)<input name="price" inputMode="decimal" placeholder="Preço do serviço" defaultValue={price}/></label>
    </div>
    <label>Observações<input name="notes" maxLength={500} defaultValue={notes} placeholder="Opcional"/></label>
  </>;
}

export function NewAppointmentDialog({ services, staff, clients, date, staffId, triggerClassName, label = 'Novo agendamento' }: { services: Service[]; staff: Staff[]; clients: ClientOption[]; date: string; staffId?: string; triggerClassName?: string; label?: string }) {
  return <FormDialog title="Novo agendamento" eyebrow="AGENDA" description="O banco confere expediente e conflitos ao salvar. Horários em intervalos de 15 minutos; com profissional definido, a comanda já é aberta." action={saveAppointment} submitLabel="Agendar" trigger={label} triggerIcon="plus" triggerClassName={triggerClassName ?? 'workspace-primary-button compact'}>
    <label>Cliente<select name="client_id" defaultValue=""><option value="">+ Novo cliente (preencha abaixo)</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}{c.phone ? ` · ${formatPhone(c.phone)}` : ''}</option>)}</select></label>
    <div className="demo-form-row two"><label>Nome do novo cliente<input name="client_name" placeholder="Ex.: Ana Souza" maxLength={120}/></label><label>Telefone com DDD<input name="client_phone" type="tel" placeholder="(11) 99999-9999"/></label></div>
    <label className="checkbox-row"><input type="checkbox" name="allow_whatsapp"/> Cliente autoriza contato por WhatsApp</label>
    <ServiceAndStaffFields services={services} staff={staff} staffId={staffId} date={date} time="09:00"/>
  </FormDialog>;
}

type NextAction = { status: AppointmentStatus; label: string; icon: ReactNode; danger?: boolean; confirm?: string };

function nextActions(status: AppointmentStatus, hasOpenOrder: boolean): NextAction[] {
  if (status === 'cancelled' || status === 'no_show') return [{ status: 'confirmed', label: 'Reabrir', icon: <RotateCcw size={14}/> }];
  if (!isActiveStatus(status)) return [];
  const list: NextAction[] = [];
  if (status === 'requested' || status === 'scheduled') list.push({ status: 'confirmed', label: 'Confirmar', icon: <Check size={14}/> });
  if (status !== 'in_progress') list.push({ status: 'in_progress', label: 'Iniciar atendimento', icon: <Play size={14}/> });
  if (!hasOpenOrder) list.push({ status: 'completed', label: 'Concluir sem cobrança', icon: <CheckCheck size={14}/> });
  list.push({ status: 'no_show', label: 'Não compareceu', icon: <UserX size={14}/> });
  list.push({ status: 'cancelled', label: 'Cancelar agendamento', icon: <Ban size={14}/>, danger: true, confirm: 'Cancelar este agendamento? O horário fica livre e a comanda aberta é cancelada.' });
  return list;
}

export function StatusActions({ appointment, hasOpenOrder = false }: { appointment: Appointment; hasOpenOrder?: boolean }) {
  const actions = nextActions(appointment.status, hasOpenOrder);
  if (!actions.length) return null;
  return <div className="status-actions">
    {actions.map((item) => <ActionButton key={item.status + item.label} action={setAppointmentStatus} fields={{ id: appointment.id, status: item.status }} className={`workspace-secondary-button small${item.danger ? ' danger' : ''}`} confirmMessage={item.confirm}>{item.icon}{item.label}</ActionButton>)}
  </div>;
}

export function AppointmentDialog({ appointment, lookup, timezone, trigger, triggerClassName, triggerStyle, hasOpenOrder }: { appointment: Appointment; lookup: Lookup; timezone: string; trigger: ReactNode; triggerClassName: string; triggerStyle?: CSSProperties; hasOpenOrder?: boolean }) {
  const client = lookup.clients.get(appointment.client_id);
  const service = lookup.services.get(appointment.service_id);
  const date = dateInZone(appointment.starts_at, timezone);
  const editable = isActiveStatus(appointment.status);
  return <FormDialog
    title={client?.full_name ?? 'Agendamento'}
    eyebrow={`${formatDate(date, { weekday: 'long', day: '2-digit', month: 'long' })} · ${timeInZone(appointment.starts_at, timezone)}–${timeInZone(appointment.ends_at, timezone)}`.toLocaleUpperCase('pt-BR')}
    description={`${STATUS_LABEL[appointment.status]}${appointment.source === 'public' ? ' · marcado pela página pública' : ''}${client?.phone ? ` · ${formatPhone(client.phone)}` : ''}`}
    action={saveAppointment} submitLabel="Salvar alterações" trigger={trigger} triggerClassName={triggerClassName} triggerStyle={triggerStyle} hideSubmit={!editable}
    extra={<><span className="dialog-extra-label">Status do atendimento</span><StatusActions appointment={appointment} hasOpenOrder={hasOpenOrder}/>{!editable && <small className="form-hint">Atendimentos finalizados não podem ser editados.</small>}</>}>
    <input type="hidden" name="id" value={appointment.id}/>
    <ServiceAndStaffFields services={[...lookup.services.values()]} staff={[...lookup.staff.values()]} serviceId={appointment.service_id} staffId={appointment.staff_profile_id} date={date} time={timeInZone(appointment.starts_at, timezone)} price={String(appointment.price)} notes={appointment.notes} duration={appointment.duration_minutes}/>
    {service && !service.active && <small className="form-hint">Este serviço está inativo; ele continua aparecendo aqui só para este agendamento.</small>}
  </FormDialog>;
}
