'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, FolderOpen, Library as LibraryIcon } from 'lucide-react';
import {
  BookList,
  BookForm,
  LibraryCategoryManager,
  ChapterListPanel,
  ChapterEditor,
  useBooksAdmin,
  useLibraryCatalog,
  useBookChapters,
  type BookFormState,
} from '@/features/library';
import { Book, BookChapter } from '@/domain/library/types';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

type View = 'list' | 'form' | 'categories' | 'chapters' | 'chapter-edit';

export default function AdminLibraryPage() {
  const user = useCurrentUser();
  const searchParams = useSearchParams();
  const { books, loading, error, saving, save, remove, reload } = useBooksAdmin();
  const { categories } = useLibraryCatalog({ onlyPublished: false });
  const [view, setView] = useState<View>('list');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [activeChapter, setActiveChapter] = useState<BookChapter | null>(null);
  const [deleteBookTarget, setDeleteBookTarget] = useState<Book | null>(null);
  const [deleteChapterTarget, setDeleteChapterTarget] = useState<BookChapter | null>(null);

  // Lê query string ?book=ID&view=form|chapters|categories e pré-seleciona
  useEffect(() => {
    const queryView = searchParams.get('view');
    const queryBook = searchParams.get('book');

    if (queryBook && books.length > 0) {
      const book = books.find(b => b.id === queryBook);
      if (book) setActiveBook(book);
    }

    if (queryView === 'form') setView('form');
    else if (queryView === 'chapters' && queryBook) setView('chapters');
    else if (queryView === 'categories') setView('categories');
  }, [searchParams, books]);

  const {
    chapters,
    loading: loadingChapters,
    saving: savingChapter,
    saveChapter,
    deleteChapter,
  } = useBookChapters(activeBook?.id ?? null);

  if (!user) return <div className="p-6">Faça login.</div>;

  const canManage = user.role === 'admin' || user.features.includes('manage:library') || user.features.includes('*');
  if (!canManage) {
    return (
      <div className="p-6">
        <div className="alert alert-error"><span>Sem permissão pra gerenciar a biblioteca.</span></div>
      </div>
    );
  }

  async function handleSaveBook(form: BookFormState) {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const year = form.year ? Number(form.year) : undefined;
    await save({
      id: form.id,
      title: form.title,
      subtitle: form.subtitle || undefined,
      author: form.author || undefined,
      language: form.language,
      description: form.description || undefined,
      cover_url: form.cover_url || undefined,
      back_cover_url: form.back_cover_url || undefined,
      category_ids: form.category_ids,
      tags,
      isbn: form.isbn || undefined,
      edition: form.edition || undefined,
      year,
      is_published: form.is_published,
      spoiler_mode: form.spoiler_mode,
      created_by: form.created_by,
    });
    setView('list');
    setActiveBook(null);
  }

  async function confirmDeleteBook() {
    if (!deleteBookTarget) return;
    await remove(deleteBookTarget.id);
    setDeleteBookTarget(null);
  }

  async function handleSaveChapter(input: { book_id: string; order: number; title: string; subtitle?: string; blocks: BookChapter['blocks'] }) {
    await saveChapter(input);
    setView('chapters');
    setActiveChapter(null);
  }

  async function confirmDeleteChapter() {
    if (!deleteChapterTarget) return;
    await deleteChapter(deleteChapterTarget.order);
    setDeleteChapterTarget(null);
  }

  function backToList() {
    setView('list');
    setActiveBook(null);
    setActiveChapter(null);
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 space-y-4 md:space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/app/dashboard/library" className="btn btn-ghost btn-sm gap-1">
            <ArrowLeft className="w-4 h-4" /> Catálogo
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <LibraryIcon className="w-6 h-6 text-primary" />
            <h1 className="text-lg md:text-xl font-bold">Gerenciar biblioteca</h1>
          </div>
          {view === 'list' && (
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => setView('categories')}
            >
              <FolderOpen className="w-4 h-4" /> Categorias
            </button>
          )}
        </div>
      </header>

      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-4 md:p-6">
        {loading && view === 'list' && <div className="alert alert-info text-sm"><span>Carregando...</span></div>}
        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        {view === 'list' && !loading && (
          <BookList
            books={books}
            onCreate={() => { setActiveBook(null); setView('form'); }}
            onEdit={b => { setActiveBook(b); setView('form'); }}
            onEditChapters={b => { setActiveBook(b); setView('chapters'); }}
            onDelete={b => setDeleteBookTarget(b)}
          />
        )}

        {view === 'form' && (
          <BookForm
            book={activeBook}
            categories={categories}
            saving={saving}
            userId={user.id}
            onSave={handleSaveBook}
            onCancel={backToList}
          />
        )}

        {view === 'categories' && (
          <LibraryCategoryManager onClose={() => { setView('list'); reload(); }} />
        )}

        {view === 'chapters' && activeBook && (
          <div className="space-y-4">
            <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={backToList}>
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-4">
                <h3 className="text-base font-semibold">{activeBook.title}</h3>
                {activeBook.author && <p className="text-xs text-base-content/60">{activeBook.author}</p>}
              </div>
            </div>
            {loadingChapters ? (
              <div className="alert alert-info text-sm"><span>Carregando capítulos...</span></div>
            ) : (
              <ChapterListPanel
                chapters={chapters}
                onCreate={() => { setActiveChapter(null); setView('chapter-edit'); }}
                onEdit={c => { setActiveChapter(c); setView('chapter-edit'); }}
                onDelete={c => setDeleteChapterTarget(c)}
              />
            )}
          </div>
        )}

        {view === 'chapter-edit' && activeBook && (
          <div className="space-y-4">
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => { setView('chapters'); setActiveChapter(null); }}
            >
              <ArrowLeft className="w-4 h-4" /> Capítulos de {activeBook.title}
            </button>
            <ChapterEditor
              bookId={activeBook.id}
              chapter={activeChapter}
              defaultOrder={chapters.length + 1}
              saving={savingChapter}
              onSave={handleSaveChapter}
              onCancel={() => { setView('chapters'); setActiveChapter(null); }}
            />
          </div>
        )}
      </div>

      {deleteBookTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Remover livro</h3>
            <p className="text-sm text-base-content/70 mb-3">
              Remover <strong>{deleteBookTarget.title}</strong>? Capítulos e referências em aulas serão perdidos.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteBookTarget(null)}>Cancelar</button>
              <button className="btn btn-error btn-sm" onClick={confirmDeleteBook}>Remover</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteBookTarget(null)} />
        </div>
      )}

      {deleteChapterTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Remover capítulo</h3>
            <p className="text-sm text-base-content/70 mb-3">
              Remover capítulo <strong>{deleteChapterTarget.order} — {deleteChapterTarget.title}</strong>?
              Os blocos e referências canônicas desse capítulo serão perdidos.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteChapterTarget(null)}>Cancelar</button>
              <button className="btn btn-error btn-sm" onClick={confirmDeleteChapter}>Remover</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteChapterTarget(null)} />
        </div>
      )}
    </div>
  );
}
