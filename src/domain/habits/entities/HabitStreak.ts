import { HabitLog, HabitStreakInfo } from '@/domain/habits/types';

/** Default pra grace window por hábito. Admin pode sobrescrever via `habit.grace_days`. */
export const DEFAULT_GRACE_DAYS = 3;

function toDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function diffDays(a: Date, b: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((db.getTime() - da.getTime()) / MS_PER_DAY);
}

export class HabitStreakEntity {
  static todayKey(now: Date = new Date()): string {
    return dateKey(now);
  }

  /** Data em formato YYYY-MM-DD para N dias atrás. */
  static daysAgoKey(days: number, now: Date = new Date()): string {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
    return dateKey(d);
  }

  /** Retorna lista de dias (YYYY-MM-DD) dentro da janela [hoje ... hoje-grace]. */
  static graceWindow(graceDays: number, now: Date = new Date()): string[] {
    const out: string[] = [];
    for (let i = 0; i <= graceDays; i++) {
      out.push(HabitStreakEntity.daysAgoKey(i, now));
    }
    return out;
  }

  /** True se `dateKey` está dentro da janela de grace. */
  static isWithinGrace(dateKey: string, graceDays: number, now: Date = new Date()): boolean {
    const target = toDate(dateKey);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = diffDays(target, today);
    return diff >= 0 && diff <= graceDays;
  }

  /** Calcula streak baseado nos logs do hábito. */
  static compute(habitId: string, logs: HabitLog[], now: Date = new Date()): HabitStreakInfo {
    if (logs.length === 0) {
      return {
        habit_id: habitId,
        current_streak: 0,
        longest_streak: 0,
        days_since_last: Infinity,
      };
    }

    const dates = Array.from(new Set(logs.map(l => l.log_date)))
      .sort((a, b) => (a < b ? 1 : -1))
      .map(s => toDate(s));

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastLog = dates[0];
    const daysSinceLast = diffDays(lastLog, today);

    let current = 0;
    let cursor = lastLog;
    for (const d of dates) {
      const gap = diffDays(d, cursor);
      if (gap === 0) {
        current++;
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
        continue;
      }
      if (gap === 1) {
        current++;
        cursor = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
        continue;
      }
      break;
    }
    if (daysSinceLast > 1) current = 0;

    let longest = 0;
    let run = 1;
    for (let i = 1; i < dates.length; i++) {
      const gap = diffDays(dates[i], dates[i - 1]);
      if (gap === 1) {
        run++;
      } else {
        if (run > longest) longest = run;
        run = 1;
      }
    }
    if (run > longest) longest = run;
    longest = Math.max(longest, current);

    return {
      habit_id: habitId,
      current_streak: current,
      longest_streak: longest,
      days_since_last: daysSinceLast,
      last_log_date: dates[0] ? dateKey(dates[0]) : undefined,
    };
  }
}
