'use client';

import { useEffect, useState } from 'react';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import type { FormationTrack, FormationLesson, LessonProgress } from '@/domain/formation/types';
import type { BookReadingProgress } from '@/domain/library/types';

export interface JourneyData {
  loading: boolean;
  error: string | null;
  /** Streak — dias consecutivos com atividade. Calculado a partir de updated_at de progresses. */
  streakDays: number;
  /** Última atividade (aula ou livro) — pra "Continue de onde parou". */
  lastActivity: LastActivity | null;
  /** Trilhas com progresso. */
  tracksInProgress: TrackProgressSummary[];
  /** Livros do user (lendo / concluído / quero ler). */
  books: BookReadingProgress[];
  totalLessonsCompleted: number;
  totalBooksRead: number;
}

export type LastActivity =
  | { kind: 'lesson'; lesson: FormationLesson; track?: FormationTrack; updatedAt: string }
  | { kind: 'book'; book: BookReadingProgress; updatedAt: string };

export interface TrackProgressSummary {
  track: FormationTrack;
  completedCount: number;
  totalLessons: number;
  percent: number;
  lastUpdated: string;
}

const EMPTY: JourneyData = {
  loading: true,
  error: null,
  streakDays: 0,
  lastActivity: null,
  tracksInProgress: [],
  books: [],
  totalLessonsCompleted: 0,
  totalBooksRead: 0,
};

export function useJourneyData(userId: string | undefined): JourneyData {
  const [data, setData] = useState<JourneyData>(EMPTY);

  useEffect(() => {
    if (!userId) {
      setData({ ...EMPTY, loading: false });
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const [lessonProgress, bookProgress] = await Promise.all([
          progressRepository.findByUser(userId!),
          bookReadingProgressRepository.findByUser(userId!),
        ]);
        if (cancelled) return;

        const lastLesson = pickLastLessonProgress(lessonProgress);
        const lastBook = pickLastBookProgress(bookProgress);

        // Determina mais recente entre os dois
        let lastActivity: LastActivity | null = null;
        const lessonTs = lastLesson?.updated_at ? new Date(lastLesson.updated_at).getTime() : 0;
        const bookTs = lastBook?.updated_at ? new Date(lastBook.updated_at).getTime() : 0;

        if (lessonTs > bookTs && lastLesson) {
          const lesson = await lessonRepository.findById(lastLesson.lesson_id);
          const track = await trackRepository.findById(lastLesson.track_id);
          if (!cancelled && lesson) {
            lastActivity = { kind: 'lesson', lesson, track: track ?? undefined, updatedAt: lastLesson.updated_at ?? '' };
          }
        } else if (lastBook) {
          lastActivity = { kind: 'book', book: lastBook, updatedAt: lastBook.updated_at };
        }

        // Tracks em andamento — agrupa progresses por track_id
        const trackProgressMap = new Map<string, LessonProgress[]>();
        for (const p of lessonProgress) {
          if (!trackProgressMap.has(p.track_id)) trackProgressMap.set(p.track_id, []);
          trackProgressMap.get(p.track_id)!.push(p);
        }
        const trackSummaries: TrackProgressSummary[] = [];
        for (const [trackId, progresses] of trackProgressMap) {
          const track = await trackRepository.findById(trackId);
          if (!track || cancelled) continue;
          const completed = progresses.filter(p => p.status === 'completed').length;
          // Total real seria `track.module_ids → modules → lesson_ids` — caro.
          // Aproximação: total = total de progresses (já que só cria progress quando interage)
          // ou usa track.module_ids.length como heurística inicial.
          const total = Math.max(progresses.length, 1);
          trackSummaries.push({
            track,
            completedCount: completed,
            totalLessons: total,
            percent: Math.round((completed / total) * 100),
            lastUpdated: progresses
              .map(p => p.updated_at ?? '')
              .filter(Boolean)
              .sort()
              .pop() ?? '',
          });
        }
        // Sort by lastUpdated desc
        trackSummaries.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

        const streakDays = computeStreak([
          ...lessonProgress.map(p => p.updated_at ?? ''),
          ...bookProgress.map(p => p.updated_at),
        ].filter(Boolean));

        setData({
          loading: false,
          error: null,
          streakDays,
          lastActivity,
          tracksInProgress: trackSummaries,
          books: bookProgress,
          totalLessonsCompleted: lessonProgress.filter(p => p.status === 'completed').length,
          totalBooksRead: bookProgress.filter(p => p.percent >= 100).length,
        });
      } catch (e) {
        if (!cancelled) {
          setData({ ...EMPTY, loading: false, error: e instanceof Error ? e.message : String(e) });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  return data;
}

function pickLastLessonProgress(list: LessonProgress[]): LessonProgress | null {
  return [...list]
    .filter(p => p.updated_at)
    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))[0] ?? null;
}

function pickLastBookProgress(list: BookReadingProgress[]): BookReadingProgress | null {
  return [...list].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ?? null;
}

/** Conta dias consecutivos até hoje com pelo menos uma atividade. */
function computeStreak(timestamps: string[]): number {
  if (timestamps.length === 0) return 0;
  const days = new Set(timestamps.map(t => t.slice(0, 10))); // YYYY-MM-DD
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else if (i > 0) break; // permite hoje sem atividade ainda
  }
  return streak;
}
