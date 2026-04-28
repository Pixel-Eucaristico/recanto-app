import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { QuizAttempt } from '@/domain/quiz/types';

export interface IAttemptRepository {
  findById(id: string): Promise<QuizAttempt | null>;
  findByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]>;
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
    return this.queryByFilters(
      [
        { field: 'user_id', operator: '==', value: userId },
        { field: 'quiz_id', operator: '==', value: quizId },
      ],
      { orderByField: 'attempted_at', direction: 'desc' },
    );
  }

  async findLatestPassed(userId: string, quizId: string): Promise<QuizAttempt | null> {
    const results = await this.queryByFilters(
      [
        { field: 'user_id', operator: '==', value: userId },
        { field: 'quiz_id', operator: '==', value: quizId },
        { field: 'passed', operator: '==', value: true },
      ],
      { orderByField: 'attempted_at', direction: 'desc', limitCount: 1 },
    );
    return results[0] ?? null;
  }
}

export const attemptRepository = new FirebaseAttemptRepository();
