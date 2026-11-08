import type { DayHours, Shop } from './types';
import { timeToMinutes } from '@/lib/time';

/** Chaves de barbershops.opening_hours, indexadas por dia da semana (0 = domingo). */
export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export type Interval = { start: number; end: number };

/**
 * Horário de funcionamento do dia. No banco ao vivo a única fonte de horário é
 * barbershops.opening_hours (o trigger enforce_appointment_schedule e as funções
 * públicas usam só ela), então a agenda segue a mesma regra para todos os profissionais.
 */
export function dayHours(shop: Pick<Shop, 'opening_hours'>, weekday: number): DayHours | null {
  const day = shop.opening_hours?.[DAY_KEYS[weekday]];
  if (!day || day.closed || !day.open || !day.close) return null;
  return day;
}

export function openIntervals(shop: Pick<Shop, 'opening_hours'>, weekday: number): Interval[] {
  const day = dayHours(shop, weekday);
  if (!day) return [];
  const start = timeToMinutes(day.open), end = timeToMinutes(day.close);
  return end > start ? [{ start, end }] : [];
}
