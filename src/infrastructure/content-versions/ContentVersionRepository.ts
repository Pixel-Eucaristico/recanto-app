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

  /** Versões de um user em uma aula (drawer "minhas edições nessa aula"). */
  async findByUserLesson(userId: string, lessonId: string): Promise<ContentVersion[]> {
    return this.queryByFilters(
      [
        { field: 'user_id', operator: '==', value: userId },
        { field: 'lesson_id', operator: '==', value: lessonId },
      ],
      { orderByField: 'created_at', direction: 'desc', limitCount: 50 },
    );
  }
}

export const contentVersionRepository = new ContentVersionRepository();
