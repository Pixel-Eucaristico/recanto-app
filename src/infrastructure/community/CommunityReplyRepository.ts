import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { CommunityReply } from '@/domain/community/types';

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
}

export const communityReplyRepository = new CommunityReplyRepository();
