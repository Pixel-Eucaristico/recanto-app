import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { MediaAsset } from '@/domain/media/types';

export interface IMediaRegistryRepository {
  findByHash(hash: string): Promise<MediaAsset | null>;
  findRecent(limit?: number): Promise<MediaAsset[]>;
  searchByName(query: string): Promise<MediaAsset[]>;
  create(data: Omit<MediaAsset, 'id'>): Promise<MediaAsset>;
}

export class FirebaseMediaRegistryRepository
  extends BaseRepository<MediaAsset>
  implements IMediaRegistryRepository
{
  constructor() {
    super('media_registry');
  }

  async findByHash(hash: string): Promise<MediaAsset | null> {
    const results = await this.queryByFilters(
      [{ field: 'hash', operator: '==', value: hash }],
      { limitCount: 1 },
    );
    return results[0] ?? null;
  }

  async findRecent(limit = 30): Promise<MediaAsset[]> {
    return this.list('created_at', 'desc').then(items => items.slice(0, limit));
  }

  async searchByName(query: string): Promise<MediaAsset[]> {
    const all = await this.list('created_at', 'desc');
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 30);
    return all.filter(m => (m.name ?? '').toLowerCase().includes(q)).slice(0, 30);
  }
}

export const mediaRegistryRepository = new FirebaseMediaRegistryRepository();
