import { contentGrantRepository } from '@/infrastructure/content-access/ContentGrantRepository';
import { ContentGrant, ContentType } from '@/shared/types/content-access';

export class ContentGrantService {
  async listForUser(userId: string, contentType: ContentType): Promise<ContentGrant[]> {
    return contentGrantRepository.listForUser(userId, contentType);
  }

  async listGrantedContentIds(userId: string, contentType: ContentType): Promise<Set<string>> {
    const grants = await contentGrantRepository.listForUser(userId, contentType);
    return new Set(grants.map(g => g.content_id));
  }

  async listForContent(contentId: string, contentType: ContentType): Promise<ContentGrant[]> {
    return contentGrantRepository.listForContent(contentId, contentType);
  }

  async grant(
    userId: string,
    contentId: string,
    contentType: ContentType,
    grantedBy: string,
  ): Promise<ContentGrant> {
    const existing = await contentGrantRepository.findOne(userId, contentId, contentType);
    if (existing) return existing;
    return contentGrantRepository.create({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      granted_at: new Date().toISOString(),
      granted_by: grantedBy,
    });
  }

  async revoke(grantId: string): Promise<void> {
    await contentGrantRepository.delete(grantId);
  }

  /**
   * Sincroniza grants de um conteúdo com a lista exata de userIds.
   * Cria os novos, remove os ausentes. Mantém os iguais.
   */
  async syncGrants(
    contentId: string,
    contentType: ContentType,
    desiredUserIds: string[],
    grantedBy: string,
  ): Promise<void> {
    const existing = await contentGrantRepository.listForContent(contentId, contentType);
    const existingByUser = new Map(existing.map(g => [g.user_id, g]));
    const desiredSet = new Set(desiredUserIds);

    const toCreate = desiredUserIds.filter(uid => !existingByUser.has(uid));
    const toRemove = existing.filter(g => !desiredSet.has(g.user_id));

    await Promise.all([
      ...toCreate.map(uid =>
        contentGrantRepository.create({
          user_id: uid,
          content_id: contentId,
          content_type: contentType,
          granted_at: new Date().toISOString(),
          granted_by: grantedBy,
        }),
      ),
      ...toRemove.map(g => contentGrantRepository.delete(g.id)),
    ]);
  }
}

export const contentGrantService = new ContentGrantService();
