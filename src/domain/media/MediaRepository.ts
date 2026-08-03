import type { MediaAsset } from './types';
import type { Repository } from '@/domain/shared/Repository';

export interface MediaRegistryRepository extends Repository<MediaAsset> {
  findByHash(hash: string): Promise<MediaAsset | null>;
  findRecent(limit?: number): Promise<MediaAsset[]>;
  searchByName(query: string): Promise<MediaAsset[]>;
}
