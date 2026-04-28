'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formationService } from '@/application/formation/FormationService';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { FormationLesson, LessonProgress } from '@/domain/formation/types';

export type ChecklistItemId = 'video' | 'reflection' | 'quiz' | 'forum';

export interface ChecklistItem {
  id: ChecklistItemId;
  label: string;
  description: string;
  required: boolean;
  done: boolean;
}

function buildItems(lesson: FormationLesson, progress: LessonProgress | null): ChecklistItem[] {
  const min = lesson.min_watch_percent ?? 0;
  const watched = (progress?.video_watch_percent ?? 0) >= min;
  return [
    {
      id: 'video',
      label: 'Assistir vídeo',
      description: min > 0 ? `Mínimo ${min}% do vídeo` : 'Assistir o vídeo',
      required: true,
      done: watched,
    },
    {
      id: 'reflection',
      label: 'Registrar reflexão',
      description: 'Enviar no caderno espiritual',
      required: !!lesson.requires_reflection,
      done: !!progress?.reflection_submitted,
    },
    {
      id: 'quiz',
      label: 'Passar no quiz',
      description: 'Atingir nota mínima',
      required: !!lesson.requires_quiz,
      done: !!progress?.quiz_passed,
    },
    {
      id: 'forum',
      label: 'Participar do fórum',
      description: 'Publicar pelo menos uma resposta',
      required: !!lesson.requires_forum_post,
      done: !!progress?.forum_post_made,
    },
  ];
}

interface UseLessonChecklistArgs {
  userId: string | null;
  lessonId: string | null;
  moduleId: string | null;
  trackId: string | null;
  userHabitsBlocked?: boolean;
}

export function useLessonChecklist({ userId, lessonId, moduleId, trackId, userHabitsBlocked = false }: UseLessonChecklistArgs) {
  const [lesson, setLesson] = useState<FormationLesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial de lesson + progress
  const reload = useCallback(async () => {
    if (!userId || !lessonId || !moduleId || !trackId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await formationService.getLessonWithProgress(userId, lessonId, moduleId, trackId, userHabitsBlocked);
      setLesson(result.lesson);
      setProgress(result.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId, lessonId, moduleId, trackId, userHabitsBlocked]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Subscribe real-time no progress — substitui polling/refresh tokens
  useEffect(() => {
    if (!userId || !lessonId) return;
    const unsub = progressRepository.subscribe(userId, lessonId, p => {
      setProgress(p);
    });
    return () => unsub();
  }, [userId, lessonId]);

  const items = useMemo(() => (lesson ? buildItems(lesson, progress) : []), [lesson, progress]);
  const activeItems = items.filter(i => i.required);
  const completed = activeItems.filter(i => i.done).length;
  const total = activeItems.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { items, activeItems, completed, total, percent, lesson, progress, loading, error, reload };
}
