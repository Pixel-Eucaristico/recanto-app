'use client';

import { useCallback, useEffect, useState } from 'react';
import { habitService } from '@/application/habits/HabitService';
import { habitLogRepository } from '@/infrastructure/habits/HabitLogRepository';
import { Habit, HabitStreakInfo } from '@/domain/habits/types';
import { HabitStreakEntity } from '@/domain/habits/entities/HabitStreak';
import { Role } from '@/shared/types/role';

export interface HabitEntry {
  habit: Habit;
  streak: HabitStreakInfo;
  /** Set com todas as datas (YYYY-MM-DD) registradas pelo usuário. */
  loggedDays: Set<string>;
}

type HabitScope = 'all' | 'community' | 'course' | 'mine';

interface UseHabitsArgs {
  userId: string | null;
  role: Role;
  /** Filtro de escopo. Default: 'all'. */
  scope?: HabitScope;
  /** Quando scope='course', filtra por trilha. */
  courseId?: string;
}

export function useHabits({ userId, role, scope = 'all', courseId }: UseHabitsArgs) {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId || !role) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Lista habits no escopo + monta entries com logs/streak
      const habits = await habitService.listForUserScoped(userId, role, scope, courseId);
      const result = await Promise.all(habits.map(async h => {
        const logs = await habitLogRepository.findByUserAndHabit(userId, h.id);
        const streak = HabitStreakEntity.compute(h.id, logs);
        const loggedDays = new Set(logs.map(l => l.log_date));
        return { habit: h, streak, loggedDays };
      }));
      setEntries(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId, role, scope, courseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function toggleDate(habitId: string, dateKey: string) {
    if (!userId) return;
    setToggling(`${habitId}_${dateKey}`);
    setError(null);
    try {
      const entry = entries.find(e => e.habit.id === habitId);
      const logged = entry?.loggedDays.has(dateKey);
      if (logged) {
        await habitService.unlogDate(habitId, userId, dateKey);
      } else {
        await habitService.logDate(habitId, userId, dateKey);
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setToggling(null);
    }
  }

  const today = HabitStreakEntity.todayKey();
  const totalToday = entries.filter(e => e.loggedDays.has(today)).length;
  const totalHabits = entries.length;

  return { entries, loading, error, toggling, toggleDate, reload, totalToday, totalHabits, today };
}
