import { BaseRepository } from '@/shared/firebase/BaseRepository';
import type { ContentVersion } from '@/domain/content-versions/types';

export class ContentVersionRepository extends BaseRepository<ContentVersion> {
  constructor() {
    super('content_versions');
  }

  /** Versões de um doc específico ordenadas mais recente primeiro. */
  async findByTarget(target_collection: string, target_id: string): Promise<ContentVersion[]> {
    return this.queryByFilters(
      [
        { field: 'target_collection', operator: '==', value: target_collection },
        { field: 'target_id', operator: '==', value: target_id },
      ],
      { orderByField: 'created_at', direction: 'desc', limitCount: 50 },
    );
  }

  /**
   * Todas as versões de um usuário — usado pra contar edições por escrito numa
   * query só, em vez de um `findByTarget` por documento.
   */
  async findByUser(userId: string, limitCount = 200): Promise<ContentVersion[]> {
    return this.queryByFilters(
      [{ field: 'user_id', operator: '==', value: userId }],
      { orderByField: 'created_at', direction: 'desc', limitCount },
    );
  }

  /** Versões de vários documentos alvo (batches de 10 — limite do `in`). */
  async findByTargets(target_collection: string, targetIds: string[]): Promise<ContentVersion[]> {
    const unique = Array.from(new Set(targetIds.filter(Boolean)));
    if (unique.length === 0) return [];
    const results: ContentVersion[] = [];
    for (let i = 0; i < unique.length; i += 10) {
      const batch = unique.slice(i, i + 10);
      const filter = batch.length === 1
        ? { field: 'target_id', operator: '==' as const, value: batch[0] }
        : { field: 'target_id', operator: 'in' as const, value: batch };
      const page = await this.queryByFilters([
        { field: 'target_collection', operator: '==', value: target_collection },
        filter,
      ]);
      results.push(...page);
    }
    return results.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

export const contentVersionRepository = new ContentVersionRepository();
