import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { communityReplyRepository } from '@/infrastructure/community/CommunityReplyRepository';
import { pollVoteRepository } from '@/infrastructure/community/PollVoteRepository';
import { CommunityPost, CommunityReply, CommunityVisibility, PollOption, PollTally } from '@/domain/community/types';
import { CommunityPostEntity } from '@/domain/community/entities/CommunityPost';
import { PollEntity } from '@/domain/community/entities/Poll';

export interface CreatePostInput {
  kind: CommunityPost['kind'];
  title: string;
  body: string;
  visibility: CommunityVisibility;
  poll_options?: PollOption[];
  poll_closes_at?: string;
  created_by: string;
  created_by_name: string;
}

export class CommunityService {
  async listByScope(scope: CommunityVisibility): Promise<CommunityPost[]> {
    if (scope.scope === 'global') return communityPostRepository.findGlobal();
    if (scope.scope === 'track') return communityPostRepository.findByTrack(scope.track_id);
    if (scope.scope === 'module') return communityPostRepository.findByModule(scope.track_id, scope.module_id);
    return communityPostRepository.findByLesson(scope.track_id, scope.lesson_id);
  }

  async createPost(input: CreatePostInput): Promise<CommunityPost> {
    const now = new Date().toISOString();
    const draft: CommunityPost = {
      id: '',
      kind: input.kind,
      title: input.title.trim(),
      body: input.body.trim(),
      visibility: input.visibility,
      poll_options: input.kind === 'poll' ? input.poll_options : undefined,
      poll_closes_at: input.kind === 'poll' ? input.poll_closes_at : undefined,
      is_pinned: false,
      is_locked: false,
      created_by: input.created_by,
      created_by_name: input.created_by_name,
      created_at: now,
    };
    const errors = CommunityPostEntity.validate(draft);
    if (errors.length > 0) throw new Error(errors.join(' '));
    const { id: _id, ...payload } = draft;
    return communityPostRepository.create(payload);
  }

  async reply(
    postId: string,
    body: string,
    userId: string,
    userName: string,
    parentReplyId?: string,
  ): Promise<CommunityReply> {
    const trimmed = body.trim();
    if (trimmed.length === 0) throw new Error('Resposta vazia.');
    const { id: _id, ...payload } = {
      id: '',
      post_id: postId,
      body: trimmed,
      parent_reply_id: parentReplyId,
      created_by: userId,
      created_by_name: userName,
      created_at: new Date().toISOString(),
    } as CommunityReply;
    return communityReplyRepository.create(payload);
  }

  async listReplies(postId: string): Promise<CommunityReply[]> {
    return communityReplyRepository.findByPost(postId);
  }

  async castVote(pollId: string, userId: string, optionId: string): Promise<void> {
    const post = await communityPostRepository.get(pollId);
    if (!post) throw new Error('Enquete não encontrada.');
    if (post.kind !== 'poll') throw new Error('Post não é uma enquete.');
    if (PollEntity.isClosed(post)) throw new Error('Enquete encerrada.');
    const valid = (post.poll_options ?? []).some(o => o.id === optionId);
    if (!valid) throw new Error('Opção inválida.');
    await pollVoteRepository.castVote(pollId, userId, optionId);
  }

  async getTally(pollId: string): Promise<{ post: CommunityPost; tally: PollTally[]; userVote: string | null }> {
    const post = await communityPostRepository.get(pollId);
    if (!post || post.kind !== 'poll') throw new Error('Enquete não encontrada.');
    const votes = await pollVoteRepository.listByPoll(pollId);
    const tally = PollEntity.tally(post.poll_options ?? [], votes);
    return { post, tally, userVote: null };
  }

  async getUserVote(pollId: string, userId: string): Promise<string | null> {
    const v = await pollVoteRepository.findByUser(pollId, userId);
    return v?.option_id ?? null;
  }
}

export const communityService = new CommunityService();
