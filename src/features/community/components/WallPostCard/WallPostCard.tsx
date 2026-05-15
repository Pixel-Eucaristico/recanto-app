'use client';

import { useMemo, useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import type { CommunityPost, CommunityReply } from '@/domain/community/types';
import { RichContent } from '@/shared/components/RichContent';
import { useCommunityPost } from '@/features/community/hooks/useCommunityPost';
import { ReplyComposer } from '@/features/community/components/ReplyComposer';
import { WallCommentItem, type ReplyNode } from './components/WallCommentItem';

interface WallPostCardProps {
  post: CommunityPost;
  userId: string;
  userName: string;
  canComment?: boolean;
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
}

function buildReplyTree(replies: CommunityReply[]): ReplyNode[] {
  const byId = new Map<string, ReplyNode>();
  const roots: ReplyNode[] = [];
  for (const r of replies) byId.set(r.id, { ...r, children: [] });
  for (const node of byId.values()) {
    const parentId = node.parent_reply_id;
    if (parentId && byId.has(parentId)) byId.get(parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export function WallPostCard({ post, userId, userName, canComment = true }: WallPostCardProps) {
  const { replies, reload } = useCommunityPost(post.id);
  const [composerOpen, setComposerOpen] = useState(false);
  const tree = useMemo(() => buildReplyTree(replies), [replies]);

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
              <span className={`badge badge-xs ${post.kind === 'wall' ? 'badge-secondary' : 'badge-ghost'}`}>
                {post.kind === 'wall' ? 'Mural' : 'Fórum'}
              </span>
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
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setComposerOpen(v => !v)}>
              {composerOpen ? 'Cancelar' : 'Comentar'}
            </button>
          )}
        </div>

        {tree.length > 0 && (
          <ul className="space-y-2">
            {tree.map(node => (
              <WallCommentItem
                key={node.id}
                node={node}
                postId={post.id}
                userId={userId}
                userName={userName}
                locked={!!post.is_locked}
                canComment={canComment}
                depth={0}
                onReplied={reload}
              />
            ))}
          </ul>
        )}

        {composerOpen && canComment && !post.is_locked && (
          <ReplyComposer
            postId={post.id}
            userId={userId}
            userName={userName}
            onReplied={() => { setComposerOpen(false); reload(); }}
            onCancel={() => setComposerOpen(false)}
          />
        )}
      </div>
    </article>
  );
}
