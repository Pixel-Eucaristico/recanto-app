'use client';

import { useCallback, useEffect, useState } from 'react';
import { quizService } from '@/application/quiz/QuizService';
import { ShuffledQuiz, QuizAttempt, QuestionAnswer } from '@/domain/quiz/types';
import { ScoreResult } from '@/domain/quiz/entities/QuizAttempt';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface UseQuizOptions {
  lessonId?: string | null;
  quizId?: string | null;
}

export function useQuiz({ lessonId, quizId }: UseQuizOptions) {
  const user = useCurrentUser();
  const [shuffled, setShuffled] = useState<ShuffledQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(!!(lessonId || quizId));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ attempt: QuizAttempt; scoreDetail: ScoreResult; persisted: boolean } | null>(null);
  const [passed, setPassed] = useState<boolean>(false);
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);

  const load = useCallback(async () => {
    if (!lessonId && !quizId) return;
    try {
      setLoading(true);
      setError(null);
      const q = lessonId
        ? await quizService.getShuffledForLesson(lessonId)
        : quizId
        ? await quizService.getShuffled(quizId)
        : null;
      setShuffled(q);
      if (q && user) {
        setPassed(await quizService.hasPassed(user.id, q.quiz.id));
        setHasAttempted(await quizService.hasAttempted(user.id, q.quiz.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [lessonId, quizId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const submit = useCallback(async (answers: Record<string, QuestionAnswer>) => {
    if (!shuffled || !user) return null;
    setSubmitting(true);
    setError(null);
    try {
      const res = await quizService.submit({
        userId: user.id,
        quizId: shuffled.quiz.id,
        answers,
        questionOrder: shuffled.order,
      });
      setResult(res);
      setPassed(res.attempt.passed || passed);
      if (res.persisted) setHasAttempted(true);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [shuffled, user, passed]);

  const restart = useCallback(async () => {
    setResult(null);
    await load();
  }, [load]);

  return { shuffled, loading, error, submitting, result, passed, hasAttempted, submit, restart };
}
