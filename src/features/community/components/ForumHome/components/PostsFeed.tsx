'use client';

import { MessageSquare } from 'lucide-react';
import type { CommunityPost } from '@/domain/community/types';
import { QuickPoll } from '@/features/community/components/QuickPoll';

interface PostsFeedProps {
  posts: CommunityPost[];
  userId: string;
  canVote: boolean;
  onOpenPost: (p: CommunityPost) => void;
}

export function PostsFeed({ posts, userId, canVote, onOpenPost }: PostsFeedProps) {
  if (posts.length === 0) {
    return <div className="text-center py-6 text-base-content/60 text-sm">Nenhum post nessa categoria.</div>;
  }

  return (
    <ul className="space-y-2">
      {posts.map(p => {
        if (p.kind === 'poll') {
          return (
            <li key={p.id}>
              <QuickPoll post={p} userId={userId} canVote={canVote} />
            </li>
          );
        }
        return (
          <li key={p.id}>
            <button
              type="button"
              className="w-full text-left card bg-base-100 border border-base-300 hover:border-primary transition-colors"
              onClick={() => onOpenPost(p)}
            >
              <div className="card-body p-4 gap-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary/70" />
                  <h4 className="text-sm font-semibold text-base-content flex-1">{p.title}</h4>
                </div>
                <p className="text-xs text-base-content/60">
                  {p.created_by_name} · {new Date(p.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
