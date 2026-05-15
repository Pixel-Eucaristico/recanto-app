import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { FormationLesson } from '@/domain/formation/types';

export interface ILessonRepository {
  findById(id: string): Promise<FormationLesson | null>;
  findByModule(moduleId: string): Promise<FormationLesson[]>;
  findByIds(ids: string[]): Promise<FormationLesson[]>;
  create(data: Omit<FormationLesson, 'id'>): Promise<FormationLesson>;
  update(id: string, data: Partial<Omit<FormationLesson, 'id'>>): Promise<FormationLesson | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseLessonRepository
  extends BaseRepository<FormationLesson>
  implements ILessonRepository
{
  constructor() {
    super('formation_lessons');
  }

  async findById(id: string): Promise<FormationLesson | null> {
    return this.get(id);
  }

  async findByModule(moduleId: string): Promise<FormationLesson[]> {
    return this.queryByFilters([{ field: 'module_id', operator: '==', value: moduleId }], {
      orderByField: 'order',
    });
  }

  async findByIds(ids: string[]): Promise<FormationLesson[]> {
    if (ids.length === 0) return [];
    const all = await Promise.all(ids.map(id => this.get(id)));
    return all.filter((l): l is FormationLesson => l !== null);
  }

  async create(data: Omit<FormationLesson, 'id'>): Promise<FormationLesson> {
    return super.create({ ...data, created_at: new Date().toISOString() });
  }

  async update(id: string, data: Partial<Omit<FormationLesson, 'id'>>): Promise<FormationLesson | null> {
    return super.update(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const lessonRepository = new FirebaseLessonRepository();
