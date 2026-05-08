'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
        ? await wordSearchService.getByLesson(lessonId)
        : puzzleId
        ? await wordSearchService.getById(puzzleId)
        : null;
      setPuzzle(p);
      // Carrega resultado prévio se existir — mostra direto, retake não persiste.
      if (p && user) {
        const prev = await wordSearchService.getLatestResult(user.id, p.id);
        if (prev) {
          setFound(prev.found);
          setResult({ persisted: true, score: prev.score });
        } else {
          setFound([]);
          setResult(null);
        }
      } else {
        setFound([]);
        setResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [lessonId, puzzleId, user?.id]);

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
    // Limpa só state local — não re-fetch (evita re-load do histórico).
    setFound([]);
    setResult(null);
  }, []);

  return { puzzle, loading, error, found, markFound, submit, submitting, result, restart, reload: load };
}
