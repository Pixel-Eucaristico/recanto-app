import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { FormationModule } from '@/domain/formation/types';

export interface IModuleRepository {
  findById(id: string): Promise<FormationModule | null>;
  findByTrack(trackId: string): Promise<FormationModule[]>;
  findByIds(ids: string[]): Promise<FormationModule[]>;
  create(data: Omit<FormationModule, 'id'>): Promise<FormationModule>;
  update(id: string, data: Partial<Omit<FormationModule, 'id'>>): Promise<FormationModule | null>;
  remove(id: string): Promise<void>;
  updateLessonOrder(moduleId: string, lessonIds: string[]): Promise<void>;
}

export class FirebaseModuleRepository
  extends BaseRepository<FormationModule>
  implements IModuleRepository
{
  constructor() {
    super('formation_modules');
  }

  async findById(id: string): Promise<FormationModule | null> {
    return this.get(id);
  }

  async findByTrack(trackId: string): Promise<FormationModule[]> {
    return this.queryByFilters([{ field: 'track_id', operator: '==', value: trackId }], {
      orderByField: 'order',
    });
  }

  async findByIds(ids: string[]): Promise<FormationModule[]> {
    if (ids.length === 0) return [];
    const all = await Promise.all(ids.map(id => this.get(id)));
    return all.filter((m): m is FormationModule => m !== null);
  }

  async create(data: Omit<FormationModule, 'id'>): Promise<FormationModule> {
    return super.create({ ...data, created_at: new Date().toISOString() });
  }

  async update(id: string, data: Partial<Omit<FormationModule, 'id'>>): Promise<FormationModule | null> {
    return super.update(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }

  async updateLessonOrder(moduleId: string, lessonIds: string[]): Promise<void> {
    await this.update(moduleId, { lesson_ids: lessonIds });
  }
}

export const moduleRepository = new FirebaseModuleRepository();
