import type { CSSProperties, ReactNode } from 'react';
import { Ban, Check, CheckCheck, UserX, Undo2 } from 'lucide-react';
import FormDialog from '@/app/painel/ui/form-dialog';
import ActionButton from '@/app/painel/ui/action-button';
import { cancelAppointment, saveAppointment, setAppointmentStatus } from '@/app/painel/actions';
import { dateInZone, formatDate, timeInZone } from '@/lib/time';
import { STATUS_LABEL, type Appointment, type AppointmentStatus, type Client, type Service, type Staff } from '@/lib/panel/types';

export const brl = (value: number) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function formatPhone(phone: string | null) {
  if (!phone) return '';
  if (phone.length === 11) return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  if (phone.length === 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  return phone;
}
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
export const durationLabel = (minutes: number) => minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}min` : ''}` : `${minutes} min`;
export const statusClass = (status: AppointmentStatus) => ({ scheduled: 'status-scheduled', confirmed: 'status-confirmed', done: 'status-done', cancelled: 'status-cancelled', no_show: 'status-noshow' })[status];
export function StatusPill({ status }: { status: AppointmentStatus }) { return <span className={`status-pill ${statusClass(status)}`}>{STATUS_LABEL[status]}</span>; }

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="empty-state"><b>{title}</b>{children && <p>{children}</p>}{action}</div>;
}

export type Lookup = { services: Map<string, Service>; staff: Map<string, Staff>; clients: Map<string, Pick<Client, 'id' | 'name' | 'phone'>> };
export const toMap = <T extends { id: string }>(rows: T[]) => new Map(rows.map((row) => [row.id, row]));

function ServiceAndStaffFields({ services, staff, serviceId, staffId, date, time, price, notes }: { services: Service[]; staff: Staff[]; serviceId?: string; staffId?: string; date: string; time: string; price?: string; notes?: string }) {
  const serviceOptions = services.filter((s) => s.active || s.id === serviceId);
  const staffOptions = staff.filter((s) => (s.active && s.role !== 'receptionist') || s.id === staffId);
  return <>
    <div className="demo-form-row">
      <label>Serviço<select name="service_id" defaultValue={serviceId ?? ''} required><option value="" disabled>Selecione</option>{serviceOptions.map((s) => <option key={s.id} value={s.id}>{s.name} · {durationLabel(s.duration_minutes)} · {brl(s.price)}</option>)}</select></label>
      <label>Profissional<select name="staff_id" defaultValue={staffId ?? ''} required><option value="" disabled>Selecione</option>{staffOptions.map((s) => <option key={s.id} value={s.id}>{s.display_name}</option>)}</select></label>
      <label>Data<input name="date" type="date" defaultValue={date} required/></label>
      <label>Horário<input name="time" type="time" step={300} defaultValue={time} required/></label>
      <label>Valor (R$)<input name="price" inputMode="decimal" placeholder="Preço do serviço" defaultValue={price}/></label>
    </div>
    <label>Observações<input name="notes" maxLength={2000} defaultValue={notes} placeholder="Opcional"/></label>
  </>;
}

export function NewAppointmentDialog({ services, staff, clients, date, staffId, triggerClassName, label = 'Novo agendamento' }: { services: Service[]; staff: Staff[]; clients: Pick<Client, 'id' | 'name' | 'phone'>[]; date: string; staffId?: string; triggerClassName?: string; label?: string }) {
  return <FormDialog title="Novo agendamento" eyebrow="AGENDA" description="O horário é verificado na hora de salvar: o mesmo profissional não pode ter dois atendimentos ao mesmo tempo." action={saveAppointment} submitLabel="Agendar" trigger={label} triggerIcon="plus" triggerClassName={triggerClassName ?? 'workspace-primary-button compact'}>
    <label>Cliente<select name="client_id" defaultValue=""><option value="">+ Novo cliente (preencha abaixo)</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${formatPhone(c.phone)}` : ''}</option>)}</select></label>
    <div className="demo-form-row two"><label>Nome do novo cliente<input name="client_name" placeholder="Ex.: Ana Souza" maxLength={100}/></label><label>Telefone<input name="client_phone" type="tel" placeholder="(11) 99999-9999"/></label></div>
    <ServiceAndStaffFields services={services} staff={staff} staffId={staffId} date={date} time="09:00"/>
  </FormDialog>;
}

const NEXT_STATUS: { status: AppointmentStatus; label: string; icon: ReactNode }[] = [
  { status: 'confirmed', label: 'Confirmar', icon: <Check size={14}/> },
  { status: 'done', label: 'Concluir', icon: <CheckCheck size={14}/> },
  { status: 'no_show', label: 'Não compareceu', icon: <UserX size={14}/> },
  { status: 'scheduled', label: 'Voltar para agendado', icon: <Undo2 size={14}/> },
];

export function StatusActions({ appointment }: { appointment: Appointment }) {
  return <div className="status-actions">
    {NEXT_STATUS.filter((item) => item.status !== appointment.status).map((item) => <ActionButton key={item.status} action={setAppointmentStatus} fields={{ id: appointment.id, status: item.status }} className="workspace-secondary-button small">{item.icon}{item.label}</ActionButton>)}
    {appointment.status !== 'cancelled' && <ActionButton action={cancelAppointment} fields={{ id: appointment.id }} className="workspace-secondary-button small danger" confirmMessage="Cancelar este agendamento? O horário fica livre novamente."><Ban size={14}/>Cancelar agendamento</ActionButton>}
  </div>;
}

export function AppointmentDialog({ appointment, lookup, timezone, trigger, triggerClassName, triggerStyle }: { appointment: Appointment; lookup: Lookup; timezone: string; trigger: ReactNode; triggerClassName: string; triggerStyle?: CSSProperties }) {
  const client = lookup.clients.get(appointment.client_id);
  const service = lookup.services.get(appointment.service_id);
  const date = dateInZone(appointment.starts_at, timezone);
  return <FormDialog
    title={client?.name ?? 'Agendamento'}
    eyebrow={`${formatDate(date, { weekday: 'long', day: '2-digit', month: 'long' })} · ${timeInZone(appointment.starts_at, timezone)}–${timeInZone(appointment.ends_at, timezone)}`.toLocaleUpperCase('pt-BR')}
    description={`${STATUS_LABEL[appointment.status]}${appointment.source === 'public' ? ' · marcado pela página pública' : ''}${client?.phone ? ` · ${formatPhone(client.phone)}` : ''}`}
    action={saveAppointment} submitLabel="Salvar alterações" trigger={trigger} triggerClassName={triggerClassName} triggerStyle={triggerStyle}
    extra={<><span className="dialog-extra-label">Status do atendimento</span><StatusActions appointment={appointment}/></>}>
    <input type="hidden" name="id" value={appointment.id}/>
    <ServiceAndStaffFields services={[...lookup.services.values()]} staff={[...lookup.staff.values()]} serviceId={appointment.service_id} staffId={appointment.staff_id} date={date} time={timeInZone(appointment.starts_at, timezone)} price={String(appointment.price)} notes={appointment.notes}/>
    {service && !service.active && <small className="form-hint">Este serviço está inativo; ele continua aparecendo aqui só para este agendamento.</small>}
  </FormDialog>;
}
