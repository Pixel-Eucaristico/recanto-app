import { Quiz, QuizOption, QuizQuestion, QuizValidation, ShuffledQuiz } from '@/domain/quiz/types';

export class QuizEntity {
  static validate(quiz: Pick<Quiz, 'title' | 'questions' | 'passing_score'>): QuizValidation {
    const errors: string[] = [];
    if (!quiz.title || quiz.title.trim().length < 3) errors.push('Título deve ter no mínimo 3 caracteres.');
    if (!quiz.questions || quiz.questions.length === 0) errors.push('Quiz deve ter no mínimo 1 pergunta.');
    if (quiz.passing_score < 0 || quiz.passing_score > 100) errors.push('Pontuação mínima deve estar entre 0 e 100.');

    quiz.questions?.forEach((q, i) => {
      if (!q.text || q.text.trim().length === 0) errors.push(`Pergunta ${i + 1}: texto vazio.`);
      if (!q.options || q.options.length < 2) errors.push(`Pergunta ${i + 1}: mínimo 2 opções.`);
      const correctCount = q.options?.filter(o => o.is_correct).length ?? 0;
      if (correctCount === 0) errors.push(`Pergunta ${i + 1}: sem opção correta.`);
      if (correctCount > 1) errors.push(`Pergunta ${i + 1}: apenas 1 opção correta.`);
      const emptyOptions = (q.options ?? []).filter(o => o.text.trim().length === 0).length;
      if (emptyOptions > 0) errors.push(`Pergunta ${i + 1}: ${emptyOptions} opção(ões) em branco.`);
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Fisher–Yates shuffle — retorna novo array sem mutar o original.
   */
  static shuffle<T>(arr: T[]): T[] {
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Cria versão embaralhada do quiz — perguntas e opções.
   * Preserva IDs para ranking das respostas.
   */
  static shuffleForAttempt(quiz: Quiz): ShuffledQuiz {
    const shuffledQuestions: QuizQuestion[] = QuizEntity.shuffle(quiz.questions).map(q => ({
      ...q,
      options: QuizEntity.shuffle(q.options),
    }));
    return {
      quiz,
      questions: shuffledQuestions,
      order: shuffledQuestions.map(q => q.id),
    };
  }

  static correctOption(q: QuizQuestion): QuizOption | undefined {
    return q.options.find(o => o.is_correct);
  }
}
