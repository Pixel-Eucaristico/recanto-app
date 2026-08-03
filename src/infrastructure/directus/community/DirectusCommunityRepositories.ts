import { DirectusRepository } from '../DirectusRepository';
import { PollEntity } from '@/domain/community/entities/Poll';
import type {
  CommunityCategory,
  CommunityPost,
  CommunityReply,
  PollVote,
} from '@/domain/community/types';
import type {
  CommunityCategoryRepositoryContract,
  CommunityPostRepositoryContract,
  CommunityReplyRepositoryContract,
  PollVoteRepositoryContract,
} from '@/domain/community/CommunityRepositories';

type PageResult<T> = { items: T[]; nextCursor: unknown | null };

function byCreatedDesc<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export class DirectusCommunityCategoryRepository
  extends DirectusRepository<CommunityCategory>
  implements CommunityCategoryRepositoryContract
{
  constructor() {
    super('community_categories');
  }

  async listAll(): Promise<CommunityCategory[]> {
    const categories = await this.list('order', 'asc');
    return [...categories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }
}

export class DirectusCommunityPostRepository
  extends DirectusRepository<CommunityPost>
  implements CommunityPostRepositoryContract
{
  constructor() {
    super('community_posts');
  }

  async findGlobal(): Promise<CommunityPost[]> {
    const posts = await this.list('created_at', 'desc');
    return posts.filter(post => post.visibility.scope === 'global');
  }

  async findByModule(trackId: string, moduleId: string): Promise<CommunityPost[]> {
    const posts = await this.list('created_at', 'desc');
    return posts.filter(
      post =>
        post.visibility.scope === 'module' &&
        post.visibility.track_id === trackId &&
        post.visibility.module_id === moduleId,
    );
  }

  async findByLesson(trackId: string, lessonId: string): Promise<CommunityPost[]> {
    const posts = await this.list('created_at', 'desc');
    return posts.filter(
      post =>
        post.visibility.scope === 'lesson' &&
        post.visibility.track_id === trackId &&
        post.visibility.lesson_id === lessonId,
    );
  }

  async findByTrack(trackId: string): Promise<CommunityPost[]> {
    const posts = await this.list('created_at', 'desc');
    return posts.filter(
      post => post.visibility.scope === 'track' && post.visibility.track_id === trackId,
    );
  }

  async findAll(): Promise<CommunityPost[]> {
    return byCreatedDesc(await this.list());
  }

  findByUser(userId: string, limitCount = 20): Promise<CommunityPost[]> {
    return this.findManyWhere(
      { created_by: { _eq: userId } },
      { sort: '-created_at', limit: limitCount },
    );
  }

  async findByUserPaginated(
    userId: string,
    limitCount = 20,
    cursor?: unknown,
  ): Promise<PageResult<CommunityPost>> {
    const filters = {
      created_by: { _eq: userId },
      ...(cursor ? { created_at: { _lt: String(cursor) } } : {}),
    };
    const items = await this.findManyWhere(filters, { sort: '-created_at', limit: limitCount });
    return {
      items,
      nextCursor: items.length === limitCount ? items[items.length - 1].created_at : null,
    };
  }
}

export class DirectusCommunityReplyRepository
  extends DirectusRepository<CommunityReply>
  implements CommunityReplyRepositoryContract
{
  constructor() {
    super('community_replies');
  }

  findByPost(postId: string): Promise<CommunityReply[]> {
    return this.findManyBy({ post_id: postId }, 'created_at');
  }

  findByUser(userId: string, limitCount = 20): Promise<CommunityReply[]> {
    return this.findManyWhere(
      { created_by: { _eq: userId } },
      { sort: '-created_at', limit: limitCount },
    );
  }

  async findByUserPaginated(
    userId: string,
    limitCount = 20,
    cursor?: unknown,
  ): Promise<PageResult<CommunityReply>> {
    const filters = {
      created_by: { _eq: userId },
      ...(cursor ? { created_at: { _lt: String(cursor) } } : {}),
    };
    const items = await this.findManyWhere(filters, { sort: '-created_at', limit: limitCount });
    return {
      items,
      nextCursor: items.length === limitCount ? items[items.length - 1].created_at : null,
    };
  }
}

export class DirectusPollVoteRepository
  extends DirectusRepository<PollVote>
  implements PollVoteRepositoryContract
{
  constructor() {
    super('community_poll_votes');
  }

  async castVote(pollId: string, userId: string, optionId: string): Promise<PollVote> {
    const id = PollEntity.voteId(pollId, userId);
    const payload: PollVote = {
      id,
      poll_id: pollId,
      user_id: userId,
      option_id: optionId,
      voted_at: new Date().toISOString(),
    };
    const existing = await this.get(id);
    if (existing) return (await this.update(id, payload)) ?? payload;
    return this.create(payload);
  }

  findByUser(pollId: string, userId: string): Promise<PollVote | null> {
    return this.get(PollEntity.voteId(pollId, userId));
  }

  listByPoll(pollId: string): Promise<PollVote[]> {
    return this.findManyBy({ poll_id: pollId });
  }
}

export const directusCommunityCategoryRepository = new DirectusCommunityCategoryRepository();
export const directusCommunityPostRepository = new DirectusCommunityPostRepository();
export const directusCommunityReplyRepository = new DirectusCommunityReplyRepository();
export const directusPollVoteRepository = new DirectusPollVoteRepository();
