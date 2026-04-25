'use client';

import Link from 'next/link';
import { Library, Settings } from 'lucide-react';
import { BookCatalogGrid, CategoryFilter, useLibraryCatalog } from '@/features/library';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

export default function LibraryPage() {
  const user = useCurrentUser();
  const isManager = user?.role === 'admin' || user?.features.includes('manage:library') || user?.features.includes('*');
  const { books, categories, loading, error, search, setSearch, activeCategoryId, setActiveCategoryId } = useLibraryCatalog({
    onlyPublished: !isManager, // Manager vê rascunhos também
  });

  if (!user) return <div className="p-6">Faça login pra acessar a biblioteca.</div>;

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
          {isManager && (
            <Link href="/app/dashboard/admin/library" className="btn btn-primary btn-sm gap-1">
              <Settings className="w-4 h-4" /> Gerenciar
            </Link>
          )}
        </div>
      </header>

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

        {!loading && !error && <BookCatalogGrid books={books} />}
      </div>
    </div>
  );
}
