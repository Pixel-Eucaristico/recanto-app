'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Highlighter, MessageCircle } from 'lucide-react';
import { bookHighlightRepository } from '@/infrastructure/library/BookHighlightRepository';
import { bookCommentRepository } from '@/infrastructure/library/BookCommentRepository';
import { formatRelative } from '@/shared/utils/datetime';
import type { BookHighlight, BookComment } from '@/domain/library/types';

interface RecentAnnotationsProps {
  userId: string;
}

type Item = (BookHighlight | BookComment) & { _kind: 'highlight' | 'comment' };

export function RecentAnnotations({ userId }: RecentAnnotationsProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      bookHighlightRepository.findByUser(userId).catch(() => []),
      bookCommentRepository.findByUser(userId).catch(() => []),
    ]).then(([highlights, comments]) => {
      if (cancelled) return;
      const sevenDaysAgo = Date.now() - 7 * 86400000;
      const merged: Item[] = [
        ...highlights.map(h => ({ ...h, _kind: 'highlight' as const })),
        ...comments.map(c => ({ ...c, _kind: 'comment' as const })),
      ]
        .filter(i => new Date(i.created_at).getTime() >= sevenDaysAgo)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 5);
      setItems(merged);
    }).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [userId]);

  if (loading || items.length === 0) return null;

  return (
    <section>
      <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1 mb-2">
        <Highlighter className="w-4 h-4 text-warning" /> Anotações recentes
      </h2>

      <ul className="space-y-1">
        {items.map(item => (
          <li key={`${item._kind}_${item.id}`}>
            <Link
              href={`/app/dashboard/library/${item.book_id}?ref=${encodeURIComponent(item.ref)}`}
              className="card bg-base-100 border border-base-300 hover:border-warning"
            >
              <div className="card-body p-2 sm:p-3 flex-row items-start gap-2">
                {item._kind === 'highlight' ? (
                  <Highlighter className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5 text-info shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-base-content/80 line-clamp-2">
                    {item._kind === 'highlight' ? (item as BookHighlight).selected_text ?? '(highlight)' : (item as BookComment).text}
                  </p>
                  <p className="text-[10px] text-base-content/50 mt-0.5">
                    Ref {item.ref} · {formatRelative(item.created_at)}
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

