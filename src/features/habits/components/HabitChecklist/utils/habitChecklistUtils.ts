export const WEEKDAY_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export interface DayMeta {
  day: number;
  dateKey: string;
  weekdayLetter: string;
  isToday: boolean;
  isFuture: boolean;
  isWeekend: boolean;
}

export function dateKey(y: number, m0: number, d: number): string {
  const mm = String(m0 + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

export function buildDays(now: Date): DayMeta[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(year, month, now.getDate());
  const todayTs = new Date(year, month, now.getDate()).getTime();

  const out: DayMeta[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const jsDay = date.getDay();
    out.push({
      day: d,
      dateKey: dateKey(year, month, d),
      weekdayLetter: WEEKDAY_SHORT[jsDay],
      isToday: dateKey(year, month, d) === todayKey,
      isFuture: date.getTime() > todayTs,
      isWeekend: jsDay === 0 || jsDay === 6,
    });
  }
  return out;
}

export function isWithinGrace(dk: string, graceDays: number, now: Date): boolean {
  const [y, m, d] = dk.split('-').map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = Math.round((today - target) / (24 * 60 * 60 * 1000));
  return diff >= 0 && diff <= graceDays;
}
