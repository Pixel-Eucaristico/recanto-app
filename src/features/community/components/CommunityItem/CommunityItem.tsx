'use client';

import { CommunityPost } from '@/domain/community/types';
import { WallPostCard } from '@/features/community/components/WallPostCard';
import { QuickPoll } from '@/features/community/components/QuickPoll';

interface CommunityItemProps {
  post: CommunityPost;
  userId: string;
  userName: string;
  canComment?: boolean;
  canVote?: boolean;
}

/**
 * Renderer unificado — escolhe o componente certo pelo `kind`.
 * Usado por ForumThread, SharingWall e PollList pra mostrar tudo misturado.
 */
export function CommunityItem({ post, userId, userName, canComment = true, canVote = true }: CommunityItemProps) {
  if (post.kind === 'poll') {
    return <QuickPoll post={post} userId={userId} canVote={canVote} />;
  }
  return <WallPostCard post={post} userId={userId} userName={userName} canComment={canComment} />;
}
