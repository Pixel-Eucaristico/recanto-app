'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { libraryService } from '@/application/library/LibraryService';
import { Book, BookCategory } from '@/domain/library/types';

interface Options {
  /** Se true, lista só livros publicados (default). False = todos (admin). */
  onlyPublished?: boolean;
}

export function useLibraryCatalog({ onlyPublished = true }: Options = {}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [onlyPublished]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return books.filter(b => {
      if (activeCategoryId && !b.category_ids.includes(activeCategoryId)) return false;
      if (term.length === 0) return true;
      const haystack = [b.title, b.subtitle ?? '', b.author ?? '', ...(b.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [books, search, activeCategoryId]);

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
  };
}
