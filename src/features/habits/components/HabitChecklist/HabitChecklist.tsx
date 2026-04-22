'use client';

import { useEffect, useState } from 'react';
import { Check, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';
import { Role } from '@/shared/types/role';
import { useHabits, HabitEntry } from '@/features/habits/hooks/useHabits';
import { StreakBadge } from '@/features/habits/components/StreakBadge';
import { DEFAULT_GRACE_DAYS } from '@/domain/habits/entities/HabitStreak';

interface HabitChecklistProps {
  userId: string | null;
  role: Role;
}

const WEEKDAY_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // domingo=0

function dateKey(y: number, m0: number, d: number): string {
  const mm = String(m0 + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

interface DayMeta {
  day: number;
  dateKey: string;
  weekdayLetter: string;
  isToday: boolean;
  isFuture: boolean;
  isWeekend: boolean;
}

function buildDays(now: Date): DayMeta[] {
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

function isWithinGrace(dk: string, graceDays: number, now: Date): boolean {
  const [y, m, d] = dk.split('-').map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = Math.round((today - target) / (24 * 60 * 60 * 1000));
  return diff >= 0 && diff <= graceDays;
}

/** Retorna page size baseado na largura da tela — 7 (mobile), 14 (tablet), 31 (desktop). */
function usePageSize(): number {
  const [size, setSize] = useState(31);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setSize(7);
      else if (w < 1024) setSize(14);
      else setSize(31);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

export function HabitChecklist({ userId, role }: HabitChecklistProps) {
  const { entries, loading, error, toggling, toggleDate, totalToday, totalHabits } = useHabits({ userId, role });
  const now = new Date();
  const days = buildDays(now);
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const pageSize = usePageSize();

  // Começa mostrando a "página" que contém hoje
  const todayIdx = days.findIndex(d => d.isToday);
  const initialStart = pageSize >= days.length ? 0 : Math.max(0, Math.min(days.length - pageSize, todayIdx - Math.floor(pageSize / 2)));
  const [start, setStart] = useState(initialStart);

  useEffect(() => {
    if (pageSize >= days.length) {
      setStart(0);
    } else {
      setStart(Math.max(0, Math.min(days.length - pageSize, todayIdx - Math.floor(pageSize / 2))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  if (loading) return <div className="text-sm text-base-content/60">Carregando hábitos...</div>;
  if (error) return <div className="alert alert-error text-sm"><span>{error}</span></div>;

  if (entries.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body items-center text-center gap-2 p-6">
          <HeartHandshake className="w-10 h-10 text-base-content/40" />
          <p className="text-sm text-base-content/60">Nenhum hábito configurado.</p>
        </div>
      </div>
    );
  }

  const visibleDays = days.slice(start, start + pageSize);
  const canPrev = start > 0;
  const canNext = start + pageSize < days.length;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-base-content">
            Hábitos — <span className="capitalize">{monthLabel}</span>
          </h3>
          <span className="badge badge-primary">{totalToday} / {totalHabits} hoje</span>
        </div>

        {pageSize < days.length && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="btn btn-ghost btn-xs gap-1"
              disabled={!canPrev}
              onClick={() => setStart(s => Math.max(0, s - pageSize))}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-xs text-base-content/60">
              Dias {visibleDays[0]?.day}–{visibleDays[visibleDays.length - 1]?.day}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-xs gap-1"
              disabled={!canNext}
              onClick={() => setStart(s => Math.min(days.length - pageSize, s + pageSize))}
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-base-100 z-10 min-w-[140px]">Hábito</th>
                {visibleDays.map(d => (
                  <th
                    key={d.dateKey}
                    className={`text-center px-1 ${d.isToday ? 'bg-primary/10 text-primary' : ''} ${d.isWeekend ? 'text-base-content/60' : ''}`}
                  >
                    <div className="text-[10px] leading-none">{d.weekdayLetter}</div>
                    <div className="text-xs font-mono">{d.day}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <HabitTableRow
                  key={entry.habit.id}
                  entry={entry}
                  days={visibleDays}
                  now={now}
                  toggling={toggling}
                  onToggle={toggleDate}
                />
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-base-content/50">
          Editável apenas hoje + janela de dias pra registrar. Fora da janela, só leitura.
        </p>
      </div>
    </div>
  );
}

function HabitTableRow({
  entry,
  days,
  now,
  toggling,
  onToggle,
}: {
  entry: HabitEntry;
  days: DayMeta[];
  now: Date;
  toggling: string | null;
  onToggle: (habitId: string, dateKey: string) => void;
}) {
  const { habit, streak, loggedDays } = entry;
  const graceDays = habit.grace_days ?? DEFAULT_GRACE_DAYS;

  return (
    <tr>
      <td className="sticky left-0 bg-base-100 z-10 align-middle">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-semibold text-base-content">{habit.title}</span>
          <StreakBadge current={streak.current_streak} size="xs" />
        </div>
        <span className="text-[10px] text-base-content/50">
          janela {graceDays + 1}d
        </span>
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

function DayCheckbox({
  done,
  clickable,
  future,
  today,
  busy,
  onClick,
  title,
}: {
  done: boolean;
  clickable: boolean;
  future: boolean;
  today: boolean;
  busy: boolean;
  onClick: () => void;
  title: string;
}) {
  const base = 'w-5 h-5 rounded flex items-center justify-center transition-colors';
  let style: string;
  if (future) {
    style = 'bg-base-200/40 cursor-not-allowed';
  } else if (done) {
    style = clickable
      ? 'bg-success text-success-content cursor-pointer hover:opacity-80'
      : 'bg-success/50 text-success-content cursor-default';
  } else if (clickable) {
    style = `bg-base-200 hover:bg-primary/20 cursor-pointer ${today ? 'ring-1 ring-primary' : ''}`;
  } else {
    style = 'bg-base-200/40 cursor-default';
  }

  return (
    <button
      type="button"
      className={`${base} ${style} mx-auto`}
      disabled={!clickable || busy}
      onClick={onClick}
      title={title}
    >
      {done && <Check className="w-3 h-3" />}
    </button>
  );
}
