export type ActionState = { ok: boolean; message: string; at: number };
export const initialActionState: ActionState = { ok: false, message: '', at: 0 };

export type MemberRole = 'owner' | 'manager' | 'barber' | 'receptionist';

/** Status reais de appointments.status (CHECK appointments_status_check). */
export type AppointmentStatus = 'requested' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export const ACTIVE_STATUSES: AppointmentStatus[] = ['requested', 'scheduled', 'confirmed', 'in_progress'];
export const isActiveStatus = (status: AppointmentStatus) => ACTIVE_STATUSES.includes(status);

export type DayHours = { open: string; close: string; closed: boolean };
export type OpeningHours = Partial<Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', DayHours>>;

export type Shop = { id: string; name: string; slug: string; timezone: string; opening_hours: OpeningHours | null; active_modules: string[] };
export type Service = { id: string; name: string; category: string; duration_minutes: number; price: number; active: boolean; requires_professional: boolean };
export type Staff = { id: string; display_name: string; role: Exclude<MemberRole, 'owner'>; commission_rate: number; product_commission_rate: number; active: boolean; user_id: string | null };
export type Client = { id: string; full_name: string; phone: string; email: string; notes: string; whatsapp_opt_in: boolean; created_at: string; completed_visits: number; last_completed_at: string | null };
export type ClientOption = Pick<Client, 'id' | 'full_name' | 'phone'>;
export type Appointment = { id: string; client_id: string; service_id: string; staff_profile_id: string | null; starts_at: string; ends_at: string; duration_minutes: number; status: AppointmentStatus; price: number; notes: string; source: 'admin' | 'public' };
export type ServiceOrderStatus = 'open' | 'closed' | 'cancelled';
export type ServiceOrder = { id: string; appointment_id: string; status: ServiceOrderStatus };
export type ServiceOrderItem = { id: string; order_id: string; product_id: string | null; product_name: string; quantity: number; unit_price: number };
export type Product = { id: string; name: string; category: string; sku: string; unit_price: number; quantity: number; reserved_quantity: number; minimum_quantity: number; active: boolean; available_to_customer: boolean };
export type BookingResource = { id: string; name: string; kind: 'room' | 'studio' | 'space'; capacity: number; active: boolean };

export const STATUS_LABEL: Record<AppointmentStatus, string> = { requested: 'Solicitado', scheduled: 'Agendado', confirmed: 'Confirmado', in_progress: 'Em atendimento', completed: 'Concluído', cancelled: 'Cancelado', no_show: 'Não compareceu' };
export const ROLE_LABEL: Record<MemberRole, string> = { owner: 'Proprietário', manager: 'Gerente', barber: 'Profissional', receptionist: 'Recepcionista' };

/** Formas aceitas por register_pdv_sale e close_service_order. */
export const PAYMENT_METHODS = ['pix', 'cash', 'debit_card', 'credit_card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_LABEL: Record<string, string> = { pix: 'Pix', cash: 'Dinheiro', debit_card: 'Cartão de débito', credit_card: 'Cartão de crédito', debit: 'Débito', credit: 'Crédito', other: 'Outro' };
export const RESOURCE_KIND_LABEL: Record<BookingResource['kind'], string> = { room: 'Sala', studio: 'Estúdio', space: 'Espaço' };
