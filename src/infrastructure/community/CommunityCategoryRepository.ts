import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { CommunityCategory } from '@/domain/community/types';

export class CommunityCategoryRepository extends BaseRepository<CommunityCategory> {
  constructor() {
    super('community_categories');
  }

  async listAll(): Promise<CommunityCategory[]> {
    const list = await this.list();
    return [...list].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }
}

export const communityCategoryRepository = new CommunityCategoryRepository();
