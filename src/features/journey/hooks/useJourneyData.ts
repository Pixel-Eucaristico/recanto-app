'use client';

import { useEffect, useState } from 'react';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import { formationService } from '@/application/formation/FormationService';
import { buildTrackProgress, type TrackProgress } from '@/domain/formation/progress';
import { computeStreak, formatDayKey } from '@/shared/utils/datetime';
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
  /** Concluídas / total real do currículo. `percent` é null se o total não resolveu. */
  progress: TrackProgress;
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

        const trackIds = Array.from(trackProgressMap.keys());
        // Em paralelo — antes era um `await findById` dentro do for, um round-trip por trilha.
        const [trackList, lessonCounts] = await Promise.all([
          Promise.all(trackIds.map(id => trackRepository.findById(id).catch(() => null))),
          formationService.getTrackLessonCounts(trackIds).catch(() => new Map<string, number>()),
        ]);
        if (cancelled) return;

        const trackSummaries: TrackProgressSummary[] = [];
        for (const track of trackList) {
          if (!track) continue;
          const progresses = trackProgressMap.get(track.id) ?? [];
          const completed = progresses.filter(p => p.status === 'completed').length;
          trackSummaries.push({
            track,
            // Denominador é o currículo inteiro, não as aulas que o aluno abriu.
            progress: buildTrackProgress(completed, lessonCounts.get(track.id)),
            lastUpdated: progresses
              .map(p => p.updated_at ?? '')
              .filter(Boolean)
              .sort()
              .pop() ?? '',
          });
        }
        // Sort by lastUpdated desc
        trackSummaries.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

        // `formatDayKey` usa fuso local — a versão antiga fatiava o ISO em UTC, o que
        // jogava atividade das 21h à meia-noite no dia seguinte.
        const streakDays = computeStreak(
          [
            ...lessonProgress.map(p => p.updated_at ?? ''),
            ...bookProgress.map(p => p.updated_at),
          ].filter(Boolean).map(ts => formatDayKey(ts)),
        );

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
