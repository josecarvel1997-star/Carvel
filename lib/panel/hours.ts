import type { Shop, WorkingHour } from './types';
import { timeToMinutes } from '@/lib/time';

const KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export type Interval = { start: number; end: number };

/** Mesma regra de public._effective_hours: horário do profissional > horário geral > opening_hours. */
export function effectiveHours(rows: WorkingHour[], shop: Shop, staffId: string | null, weekday: number): Interval[] {
  const toIntervals = (list: WorkingHour[]) => list.filter((r) => r.weekday === weekday).map((r) => ({ start: timeToMinutes(r.start_time), end: timeToMinutes(r.end_time) })).sort((a, b) => a.start - b.start);
  if (staffId) {
    const own = rows.filter((r) => r.staff_id === staffId);
    if (own.length) return toIntervals(own);
  }
  const general = rows.filter((r) => r.staff_id === null);
  if (general.length) return toIntervals(general);
  const day = shop.opening_hours?.[KEYS[weekday]];
  if (!day || day.closed || !day.open || !day.close) return [];
  const start = timeToMinutes(day.open), end = timeToMinutes(day.close);
  return end > start ? [{ start, end }] : [];
}
