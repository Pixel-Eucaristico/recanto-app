import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { CommunityReply } from '@/domain/community/types';
import type { PageResult } from './CommunityPostRepository';

export class CommunityReplyRepository extends BaseRepository<CommunityReply> {
  constructor() {
    super('community_replies');
  }

  async findByPost(postId: string): Promise<CommunityReply[]> {
    const list = await this.queryByFilters([
      { field: 'post_id', operator: '==', value: postId },
    ]);
    return [...list].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  }

  async findByUser(userId: string, limitCount = 20): Promise<CommunityReply[]> {
    return this.queryByFilters(
      [{ field: 'created_by', operator: '==', value: userId }],
      { orderByField: 'created_at', direction: 'desc', limitCount },
    );
  }

  async findByUserPaginated(
    userId: string,
    pageSize: number,
    cursor: string | null,
  ): Promise<PageResult<CommunityReply>> {
    const constraints = [
      where('created_by', '==', userId),
      orderBy('created_at', 'desc'),
    ];
    if (cursor) constraints.push(where('created_at', '<', cursor));
    constraints.push(limit(pageSize));
    const snap = await getDocs(query(collection(db, 'community_replies'), ...constraints));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as CommunityReply);
    const nextCursor = items.length === pageSize ? items[items.length - 1].created_at : null;
    return { items, nextCursor };
  }
}

export const communityReplyRepository = new CommunityReplyRepository();
