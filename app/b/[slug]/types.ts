import type { OpeningHours } from '@/lib/panel/types';

/** Retorno de public_booking_catalog(target_slug). */
export type PublicShop = {
  name: string;
  slug: string;
  phone: string;
  address: string;
  timezone: string;
  opening_hours: OpeningHours | null;
  services: { id: string; name: string; duration_minutes: number; price: number }[];
  staff: { id: string; display_name: string }[];
};
export type PublicSlot = { start: string; label: string; staffId: string; staffName: string };
/** Retorno de create_public_booking(target_slug, …) (versão jsonb, que também abre a comanda). */
export type Booking = { appointment_id: string; customer_token: string; business_name: string; service_name: string; professional_name: string; starts_at: string; duration_minutes: number; price: number };
export type BookingState = { ok: boolean; message: string; at: number; booking?: Booking };
