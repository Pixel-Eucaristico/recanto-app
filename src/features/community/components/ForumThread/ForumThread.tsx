'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, Pin, Lock, MessageSquare, Heart, MessageCircle, BarChart3 } from 'lucide-react';
import { CommunityPost, CommunityVisibility } from '@/domain/community/types';
import { useCommunityFeed } from '@/features/community/hooks/useCommunityFeed';
import { PostComposer } from '@/features/community/components/PostComposer';
import { PollComposer } from '@/features/community/components/PollComposer';
import { WallPostCard } from '@/features/community/components/WallPostCard';
import { QuickPoll } from '@/features/community/components/QuickPoll';

interface ForumThreadProps {
  scope: CommunityVisibility;
  userId: string;
  userName: string;
  canPost?: boolean;
  canComment?: boolean;
  canVote?: boolean;
  /** Abre composer (forum/poll) automaticamente quando mudar. */
  autoOpenComposer?: 'forum' | 'poll';
  /** Incrementar pra reabrir composer mesmo se autoOpenComposer já tava setado. */
  autoOpenKey?: number;
}

type ComposerMode = 'closed' | 'forum' | 'poll';

export function ForumThread({
  scope, userId, userName,
  canPost = true, canComment = true, canVote = true,
  autoOpenComposer, autoOpenKey,
}: ForumThreadProps) {
  const [selected, setSelected] = useState<CommunityPost | null>(null);
  const [composer, setComposer] = useState<ComposerMode>('closed');
  const { posts, loading, error, reload } = useCommunityFeed({ scope, kind: ['forum', 'wall', 'poll'] });

  useEffect(() => {
    if (autoOpenComposer && autoOpenKey !== undefined && autoOpenKey > 0) {
      setComposer(autoOpenComposer);
      setSelected(null);
    }
  }, [autoOpenComposer, autoOpenKey]);

  if (selected) {
    return (
      <div className="space-y-4">
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setSelected(null)}>
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <WallPostCard
          post={selected}
          userId={userId}
          userName={userName}
          canComment={canComment}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canPost && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn btn-sm gap-1 ${composer === 'forum' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setComposer(composer === 'forum' ? 'closed' : 'forum')}
            >
              <MessageSquare className="w-4 h-4" /> Novo tópico
            </button>
            <button
              type="button"
              className={`btn btn-sm gap-1 ${composer === 'poll' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setComposer(composer === 'poll' ? 'closed' : 'poll')}
            >
              <BarChart3 className="w-4 h-4" /> Nova enquete
            </button>
          </div>
          {composer === 'forum' && (
            <PostComposer
              kind="forum"
              visibility={scope}
              userId={userId}
              userName={userName}
              onCreated={() => { setComposer('closed'); reload(); }}
            />
          )}
          {composer === 'poll' && (
            <PollComposer
              visibility={scope}
              userId={userId}
              userName={userName}
              onCreated={() => { setComposer('closed'); reload(); }}
            />
          )}
        </div>
      )}

      {loading && <div className="alert alert-info text-sm"><span>Carregando...</span></div>}
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {!loading && posts.length === 0 && (
        <div className="text-center py-8 text-base-content/60 text-sm">
          Nenhum conteúdo ainda. Seja o primeiro a abrir uma discussão.
        </div>
      )}

      <ul className="space-y-2">
        {posts.map(p => {
          if (p.kind === 'poll') {
            return (
              <li key={p.id}>
                <QuickPoll post={p} userId={userId} canVote={canVote} />
              </li>
            );
          }
          const Icon = p.kind === 'wall' ? Heart : MessageSquare;
          return (
            <li key={p.id}>
              <button
                type="button"
                className="w-full text-left card bg-base-100 border border-base-300 hover:border-primary transition-colors"
                onClick={() => setSelected(p)}
              >
                <div className="card-body p-4 gap-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary/70" />
                    {p.is_pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                    {p.is_locked && <Lock className="w-3.5 h-3.5 text-base-content/50" />}
                    <h4 className="text-sm font-semibold text-base-content flex-1">{p.title}</h4>
                    <span className={`badge badge-xs ${p.kind === 'wall' ? 'badge-secondary' : 'badge-ghost'}`}>
                      {p.kind === 'wall' ? 'Mural' : 'Fórum'}
                    </span>
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
    </div>
  );
}
