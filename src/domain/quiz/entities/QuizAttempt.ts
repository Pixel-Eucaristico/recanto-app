import { Quiz, QuizAttempt, QuizQuestion, QuestionAnswer } from '@/domain/quiz/types';
import { FillBlankEntity } from '@/domain/quiz/entities/questionTypes/FillBlank';
import { MatchingEntity } from '@/domain/quiz/entities/questionTypes/Matching';
import { SequenceEntity } from '@/domain/quiz/entities/questionTypes/Sequence';
import { ClassifyEntity } from '@/domain/quiz/entities/questionTypes/Classify';

export interface QuestionScoreDetail {
  questionId: string;
  kind: QuizQuestion['kind'];
  fraction: number; // 0..1
  isCorrect: boolean;
  selectedAnswer: QuestionAnswer | null;
  /** Legado para múltipla escolha — id da opção correta. */
  correctOptionId?: string;
  /** Legado para múltipla escolha — id da opção selecionada. */
  selectedOptionId?: string | null;
}

export interface ScoreResult {
  score: number; // 0..100
  earnedPoints: number;
  totalPoints: number;
  passed: boolean;
  detail: QuestionScoreDetail[];
}

function scoreQuestion(q: QuizQuestion, answer: QuestionAnswer | undefined): Omit<QuestionScoreDetail, 'questionId'> {
  const kind = q.kind ?? 'multiple_choice';

  if (kind === 'multiple_choice' || kind === 'true_false') {
    const mc = q as Extract<QuizQuestion, { options?: unknown }>;
    const options = 'options' in mc ? mc.options ?? [] : [];
    const correct = options.find(o => o.is_correct);
    const selectedId = typeof answer === 'string' ? answer : null;
    const isCorrect = !!correct && selectedId === correct.id;
    return {
      kind,
      fraction: isCorrect ? 1 : 0,
      isCorrect,
      selectedAnswer: selectedId,
      correctOptionId: correct?.id,
      selectedOptionId: selectedId,
    };
  }

  if (kind === 'fill_blank') {
    const fraction = FillBlankEntity.score(q as Extract<QuizQuestion, { kind: 'fill_blank' }>, Array.isArray(answer) ? (answer as string[]) : undefined);
    return { kind, fraction, isCorrect: fraction === 1, selectedAnswer: (answer as QuestionAnswer) ?? null };
  }
  if (kind === 'matching') {
    const fraction = MatchingEntity.score(q as Extract<QuizQuestion, { kind: 'matching' }>, typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : undefined);
    return { kind, fraction, isCorrect: fraction === 1, selectedAnswer: (answer as QuestionAnswer) ?? null };
  }
  if (kind === 'sequence') {
    const fraction = SequenceEntity.score(q as Extract<QuizQuestion, { kind: 'sequence' }>, Array.isArray(answer) ? (answer as string[]) : undefined);
    return { kind, fraction, isCorrect: fraction === 1, selectedAnswer: (answer as QuestionAnswer) ?? null };
  }
  if (kind === 'classify') {
    const fraction = ClassifyEntity.score(q as Extract<QuizQuestion, { kind: 'classify' }>, typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : undefined);
    return { kind, fraction, isCorrect: fraction === 1, selectedAnswer: (answer as QuestionAnswer) ?? null };
  }

  return { kind, fraction: 0, isCorrect: false, selectedAnswer: (answer as QuestionAnswer) ?? null };
}

export class QuizAttemptEntity {
  static score(
    quiz: Pick<Quiz, 'questions' | 'passing_score'>,
    answers: Record<string, QuestionAnswer>,
  ): ScoreResult {
    const total = quiz.questions.length;
    let earned = 0;
    const detail: QuestionScoreDetail[] = [];

    for (const q of quiz.questions) {
      const res = scoreQuestion(q, answers[q.id]);
      earned += res.fraction;
      detail.push({ questionId: q.id, ...res });
    }

    const score = total > 0 ? (earned / total) * 100 : 0;
    return {
      score: Math.round(score * 100) / 100,
      earnedPoints: Math.round(earned * 100) / 100,
      totalPoints: total,
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
