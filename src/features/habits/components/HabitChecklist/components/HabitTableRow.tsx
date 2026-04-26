'use client';

import type { HabitEntry } from '@/features/habits/hooks/useHabits';
import { StreakBadge } from '@/features/habits/components/StreakBadge';
import { DEFAULT_GRACE_DAYS } from '@/domain/habits/entities/HabitStreak';
import { DayCheckbox } from './DayCheckbox';
import { isWithinGrace, type DayMeta } from '../utils/habitChecklistUtils';

interface HabitTableRowProps {
  entry: HabitEntry;
  days: DayMeta[];
  now: Date;
  toggling: string | null;
  onToggle: (habitId: string, dateKey: string) => void;
}

export function HabitTableRow({ entry, days, now, toggling, onToggle }: HabitTableRowProps) {
  const { habit, streak, loggedDays } = entry;
  const graceDays = habit.grace_days ?? DEFAULT_GRACE_DAYS;

  return (
    <tr>
      <td className="sticky left-0 bg-base-100 z-10 align-middle">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-semibold text-base-content">{habit.title}</span>
          <StreakBadge current={streak.current_streak} size="xs" />
        </div>
        <span className="text-[10px] text-base-content/50">janela {graceDays + 1}d</span>
      </td>
      {days.map(d => {
        const done = loggedDays.has(d.dateKey);
        const clickable = !d.isFuture && isWithinGrace(d.dateKey, graceDays, now);
        const busy = toggling === `${habit.id}_${d.dateKey}`;
        return (
          <td key={d.dateKey} className="text-center p-0.5">
            <DayCheckbox
              done={done}
              clickable={clickable}
              future={d.isFuture}
              today={d.isToday}
              busy={busy}
              onClick={() => clickable && onToggle(habit.id, d.dateKey)}
              title={d.dateKey}
            />
          </td>
        );
      })}
    </tr>
  );
}
