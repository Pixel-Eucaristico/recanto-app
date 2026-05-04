'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { BookReadingProgress } from '@/domain/library/types';

interface UseReadingProgressResult {
  progress: BookReadingProgress | null;
  bookmarkError: string | null;
  updatePosition: (chapterOrder: number, lastRef: string | null, totalChapters: number) => void;
  saveBookmark: (ref: string | null, chapterOrder: number, totalChapters: number) => Promise<void>;
  completeReading: (lastChapterOrder: number) => Promise<void>;
}

export function useReadingProgress(userId: string | undefined, bookId: string): UseReadingProgressResult {
  const [progress, setProgress] = useState<BookReadingProgress | null>(null);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref sempre atualizado com last_ref atual — evita race condition no debounce
  const lastRefRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!userId) return;
    bookReadingProgressRepository.get(userId, bookId).then(p => {
      setProgress(p);
      lastRefRef.current = p?.last_ref;
    });
  }, [userId, bookId]);

  // Sincroniza ref com state
  useEffect(() => {
    lastRefRef.current = progress?.last_ref;
  }, [progress?.last_ref]);

  const updatePosition = useCallback(
    (chapterOrder: number, _lastRef: string | null, totalChapters: number) => {
      if (!userId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const percent = totalChapters > 0 ? Math.round((chapterOrder / totalChapters) * 100) : 0;
        const data = {
          user_id: userId,
          book_id: bookId,
          last_chapter_order: chapterOrder,
          // Usa ref do state atual (não lê Firestore — evita race condition)
          last_ref: lastRefRef.current,
          percent,
          updated_at: new Date().toISOString(),
        };
        try {
          const saved = await bookReadingProgressRepository.upsert(data);
          setProgress(saved);
        } catch {
          // posição auto-save falha silenciosamente — não crítico
        }
      }, 2000);
    },
    [userId, bookId],
  );

  const saveBookmark = useCallback(
    async (ref: string | null, chapterOrder: number, totalChapters: number) => {
      if (!userId) { setBookmarkError('Faça login para salvar marcador'); return; }
      setBookmarkError(null);
      // Cancela debounce pendente — saveBookmark é prioritário
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const now = new Date().toISOString();
      const percent = totalChapters > 0 ? Math.round((chapterOrder / totalChapters) * 100) : 0;
      const data = {
        user_id: userId,
        book_id: bookId,
        last_chapter_order: chapterOrder,
        last_ref: ref ?? undefined,
        percent,
        updated_at: now,
        // Marca quando usuário acionou bookmark explicito
        last_bookmark_at: now,
      };
      try {
        const saved = await bookReadingProgressRepository.upsert(data);
        // Atualiza ref imediatamente pra próximo debounce não sobrescrever
        lastRefRef.current = ref ?? undefined;
        setProgress(saved);
      } catch (err) {
        setBookmarkError(err instanceof Error ? err.message : 'Erro ao salvar marcador');
      }
    },
    [userId, bookId],
  );

  const completeReading = useCallback(
    async (lastChapterOrder: number) => {
      if (!userId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const now = new Date().toISOString();
      const data = {
        user_id: userId,
        book_id: bookId,
        last_chapter_order: lastChapterOrder,
        percent: 100,
        updated_at: now,
        // Marca conclusão APENAS quando usuário aciona explicitamente
        completed_at: now,
      };
      try {
        const saved = await bookReadingProgressRepository.upsert(data);
        setProgress(saved);
      } catch (err) {
        setBookmarkError(err instanceof Error ? err.message : 'Erro ao finalizar leitura');
      }
    },
    [userId, bookId],
  );

  return { progress, bookmarkError, updatePosition, saveBookmark, completeReading };
}
