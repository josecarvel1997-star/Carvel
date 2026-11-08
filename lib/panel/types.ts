export type ActionState = { ok: boolean; message: string; at: number };
export const initialActionState: ActionState = { ok: false, message: '', at: 0 };

export type MemberRole = 'owner' | 'manager' | 'barber' | 'receptionist';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'done' | 'cancelled' | 'no_show';

export type Shop = { id: string; name: string; slug: string; timezone: string; opening_hours: Record<string, { open: string; close: string; closed: boolean }> | null };
export type Service = { id: string; name: string; duration_minutes: number; price: number; active: boolean };
export type Staff = { id: string; display_name: string; role: Exclude<MemberRole, 'owner'>; commission_rate: number; active: boolean };
export type Client = { id: string; name: string; phone: string | null; email: string | null; notes: string; created_at: string };
export type Appointment = { id: string; client_id: string; service_id: string; staff_id: string; starts_at: string; ends_at: string; status: AppointmentStatus; price: number; notes: string; source: 'panel' | 'public' };
export type WorkingHour = { staff_id: string | null; weekday: number; start_time: string; end_time: string };

export const STATUS_LABEL: Record<AppointmentStatus, string> = { scheduled: 'Agendado', confirmed: 'Confirmado', done: 'Concluído', cancelled: 'Cancelado', no_show: 'Não compareceu' };
export const ROLE_LABEL: Record<MemberRole, string> = { owner: 'Proprietário', manager: 'Gerente', barber: 'Barbeiro(a)', receptionist: 'Recepcionista' };
