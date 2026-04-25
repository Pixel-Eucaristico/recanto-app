'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Lock } from 'lucide-react';
import { Book } from '@/domain/library/types';
import { HoverGallery } from '@/shared/components/HoverGallery';

interface BookCatalogGridProps {
  books: Book[];
}

export function BookCatalogGrid({ books }: BookCatalogGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12 text-base-content/60">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Nenhum livro encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  const hasCover = !!book.cover_url;
  const hasBackCover = !!book.back_cover_url;
  const showGallery = hasCover && hasBackCover;

  return (
    <Link
      href={`/app/dashboard/library/${book.id}`}
      className="card bg-base-100 border border-base-300 hover:border-primary transition-colors overflow-hidden group"
    >
      <figure className="aspect-[2/3] bg-base-200 relative overflow-hidden">
        {showGallery ? (
          <HoverGallery
            images={[
              { src: book.cover_url!, alt: `${book.title} — capa` },
              { src: book.cover_url!, alt: `${book.title} — capa` },
              { src: book.back_cover_url!, alt: `${book.title} — contracapa` },
            ]}
          />
        ) : hasCover ? (
          <Image
            src={book.cover_url!}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4 text-center">
            <BookOpen className="w-10 h-10 text-primary/60 mb-2" />
            <p className="text-sm font-semibold text-base-content line-clamp-3">{book.title}</p>
          </div>
        )}
        {!book.is_published && (
          <span className="absolute top-2 right-2 badge badge-warning gap-1 badge-sm z-10">
            <Lock className="w-3 h-3" /> Rascunho
          </span>
        )}
        {book.spoiler_mode === 'progressive' && (
          <span className="absolute bottom-2 left-2 badge badge-info badge-xs z-10">progressivo</span>
        )}
        {showGallery && (
          <span className="absolute bottom-2 right-2 badge badge-ghost badge-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            passe o cursor
          </span>
        )}
      </figure>
      <div className="card-body p-3 gap-1">
        <h3 className="text-sm font-semibold text-base-content line-clamp-2">{book.title}</h3>
        {book.author && (
          <p className="text-xs text-base-content/60 line-clamp-1">{book.author}</p>
        )}
        {book.year && (
          <p className="text-xs text-base-content/40">{book.year}</p>
        )}
      </div>
    </Link>
  );
}
