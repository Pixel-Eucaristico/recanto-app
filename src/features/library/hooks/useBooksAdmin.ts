'use client';

import { useCallback, useEffect, useState } from 'react';
import { libraryService, SaveBookInput } from '@/application/library/LibraryService';
import { Book } from '@/domain/library/types';

export function useBooksAdmin() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await libraryService.listCatalog({ onlyPublished: false });
      setBooks(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function save(input: SaveBookInput) {
    setSaving(true);
    setError(null);
    try {
      const saved = await libraryService.saveBook(input);
      await reload();
      return saved;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function remove(bookId: string) {
    setError(null);
    try {
      await libraryService.deleteBook(bookId);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  return { books, loading, error, saving, reload, save, remove };
}
