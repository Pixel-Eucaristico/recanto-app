'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { crosswordService } from '@/application/crossword/CrosswordService';
import { CrosswordPuzzle } from '@/domain/crossword/types';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface UseCrosswordInput {
  lessonId?: string | null;
  puzzleId?: string | null;
}

export function useCrossword({ lessonId, puzzleId }: UseCrosswordInput) {
  const user = useCurrentUser();
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [loading, setLoading] = useState<boolean>(!!(lessonId || puzzleId));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ persisted: boolean; score: number; correct: number; total: number } | null>(null);
  const loadedKey = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!lessonId && !puzzleId) return;
    const key = `${lessonId ?? ''}|${puzzleId ?? ''}|${user?.id ?? ''}`;
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    try {
      setLoading(true);
      setError(null);
      const p = lessonId
        ? await crosswordService.getByLesson(lessonId)
        : puzzleId
        ? await crosswordService.getById(puzzleId)
        : null;
      setPuzzle(p);
      // Carrega resultado prévio se existir.
      if (p && user) {
        const prev = await crosswordService.getLatestResult(user.id, p.id);
        if (prev) {
          setResult({ persisted: true, score: prev.score, correct: prev.correct, total: prev.total });
        } else {
          setResult(null);
        }
      } else {
        setResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [lessonId, puzzleId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const submit = useCallback(async (correctEntries: number[]) => {
    if (!puzzle || !user) return null;
    setSubmitting(true);
    setError(null);
    try {
      const res = await crosswordService.submitResult({
        userId: user.id,
        puzzleId: puzzle.id,
        correctEntries,
        totalEntries: puzzle.entries.length,
      });
      setResult({
        persisted: res.persisted,
        score: res.result.score,
        correct: correctEntries.length,
        total: puzzle.entries.length,
      });
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [puzzle, user]);

  return { puzzle, loading, error, submit, submitting, result, reload: load };
}
