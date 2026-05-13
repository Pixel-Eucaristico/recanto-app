import { BaseRepository, QueryFilter } from '@/shared/firebase/BaseRepository';
import { Role } from '@/shared/types/role';
import { FormationTrack } from '@/domain/formation/types';

export interface ITrackRepository {
  findAll(): Promise<FormationTrack[]>;
  findById(id: string): Promise<FormationTrack | null>;
  findPublished(): Promise<FormationTrack[]>;
  findByRole(role: Role): Promise<FormationTrack[]>;
  findByFormator(userId: string): Promise<FormationTrack[]>;
  create(data: Omit<FormationTrack, 'id'>): Promise<FormationTrack>;
  update(id: string, data: Partial<Omit<FormationTrack, 'id'>>): Promise<FormationTrack | null>;
  remove(id: string): Promise<void>;
  updateModuleOrder(trackId: string, moduleIds: string[]): Promise<void>;
}

export class FirebaseTrackRepository
  extends BaseRepository<FormationTrack>
  implements ITrackRepository
{
  constructor() {
    super('formation_tracks');
  }

  protected deserialize(id: string, data: Record<string, unknown>): FormationTrack {
    const raw = { id, ...data } as FormationTrack;
    return {
      ...raw,
      required_roles: Array.isArray(raw.required_roles) ? raw.required_roles : [],
      age_rating: raw.age_rating ?? 'L',
    };
  }

  async findAll(): Promise<FormationTrack[]> {
    return this.list('order', 'asc');
  }

  async findById(id: string): Promise<FormationTrack | null> {
    return this.get(id);
  }

  async findPublished(): Promise<FormationTrack[]> {
    return this.queryByFilters([{ field: 'is_published', operator: '==', value: true }], {
      orderByField: 'order',
    });
  }

  async findByRole(role: Role): Promise<FormationTrack[]> {
    const published = await this.findPublished();
    if (role === 'admin') return published;
    return published.filter(
      t => t.required_roles.length === 0 || t.required_roles.includes(role)
    );
  }

  async findByFormator(userId: string): Promise<FormationTrack[]> {
    return this.queryByFilters([
      { field: 'formator_ids', operator: 'array-contains', value: userId },
    ]);
  }

  async create(data: Omit<FormationTrack, 'id'>): Promise<FormationTrack> {
    return super.create({ ...data, created_at: new Date().toISOString() });
  }

  async update(id: string, data: Partial<Omit<FormationTrack, 'id'>>): Promise<FormationTrack | null> {
    return super.update(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }

  async updateModuleOrder(trackId: string, moduleIds: string[]): Promise<void> {
    await this.update(trackId, { module_ids: moduleIds });
  }
}

export const trackRepository = new FirebaseTrackRepository();
