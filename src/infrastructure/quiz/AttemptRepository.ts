import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { QuizAttempt } from '@/domain/quiz/types';

export interface IAttemptRepository {
  findById(id: string): Promise<QuizAttempt | null>;
  findByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]>;
  findByUser(userId: string): Promise<QuizAttempt[]>;
  findLatestPassed(userId: string, quizId: string): Promise<QuizAttempt | null>;
  create(data: Omit<QuizAttempt, 'id'>): Promise<QuizAttempt>;
}

export class FirebaseAttemptRepository extends BaseRepository<QuizAttempt> implements IAttemptRepository {
  constructor() {
    super('quiz_attempts');
  }

  async findById(id: string): Promise<QuizAttempt | null> {
    return this.get(id);
  }

  async findByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]> {
    const all = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'quiz_id', operator: '==', value: quizId },
    ]);
    return all.sort((a, b) => b.attempted_at.localeCompare(a.attempted_at));
  }

  /**
   * Todas as tentativas do aluno — histórico do formador.
   * Ordena client-side pra não exigir índice composto (padrão do repo).
   */
  async findByUser(userId: string): Promise<QuizAttempt[]> {
    const all = await this.queryByFilters([{ field: 'user_id', operator: '==', value: userId }]);
    return all.sort((a, b) => b.attempted_at.localeCompare(a.attempted_at));
  }

  async findLatestPassed(userId: string, quizId: string): Promise<QuizAttempt | null> {
    const all = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'quiz_id', operator: '==', value: quizId },
      { field: 'passed', operator: '==', value: true },
    ]);
    const sorted = all.sort((a, b) => b.attempted_at.localeCompare(a.attempted_at));
    return sorted[0] ?? null;
  }
}

export const attemptRepository = new FirebaseAttemptRepository();
