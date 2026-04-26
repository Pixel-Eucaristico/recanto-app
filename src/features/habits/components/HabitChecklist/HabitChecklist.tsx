'use client';

import { useEffect, useState } from 'react';
import { HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Role } from '@/shared/types/role';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { buildDays } from './utils/habitChecklistUtils';
import { usePageSize } from './hooks/usePageSize';
import { HabitTableRow } from './components/HabitTableRow';

interface HabitChecklistProps {
  userId: string | null;
  role: Role;
}

export function HabitChecklist({ userId, role }: HabitChecklistProps) {
  const { entries, loading, error, toggling, toggleDate, totalToday, totalHabits } = useHabits({ userId, role });
  const now = new Date();
  const days = buildDays(now);
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const pageSize = usePageSize();
  const todayIdx = days.findIndex(d => d.isToday);
  const initialStart = pageSize >= days.length ? 0 : Math.max(0, Math.min(days.length - pageSize, todayIdx - Math.floor(pageSize / 2)));
  const [start, setStart] = useState(initialStart);

  useEffect(() => {
    if (pageSize >= days.length) setStart(0);
    else setStart(Math.max(0, Math.min(days.length - pageSize, todayIdx - Math.floor(pageSize / 2))));
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
            <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={!canPrev} onClick={() => setStart(s => Math.max(0, s - pageSize))}>
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-xs text-base-content/60">Dias {visibleDays[0]?.day}–{visibleDays[visibleDays.length - 1]?.day}</span>
            <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={!canNext} onClick={() => setStart(s => Math.min(days.length - pageSize, s + pageSize))}>
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
                  <th key={d.dateKey} className={`text-center px-1 ${d.isToday ? 'bg-primary/10 text-primary' : ''} ${d.isWeekend ? 'text-base-content/60' : ''}`}>
                    <div className="text-[10px] leading-none">{d.weekdayLetter}</div>
                    <div className="text-xs font-mono">{d.day}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <HabitTableRow key={entry.habit.id} entry={entry} days={visibleDays} now={now} toggling={toggling} onToggle={toggleDate} />
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
