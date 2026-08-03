import type {
  CommunityCategory,
  CommunityPost,
  CommunityReply,
  PollVote,
} from './types';
import type { Repository } from '@/domain/shared/Repository';

export interface CommunityCategoryRepositoryContract extends Repository<CommunityCategory> {
  listAll(): Promise<CommunityCategory[]>;
}

export interface CommunityPostRepositoryContract extends Repository<CommunityPost> {
  findGlobal(): Promise<CommunityPost[]>;
  findByModule(trackId: string, moduleId: string): Promise<CommunityPost[]>;
  findByLesson(trackId: string, lessonId: string): Promise<CommunityPost[]>;
  findByTrack(trackId: string): Promise<CommunityPost[]>;
  findAll(): Promise<CommunityPost[]>;
  findByUser(userId: string, limitCount?: number): Promise<CommunityPost[]>;
  findByUserPaginated(
    userId: string,
    limitCount?: number,
    cursor?: unknown,
  ): Promise<{ items: CommunityPost[]; nextCursor: unknown | null }>;
}

export interface CommunityReplyRepositoryContract extends Repository<CommunityReply> {
  findByPost(postId: string): Promise<CommunityReply[]>;
  findByUser(userId: string, limitCount?: number): Promise<CommunityReply[]>;
  findByUserPaginated(
    userId: string,
    limitCount?: number,
    cursor?: unknown,
  ): Promise<{ items: CommunityReply[]; nextCursor: unknown | null }>;
}

export interface PollVoteRepositoryContract {
  castVote(pollId: string, userId: string, optionId: string): Promise<PollVote>;
  findByUser(pollId: string, userId: string): Promise<PollVote | null>;
  listByPoll(pollId: string): Promise<PollVote[]>;
}
