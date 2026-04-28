'use client';

import { useCallback, useEffect, useState } from 'react';
import { libraryService } from '@/application/library/LibraryService';
import { BookChapter } from '@/domain/library/types';

export function useBookChapters(bookId: string | null) {
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!bookId) {
      setChapters([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await libraryService.listChapters(bookId);
      setChapters(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function saveChapter(chapter: Parameters<typeof libraryService.saveChapter>[0]) {
    setSaving(true);
    setError(null);
    try {
      const saved = await libraryService.saveChapter(chapter);
      await reload();
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function deleteChapter(order: number) {
    if (!bookId) return;
    setError(null);
    try {
      await libraryService.deleteChapter(bookId, order);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  return { chapters, loading, error, saving, reload, saveChapter, deleteChapter };
}
