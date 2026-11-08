// Conversões de data/hora no fuso da barbearia, sem dependências externas.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isValidDate = (value: string) => {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};
export const isValidTime = (value: string) => TIME_RE.test(value);

function partsInZone(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') % 24, minute: get('minute'), second: get('second') };
}

function offsetMinutes(instant: Date, timeZone: string) {
  const p = partsInZone(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60000);
}

/** Converte data (YYYY-MM-DD) + hora (HH:MM) locais do fuso informado em um instante UTC. */
export function zonedToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = offsetMinutes(new Date(guess), timeZone);
  let result = guess - first * 60000;
  const second = offsetMinutes(new Date(result), timeZone);
  if (second !== first) result = guess - second * 60000;
  return new Date(result);
}

export function dateInZone(instant: Date | string, timeZone: string) {
  const p = partsInZone(new Date(instant), timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}
export function timeInZone(instant: Date | string, timeZone: string) {
  const p = partsInZone(new Date(instant), timeZone);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}
export function minutesInZone(instant: Date | string, timeZone: string) {
  const p = partsInZone(new Date(instant), timeZone);
  return p.hour * 60 + p.minute;
}
export const todayInZone = (timeZone: string) => dateInZone(new Date(), timeZone);

export function addDays(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}
/** 0 = domingo ... 6 = sábado (igual ao extract(dow) do Postgres). */
export function weekdayOf(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
export const startOfWeek = (date: string) => addDays(date, -((weekdayOf(date) + 6) % 7));

export function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}
export const timeToMinutes = (time: string) => { const [h, m] = time.slice(0, 5).split(':').map(Number); return h * 60 + m; };
export const minutesToTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
