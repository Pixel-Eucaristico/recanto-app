'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, FolderOpen, Library as LibraryIcon } from 'lucide-react';
import { BookList, BookEpubImportModal, BookForm, LibraryCategoryManager, ChapterListPanel, ChapterEditor } from '@/features/library';
import { useAccess } from '@/shared/hooks/useAccess';
import { useAdminLibraryPage } from './_useAdminLibraryPage';

export default function AdminLibraryPage() {
  const { user, can } = useAccess();
  const [importOpen, setImportOpen] = useState(false);
  const {
    view, setView,
    activeBook, setActiveBook,
    activeChapter, setActiveChapter,
    deleteBookTarget, setDeleteBookTarget,
    deleteChapterTarget, setDeleteChapterTarget,
    books, loading, error, saving, categories, reload,
    chapters, loadingChapters, savingChapter,
    handleSaveBook, confirmDeleteBook,
    handleSaveChapter, confirmDeleteChapter,
    backToList,
    bookReferences, bookCitationStyle, handleUpdateBookReferences,
  } = useAdminLibraryPage();

  if (!user) return <div className="p-6">Faça login.</div>;

  const canManage = can('manage:library');
  if (!canManage) {
    return <div className="p-6"><div className="alert alert-error"><span>Sem permissão pra gerenciar a biblioteca.</span></div></div>;
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
            <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setView('categories')}>
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
            onImportEpub={() => setImportOpen(true)}
            onEdit={b => { setActiveBook(b); setView('form'); }}
            onEditChapters={b => { setActiveBook(b); setView('chapters'); }}
            onDelete={b => setDeleteBookTarget(b)}
          />
        )}

        {view === 'form' && (
          <BookForm book={activeBook} categories={categories} saving={saving} userId={user.id} onSave={handleSaveBook} onCancel={backToList} />
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
            <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => { setView('chapters'); setActiveChapter(null); }}>
              <ArrowLeft className="w-4 h-4" /> Capítulos de {activeBook.title}
            </button>
            <ChapterEditor
              bookId={activeBook.id}
              chapter={activeChapter}
              defaultOrder={chapters.length + 1}
              saving={savingChapter}
              onSave={handleSaveChapter}
              onCancel={() => { setView('chapters'); setActiveChapter(null); }}
              bookReferences={bookReferences}
              bookCitationStyle={bookCitationStyle}
              onUpdateBookReferences={handleUpdateBookReferences}
              existingChapters={chapters}
            />
          </div>
        )}
      </div>

      {deleteBookTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Remover livro</h3>
            <p className="text-sm text-base-content/70 mb-3">Remover <strong>{deleteBookTarget.title}</strong>? Capítulos e referências em aulas serão perdidos.</p>
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
            <p className="text-sm text-base-content/70 mb-3">Remover capítulo <strong>{deleteChapterTarget.order} — {deleteChapterTarget.title}</strong>? Os blocos e referências canônicas serão perdidos.</p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteChapterTarget(null)}>Cancelar</button>
              <button className="btn btn-error btn-sm" onClick={confirmDeleteChapter}>Remover</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteChapterTarget(null)} />
        </div>
      )}

      {importOpen && (
        <BookEpubImportModal
          userId={user.id}
          onClose={() => setImportOpen(false)}
          onImported={reload}
        />
      )}
    </div>
  );
}
