import { collection, getDocs, limit, orderBy, query, where, type QueryConstraint } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { CommunityPost } from '@/domain/community/types';

export interface PageResult<T> {
  items: T[];
  /** Cursor pra próxima página — null = fim. */
  nextCursor: string | null;
}

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

  /** Resolve posts por id (batches de 10 — limite do operador `in` com documentId). */
  async findByIds(ids: string[]): Promise<CommunityPost[]> {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (unique.length === 0) return [];
    const results: CommunityPost[] = [];
    for (let i = 0; i < unique.length; i += 10) {
      const batch = unique.slice(i, i + 10);
      const found = await Promise.all(batch.map(id => this.get(id).catch(() => null)));
      results.push(...found.filter((p): p is CommunityPost => p !== null));
    }
    return results;
  }

  /**
   * Posts de várias trilhas (todos os alunos, qualquer escopo não-global).
   * Ver nota sobre `batchSize` em `ReflectionRepository.TrackQueryOptions`.
   */
  async findByTrackIds(
    trackIds: string[],
    opts?: { batchSize?: number; limitCount?: number },
  ): Promise<CommunityPost[]> {
    if (trackIds.length === 0) return [];
    const batchSize = Math.max(1, Math.min(opts?.batchSize ?? 30, 30));

    const results: CommunityPost[] = [];
    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      const filter = batch.length === 1
        ? { field: 'visibility.track_id', operator: '==' as const, value: batch[0] }
        : { field: 'visibility.track_id', operator: 'in' as const, value: batch };
      const page = await this.queryByFilters([filter], {
        orderByField: 'created_at',
        direction: 'desc',
        limitCount: opts?.limitCount,
      });
      results.push(...page);
    }

    const sorted = sortByCreatedDesc(results);
    return opts?.limitCount ? sorted.slice(0, opts.limitCount) : sorted;
  }

  /** Busca TODOS os posts independente do escopo — usado no fórum global pra agregar tudo. */
  async findAll(): Promise<CommunityPost[]> {
    const list = await this.list();
    return sortByCreatedDesc(list);
  }

  async findByUser(userId: string, limitCount = 20): Promise<CommunityPost[]> {
    const list = await this.queryByFilters(
      [{ field: 'created_by', operator: '==', value: userId }],
      { orderByField: 'created_at', direction: 'desc', limitCount },
    );
    return list;
  }

  /**
   * Paginação cursor-based por created_at. Cursor = último created_at retornado.
   * Mantém custo constante: nunca lê tudo, só `pageSize` docs por chamada.
   */
  async findByUserPaginated(
    userId: string,
    pageSize: number,
    cursor: string | null,
  ): Promise<PageResult<CommunityPost>> {
    const constraints: QueryConstraint[] = [
      where('created_by', '==', userId),
      orderBy('created_at', 'desc'),
    ];
    if (cursor) constraints.push(where('created_at', '<', cursor));
    constraints.push(limit(pageSize));
    const snap = await getDocs(query(collection(db, 'community_posts'), ...constraints));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as CommunityPost);
    const nextCursor = items.length === pageSize ? items[items.length - 1].created_at : null;
    return { items, nextCursor };
  }
}

export const communityPostRepository = new CommunityPostRepository();
