'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Library, BookOpen } from 'lucide-react';
import type { BookReadingProgress } from '@/domain/library/types';

interface BookShelfProps {
  books: BookReadingProgress[];
}

export function BookShelf({ books }: BookShelfProps) {
  if (books.length === 0) return null;

  // Sort: lendo (in progress) > recentes
  const sorted = [...books].sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
          <Library className="w-4 h-4 text-secondary" /> Estante
        </h2>
        <Link href="/app/dashboard/library/history" className="link link-hover text-xs">
          Ver tudo
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-thin">
        {sorted.map(b => {
          const status: 'reading' | 'done' | 'wish' = b.percent >= 100 ? 'done' : b.percent > 0 ? 'reading' : 'wish';
          return (
            <Link
              key={b.id}
              href={`/app/dashboard/library/${b.book_id}`}
              className="snap-start shrink-0 w-28 sm:w-32 group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-base-200 border border-base-300 group-hover:border-secondary">
                {b.book_cover_url ? (
                  <Image src={b.book_cover_url} alt={b.book_title ?? ''} fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-primary/20">
                    <BookOpen className="w-8 h-8 text-secondary/60" />
                  </div>
                )}
                <span className={`absolute top-1 right-1 badge badge-xs ${
                  status === 'done' ? 'badge-success' : status === 'reading' ? 'badge-info' : 'badge-ghost'
                }`}>
                  {status === 'done' ? '✓' : status === 'reading' ? `${b.percent}%` : 'novo'}
                </span>
              </div>
              <p className="text-xs font-semibold mt-1 line-clamp-2">{b.book_title ?? 'Livro'}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
