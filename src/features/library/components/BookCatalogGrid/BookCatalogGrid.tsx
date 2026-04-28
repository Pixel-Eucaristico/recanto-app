'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Lock, Pencil, BookMarked, Trash2, BookText, FileText } from 'lucide-react';
import { Book } from '@/domain/library/types';
import { HoverGallery } from '@/shared/components/HoverGallery';
import { BookExportButtons } from '@/features/library/components/BookExportButtons';
import { Tooltip } from '@/shared/components/Tooltip';
import { auth } from '@/domains/auth/services/firebaseClient';

interface BookCatalogGridProps {
  books: Book[];
  manager?: boolean;
  canDownload?: boolean;
  onEdit?: (book: Book) => void;
  onEditChapters?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export function BookCatalogGrid({ books, manager = false, canDownload = true, onEdit, onEditChapters, onDelete }: BookCatalogGridProps) {
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
        <BookCard
          key={book.id}
          book={book}
          manager={manager}
          canDownload={canDownload}
          onEdit={onEdit}
          onEditChapters={onEditChapters}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface BookCardProps {
  book: Book;
  manager?: boolean;
  canDownload?: boolean;
  onEdit?: (book: Book) => void;
  onEditChapters?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

async function getFreshToken(): Promise<string | undefined> {
  return auth.currentUser?.getIdToken(true);
}

async function downloadBook(bookId: string, bookTitle: string, format: 'epub' | 'pdf') {
  const token = await getFreshToken();
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`/api/library/${bookId}/${format}`, { headers });
  if (!res.ok) throw new Error(`Falha ao gerar ${format.toUpperCase()}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${bookTitle}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function BookCard({ book, manager, canDownload = true, onEdit, onEditChapters, onDelete }: BookCardProps) {
  const hasCover = !!book.cover_url;
  const hasBackCover = !!book.back_cover_url;
  const showGallery = hasCover && hasBackCover;

  return (
    // overflow-hidden REMOVIDO do wrapper — permite tooltip sair dos limites do card
    // overflow-hidden da imagem está na <figure> abaixo
    <div className="card bg-base-100 border border-base-300 hover:border-primary transition-colors group relative">
      <Link href={`/app/dashboard/library/${book.id}`} className="block">
        <figure className="aspect-[2/3] bg-base-200 relative overflow-hidden rounded-t-2xl">
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

      {/* Manager: botões de edição + download no mesmo cluster */}
      {manager && (
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
          {onEdit && (
            <Tooltip tip="Editar metadata" position="right">
              <button
                type="button"
                className="btn btn-circle btn-xs bg-base-100/90 hover:bg-primary hover:text-primary-content border-base-300"
                onClick={e => { e.preventDefault(); e.stopPropagation(); onEdit(book); }}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
          {onEditChapters && (
            <Tooltip tip="Editar capítulos" position="right">
              <button
                type="button"
                className="btn btn-circle btn-xs bg-base-100/90 hover:bg-primary hover:text-primary-content border-base-300"
                onClick={e => { e.preventDefault(); e.stopPropagation(); onEditChapters(book); }}
              >
                <BookMarked className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
          {canDownload && (
            <>
              <Tooltip tip="Baixar EPUB" position="right">
                <button
                  type="button"
                  className="btn btn-circle btn-xs bg-base-100/90 hover:bg-secondary hover:text-secondary-content border-base-300"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); downloadBook(book.id, book.title, 'epub'); }}
                >
                  <BookText className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              <Tooltip tip="Baixar PDF" position="right">
                <button
                  type="button"
                  className="btn btn-circle btn-xs bg-base-100/90 hover:bg-secondary hover:text-secondary-content border-base-300"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); downloadBook(book.id, book.title, 'pdf'); }}
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </>
          )}
          {onDelete && (
            <Tooltip tip="Remover livro" position="right">
              <button
                type="button"
                className="btn btn-circle btn-xs bg-base-100/90 hover:bg-error hover:text-error-content border-base-300"
                onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(book); }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
        </div>
      )}

      {/* Usuário normal com permissão de download: botões abaixo do card */}
      {!manager && canDownload && (
        <div className="px-3 pb-3 flex justify-end">
          <BookExportButtons
            bookId={book.id}
            bookTitle={book.title}
            truncated={false}
            visibleUntil={null}
          />
        </div>
      )}
    </div>
  );
}
