import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { Quiz } from '@/domain/quiz/types';

export interface IQuizRepository {
  findById(id: string): Promise<Quiz | null>;
  findByLesson(lessonId: string): Promise<Quiz | null>;
  create(data: Omit<Quiz, 'id'>): Promise<Quiz>;
  update(id: string, data: Partial<Omit<Quiz, 'id'>>): Promise<Quiz | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseQuizRepository extends BaseRepository<Quiz> implements IQuizRepository {
  constructor() {
    super('quizzes');
  }

  async findById(id: string): Promise<Quiz | null> {
    return this.get(id);
  }

  async findByLesson(lessonId: string): Promise<Quiz | null> {
    const results = await this.queryByFilters([
      { field: 'lesson_id', operator: '==', value: lessonId },
    ]);
    return results[0] ?? null;
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const quizRepository = new FirebaseQuizRepository();
