'use client';

import { useMemo, useState } from 'react';
import { MessageCircle, ChevronLeft, Pin, Lock, CornerDownRight, Reply } from 'lucide-react';
import { CommunityPost, CommunityReply, CommunityVisibility } from '@/domain/community/types';
import { RichContent } from '@/shared/components/RichContent';
import { useCommunityFeed } from '@/features/community/hooks/useCommunityFeed';
import { useCommunityPost } from '@/features/community/hooks/useCommunityPost';
import { PostComposer } from '@/features/community/components/PostComposer';
import { ReplyComposer } from '@/features/community/components/ReplyComposer';

interface ForumThreadProps {
  scope: CommunityVisibility;
  userId: string;
  userName: string;
  /** Se true, oculta o composer de novos tópicos (ex: role sem post:community). */
  canPost?: boolean;
}

export function ForumThread({ scope, userId, userName, canPost = true }: ForumThreadProps) {
  const [selected, setSelected] = useState<CommunityPost | null>(null);
  const { posts, loading, error, reload } = useCommunityFeed({ scope, kind: 'forum' });

  if (selected) {
    return (
      <ForumPostDetail
        post={selected}
        userId={userId}
        userName={userName}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {canPost && (
        <PostComposer
          kind="forum"
          visibility={scope}
          userId={userId}
          userName={userName}
          onCreated={() => reload()}
        />
      )}

      {loading && <div className="alert alert-info text-sm"><span>Carregando tópicos...</span></div>}
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {!loading && posts.length === 0 && (
        <div className="text-center py-8 text-base-content/60 text-sm">
          Nenhum tópico ainda. Seja o primeiro a abrir uma discussão.
        </div>
      )}

      <ul className="space-y-2">
        {posts.map(p => (
          <li key={p.id}>
            <button
              type="button"
              className="w-full text-left card bg-base-100 border border-base-300 hover:border-primary transition-colors"
              onClick={() => setSelected(p)}
            >
              <div className="card-body p-4 gap-1">
                <div className="flex items-center gap-2">
                  {p.is_pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                  {p.is_locked && <Lock className="w-3.5 h-3.5 text-base-content/50" />}
                  <h4 className="text-sm font-semibold text-base-content flex-1">{p.title}</h4>
                </div>
                <p className="text-xs text-base-content/60">
                  {p.created_by_name} · {new Date(p.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ReplyNode extends CommunityReply {
  children: ReplyNode[];
}

function buildReplyTree(replies: CommunityReply[]): ReplyNode[] {
  const byId = new Map<string, ReplyNode>();
  const roots: ReplyNode[] = [];
  for (const r of replies) byId.set(r.id, { ...r, children: [] });
  for (const node of byId.values()) {
    const parentId = node.parent_reply_id;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function ForumPostDetail({
  post,
  userId,
  userName,
  onBack,
}: {
  post: CommunityPost;
  userId: string;
  userName: string;
  onBack: () => void;
}) {
  const { post: fresh, replies, loading, error, reload } = useCommunityPost(post.id);
  const view = fresh ?? post;
  const tree = useMemo(() => buildReplyTree(replies), [replies]);

  return (
    <div className="space-y-4">
      <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={onBack}>
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>

      <article className="card bg-base-100 border border-base-300">
        <div className="card-body gap-2 p-4">
          <div className="flex items-center gap-2">
            {view.is_pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
            {view.is_locked && <Lock className="w-3.5 h-3.5 text-base-content/50" />}
            <h3 className="text-lg font-bold text-base-content flex-1">{view.title}</h3>
          </div>
          <p className="text-xs text-base-content/60">
            {view.created_by_name} · {new Date(view.created_at).toLocaleString('pt-BR')}
          </p>
          <RichContent markdown={view.body} />
        </div>
      </article>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-base-content/70">
          <MessageCircle className="w-4 h-4" />
          {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
        </div>

        {loading && <div className="text-sm text-base-content/60">Carregando...</div>}
        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        <ul className="space-y-2">
          {tree.map(node => (
            <ReplyTreeItem
              key={node.id}
              node={node}
              postId={view.id}
              userId={userId}
              userName={userName}
              locked={!!view.is_locked}
              depth={0}
              onReplied={() => reload()}
            />
          ))}
        </ul>

        {!view.is_locked && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 gap-2">
              <h4 className="text-sm font-semibold">Responder ao tópico</h4>
              <ReplyComposer
                postId={view.id}
                userId={userId}
                userName={userName}
                onReplied={() => reload()}
              />
            </div>
          </div>
        )}
        {view.is_locked && (
          <div className="alert alert-warning text-sm"><span>Discussão trancada — novas respostas desativadas.</span></div>
        )}
      </div>
    </div>
  );
}

function ReplyTreeItem({
  node,
  postId,
  userId,
  userName,
  locked,
  depth,
  onReplied,
}: {
  node: ReplyNode;
  postId: string;
  userId: string;
  userName: string;
  locked: boolean;
  depth: number;
  onReplied: () => void;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const indent = Math.min(depth, 5);

  return (
    <li style={{ marginLeft: indent * 16 }}>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-1 p-4">
          <div className="flex items-center gap-1 text-xs text-base-content/60">
            {depth > 0 && <CornerDownRight className="w-3.5 h-3.5" />}
            <span>{node.created_by_name} · {new Date(node.created_at).toLocaleString('pt-BR')}</span>
          </div>
          <RichContent markdown={node.body} />
          {!locked && (
            <div className="flex justify-end">
              <button
                type="button"
                className="btn btn-ghost btn-xs gap-1"
                onClick={() => setComposerOpen(v => !v)}
              >
                <Reply className="w-3.5 h-3.5" />
                {composerOpen ? 'Cancelar' : 'Responder'}
              </button>
            </div>
          )}
          {composerOpen && !locked && (
            <ReplyComposer
              postId={postId}
              parentReplyId={node.id}
              userId={userId}
              userName={userName}
              onReplied={() => {
                setComposerOpen(false);
                onReplied();
              }}
              onCancel={() => setComposerOpen(false)}
            />
          )}
        </div>
      </div>

      {node.children.length > 0 && (
        <ul className="space-y-2 mt-2">
          {node.children.map(child => (
            <ReplyTreeItem
              key={child.id}
              node={child}
              postId={postId}
              userId={userId}
              userName={userName}
              locked={locked}
              depth={depth + 1}
              onReplied={onReplied}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
