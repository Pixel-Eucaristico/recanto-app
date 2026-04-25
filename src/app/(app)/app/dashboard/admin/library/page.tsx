'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FolderOpen, Library as LibraryIcon } from 'lucide-react';
import {
  BookList,
  BookForm,
  LibraryCategoryManager,
  useBooksAdmin,
  useLibraryCatalog,
  type BookFormState,
} from '@/features/library';
import { Book } from '@/domain/library/types';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

type View = 'list' | 'form' | 'categories' | 'chapters';

export default function AdminLibraryPage() {
  const user = useCurrentUser();
  const { books, loading, error, saving, save, remove, reload } = useBooksAdmin();
  const { categories } = useLibraryCatalog({ onlyPublished: false });
  const [view, setView] = useState<View>('list');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  if (!user) return <div className="p-6">Faça login.</div>;

  const canManage = user.role === 'admin' || user.features.includes('manage:library') || user.features.includes('*');
  if (!canManage) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>Sem permissão pra gerenciar a biblioteca.</span>
        </div>
      </div>
    );
  }

  async function handleSave(form: BookFormState) {
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    await remove(deleteTarget.id);
    setDeleteTarget(null);
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
        {loading && <div className="alert alert-info text-sm"><span>Carregando...</span></div>}
        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        {view === 'list' && !loading && (
          <BookList
            books={books}
            onCreate={() => { setActiveBook(null); setView('form'); }}
            onEdit={b => { setActiveBook(b); setView('form'); }}
            onEditChapters={b => { setActiveBook(b); setView('chapters'); }}
            onDelete={b => setDeleteTarget(b)}
          />
        )}

        {view === 'form' && (
          <BookForm
            book={activeBook}
            categories={categories}
            saving={saving}
            userId={user.id}
            onSave={handleSave}
            onCancel={() => { setView('list'); setActiveBook(null); }}
          />
        )}

        {view === 'categories' && (
          <LibraryCategoryManager onClose={() => { setView('list'); reload(); }} />
        )}

        {view === 'chapters' && activeBook && (
          <div className="space-y-3">
            <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => { setView('list'); setActiveBook(null); }}>
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-4">
                <h3 className="text-base font-semibold">{activeBook.title}</h3>
                <p className="text-xs text-base-content/60">Editor de capítulos será adicionado no próximo passo.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Remover livro</h3>
            <p className="text-sm text-base-content/70 mb-3">
              Remover <strong>{deleteTarget.title}</strong>? Capítulos e referências em aulas serão perdidos.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn btn-error btn-sm" onClick={confirmDelete}>Remover</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)} />
        </div>
      )}
    </div>
  );
}
