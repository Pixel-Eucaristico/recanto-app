'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, MessageSquare, Search, Loader2 } from 'lucide-react';
import { BackButton } from '@/shared/components/BackButton';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { communityReplyRepository } from '@/infrastructure/community/CommunityReplyRepository';
import type { CommunityPost, CommunityReply } from '@/domain/community/types';

const PAGE_SIZE = 20;

type Tab = 'all' | 'posts' | 'replies';

interface Item {
  kind: 'post' | 'reply';
  id: string;
  postId: string;
  text: string;
  createdAt: string;
  scopeLabel?: string;
}

export default function MyForumActivityPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postCursor, setPostCursor] = useState<string | null>(null);
  const [postDone, setPostDone] = useState(false);

  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [replyCursor, setReplyCursor] = useState<string | null>(null);
  const [replyDone, setReplyDone] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega primeira página
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      communityPostRepository.findByUserPaginated(user.id, PAGE_SIZE, null),
      communityReplyRepository.findByUserPaginated(user.id, PAGE_SIZE, null),
    ]).then(([p, r]) => {
      setPosts(p.items);
      setPostCursor(p.nextCursor);
      setPostDone(p.nextCursor === null);
      setReplies(r.items);
      setReplyCursor(r.nextCursor);
      setReplyDone(r.nextCursor === null);
    }).catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [user?.id]);

  async function loadMorePosts() {
    if (!user || postDone || loading) return;
    setLoading(true);
    try {
      const res = await communityPostRepository.findByUserPaginated(user.id, PAGE_SIZE, postCursor);
      setPosts(prev => [...prev, ...res.items]);
      setPostCursor(res.nextCursor);
      setPostDone(res.nextCursor === null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreReplies() {
    if (!user || replyDone || loading) return;
    setLoading(true);
    try {
      const res = await communityReplyRepository.findByUserPaginated(user.id, PAGE_SIZE, replyCursor);
      setReplies(prev => [...prev, ...res.items]);
      setReplyCursor(res.nextCursor);
      setReplyDone(res.nextCursor === null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const items: Item[] = useMemo(() => {
    const list: Item[] = [];
    if (tab === 'all' || tab === 'posts') {
      for (const p of posts) {
        list.push({
          kind: 'post',
          id: p.id,
          postId: p.id,
          text: p.title || p.body?.slice(0, 200) || '',
          createdAt: p.created_at,
          scopeLabel: p.visibility?.scope ?? 'global',
        });
      }
    }
    if (tab === 'all' || tab === 'replies') {
      for (const r of replies) {
        list.push({
          kind: 'reply',
          id: r.id,
          postId: r.post_id,
          text: r.body?.slice(0, 200) ?? '',
          createdAt: r.created_at,
        });
      }
    }
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(i => i.text.toLowerCase().includes(q));
  }, [tab, posts, replies, search]);

  const showLoadMorePosts = (tab === 'posts' || tab === 'all') && !postDone;
  const showLoadMoreReplies = (tab === 'replies' || tab === 'all') && !replyDone;

  if (!user) return <div className="p-6">Faça login.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref="/app/dashboard/journey" />
          <h1 className="text-base sm:text-lg font-bold">Minha participação no fórum</h1>
        </div>

        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-3 gap-2">
            <div className="join w-full">
              <input
                type="text"
                placeholder="Buscar nos meus posts e respostas..."
                className="input input-bordered input-sm join-item flex-1"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="btn btn-sm btn-ghost join-item" tabIndex={-1}>
                <Search className="w-4 h-4" />
              </button>
            </div>

            <div role="tablist" className="tabs tabs-bordered">
              <button
                role="tab"
                className={`tab tab-sm ${tab === 'all' ? 'tab-active' : ''}`}
                onClick={() => setTab('all')}
              >Tudo</button>
              <button
                role="tab"
                className={`tab tab-sm ${tab === 'posts' ? 'tab-active' : ''}`}
                onClick={() => setTab('posts')}
              >Posts ({posts.length}{postDone ? '' : '+'})</button>
              <button
                role="tab"
                className={`tab tab-sm ${tab === 'replies' ? 'tab-active' : ''}`}
                onClick={() => setTab('replies')}
              >Respostas ({replies.length}{replyDone ? '' : '+'})</button>
            </div>
          </div>
        </div>

        {items.length === 0 && !loading && (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body p-6 text-center gap-1">
              <p className="text-sm text-base-content/60">
                {search.trim() ? 'Nada encontrado pra essa busca.' : 'Você ainda não participou do fórum.'}
              </p>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {items.map(item => (
            <li key={`${item.kind}_${item.id}`}>
              <Link
                href={`/app/dashboard/forum?post=${encodeURIComponent(item.postId)}`}
                className="card bg-base-100 border border-base-300 hover:border-accent block"
              >
                <div className="card-body p-3 flex-row items-start gap-2">
                  {item.kind === 'post' ? (
                    <MessageCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-info shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-base-content line-clamp-3">{item.text || '(sem texto)'}</p>
                    <p className="text-[11px] text-base-content/50 mt-1">
                      {item.kind === 'post' ? 'Post' : 'Resposta'}
                      {item.scopeLabel && ` · escopo: ${item.scopeLabel}`}
                      {' · '}{formatRelative(item.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 justify-center">
          {showLoadMorePosts && (
            <button
              className="btn btn-sm btn-outline gap-1"
              onClick={loadMorePosts}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Carregar mais posts
            </button>
          )}
          {showLoadMoreReplies && (
            <button
              className="btn btn-sm btn-outline gap-1"
              onClick={loadMoreReplies}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Carregar mais respostas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `${days} dias atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
