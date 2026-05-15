import {
  Quiz,
  QuizOption,
  QuizQuestion,
  QuizValidation,
  ShuffledQuiz,
  MultipleChoiceQuestion,
  FillBlankQuestion,
  MatchingQuestion,
  SequenceQuestion,
  ClassifyQuestion,
} from '@/domain/quiz/types';
import { FillBlankEntity } from '@/domain/quiz/entities/questionTypes/FillBlank';
import { MatchingEntity } from '@/domain/quiz/entities/questionTypes/Matching';
import { SequenceEntity } from '@/domain/quiz/entities/questionTypes/Sequence';
import { ClassifyEntity } from '@/domain/quiz/entities/questionTypes/Classify';

function validateQuestion(q: QuizQuestion, idx: number): string[] {
  const errors: string[] = [];
  const prefix = `Pergunta ${idx + 1}`;
  if (!q.text?.trim()) errors.push(`${prefix}: texto vazio.`);

  const kind = q.kind ?? 'multiple_choice';
  if (kind === 'multiple_choice' || kind === 'true_false') {
    const mc = q as MultipleChoiceQuestion;
    if (!mc.options || mc.options.length < 2) errors.push(`${prefix}: mínimo 2 opções.`);
    const correctCount = mc.options?.filter(o => o.is_correct).length ?? 0;
    if (correctCount === 0) errors.push(`${prefix}: sem opção correta.`);
    if (correctCount > 1) errors.push(`${prefix}: apenas 1 opção correta.`);
    const emptyOptions = (mc.options ?? []).filter(o => o.text.trim().length === 0).length;
    if (emptyOptions > 0) errors.push(`${prefix}: ${emptyOptions} opção(ões) em branco.`);
    return errors;
  }
  if (kind === 'fill_blank') {
    return errors.concat(FillBlankEntity.validate(q as FillBlankQuestion).map(e => `${prefix}: ${e}`));
  }
  if (kind === 'matching') {
    return errors.concat(MatchingEntity.validate(q as MatchingQuestion).map(e => `${prefix}: ${e}`));
  }
  if (kind === 'sequence') {
    return errors.concat(SequenceEntity.validate(q as SequenceQuestion).map(e => `${prefix}: ${e}`));
  }
  if (kind === 'classify') {
    return errors.concat(ClassifyEntity.validate(q as ClassifyQuestion).map(e => `${prefix}: ${e}`));
  }
  return errors;
}

export class QuizEntity {
  static validate(quiz: Pick<Quiz, 'title' | 'questions' | 'passing_score'>): QuizValidation {
    const errors: string[] = [];
    if (!quiz.title || quiz.title.trim().length < 3) errors.push('Título deve ter no mínimo 3 caracteres.');
    if (!quiz.questions || quiz.questions.length === 0) errors.push('Quiz deve ter no mínimo 1 pergunta.');
    if (quiz.passing_score < 0 || quiz.passing_score > 100) errors.push('Pontuação mínima deve estar entre 0 e 100.');
    quiz.questions?.forEach((q, i) => {
      errors.push(...validateQuestion(q, i));
    });
    return { valid: errors.length === 0, errors };
  }

  /** Fisher–Yates shuffle (novo array). */
  static shuffle<T>(arr: T[]): T[] {
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Embaralha perguntas e componentes internos por tipo:
   * - multiple_choice/true_false: opções embaralhadas
   * - matching: pares embaralhados em cada coluna
   * - sequence: itens embaralhados (aluno reordena)
   * - classify: cards embaralhados
   * - fill_blank: não altera (ordem das lacunas é semântica)
   */
  static shuffleForAttempt(quiz: Quiz): ShuffledQuiz {
    const shuffledQuestions: QuizQuestion[] = QuizEntity.shuffle(quiz.questions).map(q => {
      const kind = q.kind ?? 'multiple_choice';
      if (kind === 'multiple_choice' || kind === 'true_false') {
        const mc = q as MultipleChoiceQuestion;
        return { ...mc, options: QuizEntity.shuffle(mc.options) };
      }
      if (kind === 'matching') {
        // Retornar os pares originais — o player embaralhará o lado direito separadamente.
        return q;
      }
      if (kind === 'sequence') {
        // Retornar os itens originais — player embaralha na tela.
        return q;
      }
      if (kind === 'classify') {
        const c = q as ClassifyQuestion;
        return { ...c, cards: QuizEntity.shuffle(c.cards) };
      }
      return q;
    });
    return {
      quiz,
      questions: shuffledQuestions,
      order: shuffledQuestions.map(q => q.id),
    };
  }

  static correctOption(q: MultipleChoiceQuestion): QuizOption | undefined {
    return q.options.find(o => o.is_correct);
  }
}
