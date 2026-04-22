'use client';

import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { CommunityPost } from '@/domain/community/types';
import { RichContent } from '@/shared/components/RichContent';
import { useCommunityPost } from '@/features/community/hooks/useCommunityPost';
import { ReplyComposer } from '@/features/community/components/ReplyComposer';

interface WallPostCardProps {
  post: CommunityPost;
  userId: string;
  userName: string;
  canComment?: boolean;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

export function WallPostCard({ post, userId, userName, canComment = true }: WallPostCardProps) {
  const { replies, reload } = useCommunityPost(post.id);
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <article className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10">
              <span className="text-sm font-bold">{initials(post.created_by_name)}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Heart className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-base-content">{post.title}</h3>
            </div>
            <p className="text-xs text-base-content/60">
              {post.created_by_name} · {new Date(post.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        <RichContent markdown={post.body} />

        <div className="divider my-0" />

        <div className="flex items-center justify-between">
          <span className="text-xs text-base-content/70 flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {replies.length} {replies.length === 1 ? 'comentário' : 'comentários'}
          </span>
          {canComment && !post.is_locked && (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setComposerOpen(v => !v)}
            >
              {composerOpen ? 'Cancelar' : 'Comentar'}
            </button>
          )}
        </div>

        {replies.length > 0 && (
          <ul className="space-y-2">
            {replies.map(r => (
              <li key={r.id} className="bg-base-200 rounded-lg p-3">
                <p className="text-xs text-base-content/60 mb-1">
                  {r.created_by_name} · {new Date(r.created_at).toLocaleString('pt-BR')}
                </p>
                <RichContent markdown={r.body} className="text-sm" />
              </li>
            ))}
          </ul>
        )}

        {composerOpen && canComment && !post.is_locked && (
          <ReplyComposer
            postId={post.id}
            userId={userId}
            userName={userName}
            onReplied={() => {
              setComposerOpen(false);
              reload();
            }}
            onCancel={() => setComposerOpen(false)}
          />
        )}
      </div>
    </article>
  );
}
