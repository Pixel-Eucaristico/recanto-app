'use client';

import { Award } from 'lucide-react';
import { quizRepository } from '@/infrastructure/quiz/QuizRepository';
import { attemptRepository } from '@/infrastructure/quiz/AttemptRepository';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface QuizConfig {
  /** ID do quiz quando vinculado por ID. Se vazio, usa quiz vinculado à aula via quiz.lesson_id. */
  quiz_id?: string;
}

const QuizPlugin: LessonComponent<QuizConfig> = {
  kind: 'quiz',
  label: 'Quiz',
  icon: Award,

  defaultConfig: {},
  defaultRequired: true,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">ID do quiz (opcional — se vazio usa o vinculado à aula)</span>
        <input
          className="input input-bordered input-sm"
          value={config.quiz_id ?? ''}
          onChange={e => onChange({ config: { quiz_id: e.target.value || undefined } as Partial<QuizConfig> })}
          placeholder="quiz_id"
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={required}
          onChange={e => onChange({ required: e.target.checked })}
        />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: () => (
    <div className="alert alert-info text-sm">
      <span>Quiz: vá pra aba Quiz da aula pra responder.</span>
    </div>
  ),

  ChecklistRowComponent: () => <div className="text-sm">Quiz · passar com nota mínima</div>,

  async isCompleted(config, ctx) {
    let quizId = config.quiz_id;
    if (!quizId) {
      const quiz = await quizRepository.findByLesson(ctx.lessonId);
      if (!quiz) return false;
      quizId = quiz.id;
    }
    const attempts = await attemptRepository.findByUserAndQuiz(ctx.userId, quizId);
    return attempts.some(a => a.passed);
  },

  summary() {
    return { label: 'Quiz', description: 'Passar com nota mínima' };
  },
};

export default QuizPlugin;
