'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { libraryService } from '@/application/library/LibraryService';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { Book, BookCategory } from '@/domain/library/types';

interface Options {
  /** Se true, lista só livros publicados (default). False = todos (admin). */
  onlyPublished?: boolean;
  /**
   * Quando definido, aplica gate de progresso:
   * só inclui livros que o usuário já tem progresso de leitura (qualquer parte vista via curso).
   * Combinado com bypass — se `bypassProgressGate=true`, ignora.
   */
  userId?: string;
  /** Se true (ex: tem `read:library`), ignora o gate de progresso e mostra tudo. */
  bypassProgressGate?: boolean;
}

export function useLibraryCatalog({ onlyPublished = true, userId, bypassProgressGate = true }: Options = {}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [unlockedBookIds, setUnlockedBookIds] = useState<Set<string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookList, catList] = await Promise.all([
        libraryService.listCatalog({ onlyPublished }),
        libraryService.listCategories(),
      ]);
      setBooks(bookList);
      setCategories(catList);

      // Load progress only when gate is active (not bypassed)
      if (!bypassProgressGate && userId) {
        const progress = await bookReadingProgressRepository.findByUser(userId);
        setUnlockedBookIds(new Set(progress.map(p => p.book_id)));
      } else {
        setUnlockedBookIds(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [onlyPublished, userId, bypassProgressGate]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return books.filter(b => {
      // Progress gate: if active, hide books the user hasn't started yet
      if (unlockedBookIds && !unlockedBookIds.has(b.id)) return false;
      if (activeCategoryId && !b.category_ids.includes(activeCategoryId)) return false;
      if (term.length === 0) return true;
      const haystack = [b.title, b.subtitle ?? '', b.author ?? '', ...(b.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [books, search, activeCategoryId, unlockedBookIds]);

  return {
    books: filtered,
    allBooks: books,
    categories,
    loading,
    error,
    reload,
    search,
    setSearch,
    activeCategoryId,
    setActiveCategoryId,
    /** True quando catalog está restrito por progresso */
    progressGated: !!unlockedBookIds,
    unlockedCount: unlockedBookIds?.size ?? null,
  };
}
