'use client';

import { useEffect, useState } from 'react';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { BookReadingProgress } from '@/domain/library/types';

interface UseReadingHistoryResult {
  reading: BookReadingProgress[];
  completed: BookReadingProgress[];
  wantToRead: BookReadingProgress[];
  loading: boolean;
  error: string | null;
}

/**
 * Carrega o histórico de leitura de todos os livros do usuário.
 * Zero N+1: BookReadingProgress já tem book_title e book_cover_url denormalizados.
 */
export function useReadingHistory(userId: string | undefined): UseReadingHistoryResult {
  const [all, setAll] = useState<BookReadingProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    bookReadingProgressRepository.findByUser(userId)
      .then(setAll)
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [userId]);

  const reading = all.filter(p => p.percent > 0 && p.percent < 100);
  const completed = all.filter(p => p.percent >= 100);
  const wantToRead = all.filter(p => p.percent === 0);

  return { reading, completed, wantToRead, loading, error };
}
