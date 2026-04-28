'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, BookOpen } from 'lucide-react';
import type { LastActivity } from '../../hooks/useJourneyData';

interface ContinueCardProps {
  lastActivity: LastActivity;
}

export function ContinueCard({ lastActivity }: ContinueCardProps) {
  if (lastActivity.kind === 'lesson') {
    const { lesson, track } = lastActivity;
    const href = track
      ? `/app/dashboard/formation/${track.id}/${lesson.id}`
      : `/app/dashboard/formation`;
    return (
      <Link href={href} className="block">
        <div className="card bg-base-100 border border-primary/30 hover:border-primary transition-colors">
          <div className="card-body p-3 sm:p-4 flex-row gap-3 items-center">
            {lesson.thumbnail_url ? (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-base-200">
                <Image src={lesson.thumbnail_url} alt={lesson.title} fill className="object-cover" sizes="80px" />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                <Play className="w-7 h-7 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary font-medium uppercase">Continue aula</p>
              <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mt-0.5">{lesson.title}</h3>
              {track && (
                <p className="text-xs text-base-content/60 mt-0.5 truncate">{track.title}</p>
              )}
            </div>
            <Play className="w-5 h-5 text-primary shrink-0" />
          </div>
        </div>
      </Link>
    );
  }

  // book
  const { book } = lastActivity;
  return (
    <Link href={`/app/dashboard/library/${book.book_id}`} className="block">
      <div className="card bg-base-100 border border-secondary/30 hover:border-secondary transition-colors">
        <div className="card-body p-3 sm:p-4 flex-row gap-3 items-center">
          {book.book_cover_url ? (
            <div className="relative w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-base-200">
              <Image src={book.book_cover_url} alt={book.book_title ?? ''} fill className="object-cover" sizes="80px" />
            </div>
          ) : (
            <div className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-lg bg-secondary/10 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-secondary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-secondary font-medium uppercase">Continue leitura</p>
            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mt-0.5">{book.book_title ?? 'Livro'}</h3>
            {book.last_ref && (
              <p className="text-xs text-base-content/60 mt-0.5">Capítulo {book.last_ref}</p>
            )}
            <progress className="progress progress-secondary w-full h-1 mt-1" value={book.percent} max={100} />
          </div>
          <BookOpen className="w-5 h-5 text-secondary shrink-0" />
        </div>
      </div>
    </Link>
  );
}
