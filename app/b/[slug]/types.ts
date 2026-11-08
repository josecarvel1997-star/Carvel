export type PublicShop = {
  name: string;
  slug: string;
  phone: string;
  address: string;
  timezone: string;
  services: { id: string; name: string; duration_minutes: number; price: number }[];
  staff: { id: string; display_name: string }[];
  hours: { weekday: number; start: string; end: string }[];
};
export type PublicSlot = { start: string; label: string; staffName: string };
export type Booking = { id: string; starts_at: string; timezone: string; shop: string; service: string; price: number; duration_minutes: number; staff: string };
export type BookingState = { ok: boolean; message: string; at: number; booking?: Booking };
