'use client';

import { useMemo, useState } from 'react';
import type { ShuffledQuiz, QuizQuestion, QuestionAnswer } from '@/domain/quiz/types';
import { QuizAttemptEntity } from '@/domain/quiz/entities/QuizAttempt';
import { emptyAnswer } from '../utils/quizPlayerUtils';

export function useQuizPlayer(shuffled: ShuffledQuiz, onSubmit: (answers: Record<string, QuestionAnswer>) => Promise<unknown>) {
  const questions = shuffled.questions;
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [revealed, setRevealed] = useState(false);

  const q = questions[index];
  const kind = q?.kind ?? 'multiple_choice';
  const isLast = index === total - 1;
  const currentAnswer = (answers[q?.id] ?? emptyAnswer(q)) as QuestionAnswer;

  const scoreForCurrent = useMemo(() => {
    if (!revealed || !q) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = QuizAttemptEntity.score({ questions: [q], passing_score: 100 } as any, { [q.id]: currentAnswer });
    return result.detail[0];
  }, [revealed, q, currentAnswer]);

  const progressPct = ((index + (revealed ? 1 : 0)) / total) * 100;

  function setCurrent(v: QuestionAnswer) {
    setAnswers(prev => ({ ...prev, [q.id]: v }));
  }

  function canVerify(): boolean {
    if (!q) return false;
    if (kind === 'multiple_choice' || kind === 'true_false') return typeof currentAnswer === 'string' && currentAnswer.length > 0;
    if (kind === 'fill_blank') return (Array.isArray(currentAnswer) ? currentAnswer : []).some(v => v?.trim().length > 0);
    if (kind === 'matching') return typeof currentAnswer === 'object' && !Array.isArray(currentAnswer) && Object.keys(currentAnswer).length > 0;
    if (kind === 'sequence') return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    if (kind === 'classify') return typeof currentAnswer === 'object' && !Array.isArray(currentAnswer) && Object.keys(currentAnswer).length > 0;
    return false;
  }

  async function next() {
    if (isLast) { await onSubmit(answers); return; }
    setIndex(i => i + 1);
    setRevealed(false);
  }

  return {
    q, kind, isLast, total, index,
    currentAnswer, setCurrent,
    revealed, setRevealed,
    scoreForCurrent, progressPct,
    canVerify, next,
    answers,
  };
}
