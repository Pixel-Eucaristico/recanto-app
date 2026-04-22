import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { CommunityPost } from '@/domain/community/types';

/**
 * Ordena client-side por created_at desc — evita composite indexes (where+where+orderBy)
 * e funciona no emulator + cloud sem configuração extra.
 */
function sortByCreatedDesc(list: CommunityPost[]): CommunityPost[] {
  return [...list].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export class CommunityPostRepository extends BaseRepository<CommunityPost> {
  constructor() {
    super('community_posts');
  }

  async findGlobal(): Promise<CommunityPost[]> {
    const list = await this.queryByFilters([
      { field: 'visibility.scope', operator: '==', value: 'global' },
    ]);
    return sortByCreatedDesc(list);
  }

  async findByModule(trackId: string, moduleId: string): Promise<CommunityPost[]> {
    const list = await this.queryByFilters([
      { field: 'visibility.scope', operator: '==', value: 'module' },
      { field: 'visibility.track_id', operator: '==', value: trackId },
      { field: 'visibility.module_id', operator: '==', value: moduleId },
    ]);
    return sortByCreatedDesc(list);
  }

  async findByLesson(trackId: string, lessonId: string): Promise<CommunityPost[]> {
    const list = await this.queryByFilters([
      { field: 'visibility.scope', operator: '==', value: 'lesson' },
      { field: 'visibility.track_id', operator: '==', value: trackId },
      { field: 'visibility.lesson_id', operator: '==', value: lessonId },
    ]);
    return sortByCreatedDesc(list);
  }

  async findByTrack(trackId: string): Promise<CommunityPost[]> {
    const list = await this.queryByFilters([
      { field: 'visibility.scope', operator: '==', value: 'track' },
      { field: 'visibility.track_id', operator: '==', value: trackId },
    ]);
    return sortByCreatedDesc(list);
  }

  /** Busca TODOS os posts independente do escopo — usado no fórum global pra agregar tudo. */
  async findAll(): Promise<CommunityPost[]> {
    const list = await this.list();
    return sortByCreatedDesc(list);
  }
}

export const communityPostRepository = new CommunityPostRepository();
