import { Quiz, QuizAttempt, QuizQuestion } from '@/domain/quiz/types';

export interface ScoreResult {
  score: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  detail: Array<{
    questionId: string;
    correctOptionId: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
  }>;
}

export class QuizAttemptEntity {
  /**
   * Calcula a pontuação comparando respostas do usuário contra as opções corretas do quiz.
   * Retorna score em escala 0–100 e aprovação baseada em passing_score.
   */
  static score(
    quiz: Pick<Quiz, 'questions' | 'passing_score'>,
    answers: Record<string, string>,
  ): ScoreResult {
    const total = quiz.questions.length;
    let correctCount = 0;
    const detail: ScoreResult['detail'] = [];

    for (const q of quiz.questions) {
      const correct = q.options.find(o => o.is_correct);
      const selectedId = answers[q.id] ?? null;
      const isCorrect = !!correct && selectedId === correct.id;
      if (isCorrect) correctCount++;
      detail.push({
        questionId: q.id,
        correctOptionId: correct?.id ?? '',
        selectedOptionId: selectedId,
        isCorrect,
      });
    }

    const score = total > 0 ? (correctCount / total) * 100 : 0;
    return {
      score: Math.round(score * 100) / 100,
      correctCount,
      totalCount: total,
      passed: score >= quiz.passing_score,
      detail,
    };
  }

  static fromScore(
    params: Pick<QuizAttempt, 'user_id' | 'quiz_id' | 'lesson_id' | 'answers' | 'question_order'>,
    result: ScoreResult,
  ): Omit<QuizAttempt, 'id'> {
    return {
      ...params,
      score: result.score,
      passed: result.passed,
      attempted_at: new Date().toISOString(),
    };
  }
}
