'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, MessageSquare } from 'lucide-react';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { communityReplyRepository } from '@/infrastructure/community/CommunityReplyRepository';
import { formatRelative } from '@/shared/utils/datetime';
import type { CommunityPost, CommunityReply } from '@/domain/community/types';

interface ForumActivityProps {
  userId: string;
}

interface Activity {
  kind: 'post' | 'reply';
  id: string;
  text: string;
  postId: string;
  createdAt: string;
  scopeLabel?: string;
}

export function ForumActivity({ userId }: ForumActivityProps) {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      communityPostRepository.findByUser(userId, 10).catch(() => [] as CommunityPost[]),
      communityReplyRepository.findByUser(userId, 10).catch(() => [] as CommunityReply[]),
    ]).then(([posts, replies]) => {
      if (cancelled) return;

      const myPosts: Activity[] = posts.map((p: CommunityPost) => ({
        kind: 'post' as const,
        id: p.id,
        text: p.title || p.body?.slice(0, 80) || '',
        postId: p.id,
        createdAt: p.created_at,
        scopeLabel: p.visibility?.scope ?? 'global',
      }));

      const myReplies: Activity[] = replies.map((r: CommunityReply) => ({
        kind: 'reply' as const,
        id: r.id,
        text: r.body?.slice(0, 80) ?? '',
        postId: r.post_id,
        createdAt: r.created_at,
      }));

      const merged = [...myPosts, ...myReplies]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5);

      setItems(merged);
    }).finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [userId]);

  if (loading || items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
          <MessageCircle className="w-4 h-4 text-accent" /> Fórum — sua participação
        </h2>
        <Link href="/app/dashboard/forum/my-activity" className="link link-hover text-xs">
          Ver tudo
        </Link>
      </div>

      <ul className="space-y-1">
        {items.map(item => (
          <li key={`${item.kind}_${item.id}`}>
            <Link
              href={`/app/dashboard/forum?post=${encodeURIComponent(item.postId)}`}
              className="card bg-base-100 border border-base-300 hover:border-accent block"
            >
              <div className="card-body p-2 sm:p-3 flex-row items-start gap-2">
                {item.kind === 'post' ? (
                  <MessageCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5 text-info shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-base-content/80 line-clamp-2">{item.text || '(sem texto)'}</p>
                  <p className="text-[10px] text-base-content/50 mt-0.5">
                    {item.kind === 'post' ? 'Post' : 'Resposta'} · {formatRelative(item.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

