import { DirectusRepository } from '../DirectusRepository';
import type { ContentGrantRepository } from '@/domain/permissions/PermissionsRepository';
import type { ContentGrant, ContentType } from '@/shared/types/content-access';

export class DirectusContentGrantRepository
  extends DirectusRepository<ContentGrant>
  implements ContentGrantRepository
{
  constructor() {
    super('content_grants');
  }

  findByUser(userId: string): Promise<ContentGrant[]> {
    return this.findManyBy({ user_id: userId });
  }

  findByContent(contentType: ContentType, contentId: string): Promise<ContentGrant[]> {
    return this.findManyBy({ content_type: contentType, content_id: contentId });
  }

  findUserGrant(
    userId: string,
    contentType: ContentType,
    contentId: string,
  ): Promise<ContentGrant | null> {
    return this.findOneBy({
      user_id: userId,
      content_type: contentType,
      content_id: contentId,
    });
  }

  revoke(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const directusContentGrantRepository = new DirectusContentGrantRepository();
