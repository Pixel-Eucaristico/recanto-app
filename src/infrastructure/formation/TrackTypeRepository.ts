import { BaseRepository } from '@/shared/firebase/BaseRepository';
import type { FormationTrackType } from '@/domain/formation/types';

export interface ITrackTypeRepository {
  findAll(): Promise<FormationTrackType[]>;
  findById(id: string): Promise<FormationTrackType | null>;
  create(data: Omit<FormationTrackType, 'id'>): Promise<FormationTrackType>;
  update(id: string, data: Partial<Omit<FormationTrackType, 'id'>>): Promise<FormationTrackType | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseTrackTypeRepository
  extends BaseRepository<FormationTrackType>
  implements ITrackTypeRepository
{
  constructor() {
    super('formation_track_types');
  }

  async findAll(): Promise<FormationTrackType[]> {
    const list = await this.list();
    return [...list].sort((a, b) => a.order - b.order);
  }

  async findById(id: string): Promise<FormationTrackType | null> {
    return this.get(id);
  }

  async create(data: Omit<FormationTrackType, 'id'>): Promise<FormationTrackType> {
    return super.create({ ...data, created_at: new Date().toISOString() });
  }

  async update(id: string, data: Partial<Omit<FormationTrackType, 'id'>>): Promise<FormationTrackType | null> {
    return super.update(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const trackTypeRepository = new FirebaseTrackTypeRepository();
