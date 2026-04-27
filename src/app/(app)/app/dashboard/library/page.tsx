'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Library, Plus, FolderOpen, History } from 'lucide-react';
import Link from 'next/link';
import { BookCatalogGrid, CategoryFilter, useLibraryCatalog, useBooksAdmin } from '@/features/library';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { Book } from '@/domain/library/types';

export default function LibraryPage() {
  const user = useCurrentUser();
  const router = useRouter();
  const isManager = user?.role === 'admin' || user?.features.includes('manage:library') || user?.features.includes('*');
  const hasReadLibrary = isManager || (user?.features.includes('read:library') ?? false);
  const hasDownloadLibrary = isManager || (user?.features.includes('download:library') ?? false);

  // Progress gate: when user lacks `read:library`, show only books unlocked via courses
  const { books, categories, loading, error, search, setSearch, activeCategoryId, setActiveCategoryId, progressGated, unlockedCount } = useLibraryCatalog({
    onlyPublished: !isManager,
    userId: user?.id,
    bypassProgressGate: hasReadLibrary,
  });
  const { remove } = useBooksAdmin();
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!user) return <div className="p-6">Faça login pra acessar a biblioteca.</div>;

  // No read:library AND no books unlocked via course progress → access denied
  if (!hasReadLibrary && !loading && progressGated && unlockedCount === 0) {
    return (
      <div className="p-6">
        <div className="alert alert-warning">
          <span>
            Sem acesso à biblioteca. Comece um curso que use livros para liberar acesso aos respectivos títulos,
            ou solicite a permissão <code>read:library</code>.
          </span>
        </div>
      </div>
    );
  }

  function goEdit(book: Book) {
    router.push(`/app/dashboard/admin/library?book=${book.id}&view=form`);
  }
  function goChapters(book: Book) {
    router.push(`/app/dashboard/admin/library?book=${book.id}&view=chapters`);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
      // Recarrega o catálogo
      window.location.reload();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 space-y-4 md:space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-4 md:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Library className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-base-content">Biblioteca</h1>
              <p className="text-base-content/60 text-xs md:text-sm">
                Apostilas e livros da comunidade. {books.length} {books.length === 1 ? 'livro' : 'livros'}.
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/app/dashboard/library/history" className="btn btn-ghost btn-sm gap-1">
              <History className="w-4 h-4" /> Histórico
            </Link>
            {isManager && (
              <>
                <Link href="/app/dashboard/admin/library?view=categories" className="btn btn-ghost btn-sm gap-1">
                  <FolderOpen className="w-4 h-4" /> Categorias
                </Link>
                <Link href="/app/dashboard/admin/library?view=form" className="btn btn-primary btn-sm gap-1">
                  <Plus className="w-4 h-4" /> Novo livro
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {progressGated && (
        <div className="alert alert-info text-sm">
          <span>
            Você está vendo apenas livros liberados pelos cursos que iniciou ({unlockedCount} {unlockedCount === 1 ? 'liberado' : 'liberados'}).
            Avance nas aulas para liberar mais.
          </span>
        </div>
      )}

      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-4 md:p-6 space-y-4">
        <CategoryFilter
          categories={categories}
          activeCategoryId={activeCategoryId}
          onChangeCategory={setActiveCategoryId}
          search={search}
          onChangeSearch={setSearch}
        />

        {loading && <div className="alert alert-info text-sm"><span>Carregando catálogo...</span></div>}
        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        {!loading && !error && (
          <BookCatalogGrid
            books={books}
            manager={isManager}
            canDownload={hasDownloadLibrary}
            onEdit={goEdit}
            onEditChapters={goChapters}
            onDelete={book => setDeleteTarget(book)}
          />
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
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</button>
              <button className="btn btn-error btn-sm" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)} />
        </div>
      )}
    </div>
  );
}
