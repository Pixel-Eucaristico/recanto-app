'use client';

import { useCallback, useEffect, useState } from 'react';
import { wordSearchService } from '@/application/word-search/WordSearchService';
import { WordSearchPuzzle } from '@/domain/word-search/types';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface UseWordSearchInput {
  lessonId?: string | null;
  puzzleId?: string | null;
}

export function useWordSearch({ lessonId, puzzleId }: UseWordSearchInput) {
  const user = useCurrentUser();
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null);
  const [loading, setLoading] = useState<boolean>(!!(lessonId || puzzleId));
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ persisted: boolean; score: number } | null>(null);

  const load = useCallback(async () => {
    if (!lessonId && !puzzleId) return;
    try {
      setLoading(true);
      setError(null);
      const p = lessonId
        ? await wordSearchService.getByLesson(lessonId)
        : puzzleId
        ? await wordSearchService.getById(puzzleId)
        : null;
      setPuzzle(p);
      setFound([]);
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [lessonId, puzzleId]);

  useEffect(() => { load(); }, [load]);

  const markFound = useCallback((word: string) => {
    setFound(prev => (prev.includes(word) ? prev : [...prev, word]));
  }, []);

  const submit = useCallback(async () => {
    if (!puzzle || !user) return null;
    setSubmitting(true);
    setError(null);
    try {
      const res = await wordSearchService.submitResult({
        userId: user.id,
        puzzleId: puzzle.id,
        found,
      });
      setResult({ persisted: res.persisted, score: res.result.score });
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [puzzle, user, found]);

  const restart = useCallback(() => {
    setFound([]);
    setResult(null);
  }, []);

  return { puzzle, loading, error, found, markFound, submit, submitting, result, restart, reload: load };
}
