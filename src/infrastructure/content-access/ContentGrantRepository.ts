import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { ContentGrant, ContentType } from '@/shared/types/content-access';

export class ContentGrantRepository extends BaseRepository<ContentGrant> {
  constructor() {
    super('content_grants');
  }

  async listForUser(userId: string, contentType: ContentType): Promise<ContentGrant[]> {
    return this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'content_type', operator: '==', value: contentType },
    ]);
  }

  async listForContent(contentId: string, contentType: ContentType): Promise<ContentGrant[]> {
    return this.queryByFilters([
      { field: 'content_id', operator: '==', value: contentId },
      { field: 'content_type', operator: '==', value: contentType },
    ]);
  }

  async findOne(userId: string, contentId: string, contentType: ContentType): Promise<ContentGrant | null> {
    const all = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'content_id', operator: '==', value: contentId },
      { field: 'content_type', operator: '==', value: contentType },
    ]);
    return all[0] ?? null;
  }
}

export const contentGrantRepository = new ContentGrantRepository();
