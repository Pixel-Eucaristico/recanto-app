'use client';

import { useCallback, useEffect, useState } from 'react';
import { flashcardService } from '@/application/flashcards/FlashcardService';
import { FlashcardDeck, FlashcardReviewResult } from '@/domain/flashcards/types';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface UseFlashcardDeckInput {
  lessonId?: string | null;
  deckId?: string | null;
}

export function useFlashcardDeck({ lessonId, deckId }: UseFlashcardDeckInput) {
  const user = useCurrentUser();
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState<boolean>(!!(lessonId || deckId));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number; score: number; persisted: boolean } | null>(null);
  const [reviewed, setReviewed] = useState(false);

  const load = useCallback(async () => {
    if (!lessonId && !deckId) return;
    try {
      setLoading(true);
      setError(null);
      const d = lessonId
        ? await flashcardService.getDeckByLesson(lessonId)
        : deckId
        ? await flashcardService.getDeck(deckId)
        : null;
      setDeck(d);
      if (d && user) setReviewed(await flashcardService.hasReviewed(user.id, d.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [lessonId, deckId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const submit = useCallback(async (answers: Record<string, FlashcardReviewResult>) => {
    if (!deck || !user) return null;
    setSubmitting(true);
    setError(null);
    try {
      const res = await flashcardService.submitReview({
        userId: user.id,
        deckId: deck.id,
        answers,
      });
      setResult({ correct: res.correctCount, total: res.totalCount, score: res.score, persisted: res.persisted });
      if (res.persisted) setReviewed(true);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [deck, user]);

  const restart = useCallback(() => {
    setResult(null);
    load();
  }, [load]);

  return { deck, loading, error, submitting, result, reviewed, submit, restart };
}
