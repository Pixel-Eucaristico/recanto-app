'use client';

import { useState } from 'react';
import type { Quiz, QuizQuestion, QuestionKind } from '@/domain/quiz/types';
import { QuizEntity } from '@/domain/quiz/entities/Quiz';
import { quizService } from '@/application/quiz/QuizService';
import { newQuestion } from '../utils/quizBuilderUtils';

interface UseQuizBuilderOptions {
  lessonId: string;
  createdBy: string;
  initial?: Quiz | null;
  onSaved?: (quiz: Quiz) => void;
}

export function useQuizBuilder({ lessonId, createdBy, initial, onSaved }: UseQuizBuilderOptions) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [passingScore, setPassingScore] = useState<number>(initial?.passing_score ?? 70);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initial?.questions?.length ? initial.questions : [newQuestion('multiple_choice')],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function updateQuestion(idx: number, patch: Partial<QuizQuestion>) {
    setQuestions(prev => prev.map((q, i) => (i === idx ? ({ ...q, ...patch } as QuizQuestion) : q)));
  }

  function addQuestion(kind: QuestionKind) {
    setQuestions(prev => [...prev, newQuestion(kind)]);
  }

  function removeQuestion(idx: number) {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  }

  function changeKind(idx: number, kind: QuestionKind) {
    setQuestions(prev =>
      prev.map((q, i) => (i === idx ? { ...newQuestion(kind), text: q.text, explanation: q.explanation } : q)),
    );
  }

  async function save() {
    setError(null);
    setSavedMsg(null);
    const payload: Omit<Quiz, 'id'> & { id?: string } = {
      id: initial?.id,
      lesson_id: lessonId,
      title: title.trim(),
      description: description.trim() || undefined,
      questions,
      passing_score: passingScore,
      created_at: initial?.created_at ?? new Date().toISOString(),
      created_by: initial?.created_by ?? createdBy,
    };
    const validation = QuizEntity.validate(payload);
    if (!validation.valid) { setError(validation.errors.join(' ')); return; }
    setSaving(true);
    try {
      const saved = await quizService.save(payload as Quiz);
      setSavedMsg('Quiz salvo com sucesso.');
      onSaved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return {
    title, setTitle,
    description, setDescription,
    passingScore, setPassingScore,
    questions,
    saving, error, savedMsg,
    updateQuestion, addQuestion, removeQuestion, changeKind,
    save,
  };
}
