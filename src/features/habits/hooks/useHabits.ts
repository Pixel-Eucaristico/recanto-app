'use client';

import { useCallback, useEffect, useState } from 'react';
import { habitService } from '@/application/habits/HabitService';
import { Habit, HabitStreakInfo } from '@/domain/habits/types';
import { HabitStreakEntity } from '@/domain/habits/entities/HabitStreak';
import { Role } from '@/shared/types/role';

export interface HabitEntry {
  habit: Habit;
  streak: HabitStreakInfo;
  /** Set com todas as datas (YYYY-MM-DD) registradas pelo usuário. */
  loggedDays: Set<string>;
}

interface UseHabitsArgs {
  userId: string | null;
  role: Role;
}

export function useHabits({ userId, role }: UseHabitsArgs) {
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
      const streaks = await habitService.getStreaksForUser(userId, role);
      setEntries(streaks);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

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
