'use client';

import { useEffect, useState } from 'react';
import { libraryService } from '@/application/library/LibraryService';
import { Book, BookChapter } from '@/domain/library/types';
import { SpoilerLessonInput } from '@/application/library/BookSpoilerEngine';

interface UseBookReaderResult {
  book: Book | null;
  chapters: BookChapter[];
  visibleUntil: string | null;
  truncated: boolean;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Carrega livro pra leitura aplicando spoiler-cut quando houver aulas com `apply_spoiler=true`.
 * Lessons input fica vazio até integração com aula (step 9) — livro abre integral até lá.
 */
export function useBookReader(bookId: string, lessons: SpoilerLessonInput[] = []): UseBookReaderResult {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [visibleUntil, setVisibleUntil] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await libraryService.getBookForReading(bookId, lessons);
      setBook(result.book);
      setChapters(result.chapters);
      setVisibleUntil(result.visible_until);
      setTruncated(result.truncated);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, JSON.stringify(lessons)]);

  return { book, chapters, visibleUntil, truncated, loading, error, reload: load };
}
