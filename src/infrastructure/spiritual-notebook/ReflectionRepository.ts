import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { Reflection } from '@/domain/spiritual-notebook/types';

export interface IReflectionRepository {
  findById(id: string): Promise<Reflection | null>;
  findByUser(userId: string): Promise<Reflection[]>;
  findByLesson(userId: string, lessonId: string): Promise<Reflection | null>;
  findSubmitted(): Promise<Reflection[]>;
  create(data: Omit<Reflection, 'id'>): Promise<Reflection>;
  update(id: string, data: Partial<Omit<Reflection, 'id'>>): Promise<Reflection | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseReflectionRepository
  extends BaseRepository<Reflection>
  implements IReflectionRepository
{
  constructor() {
    super('spiritual_reflections');
  }

  async findById(id: string): Promise<Reflection | null> {
    return this.get(id);
  }

  async findByUser(userId: string): Promise<Reflection[]> {
    return this.queryByFilters(
      [{ field: 'user_id', operator: '==', value: userId }],
      { orderByField: 'created_at', direction: 'desc' }
    );
  }

  async findByLesson(userId: string, lessonId: string): Promise<Reflection | null> {
    const results = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'lesson_id', operator: '==', value: lessonId },
    ]);
    return results[0] ?? null;
  }

  async findSubmitted(): Promise<Reflection[]> {
    return this.queryByFilters(
      [{ field: 'status', operator: '==', value: 'submitted' }],
      { orderByField: 'submitted_at', direction: 'desc' }
    );
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const reflectionRepository = new FirebaseReflectionRepository();
