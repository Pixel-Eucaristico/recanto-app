'use client';

import { useCallback, useEffect, useState } from 'react';
import { bookTagRepository } from '@/infrastructure/library/BookTagRepository';
import { BookTag, TagColor } from '@/domain/library/types';

interface UseBookTagsResult {
  tags: BookTag[];
  tagsForRef: (ref: string) => BookTag[];
  tagsForChapter: (chapterOrder: number) => BookTag[];
  addTag: (chapterOrder: number, text: string, color: TagColor, ref?: string) => Promise<void>;
  updateTag: (id: string, text: string, color: TagColor) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  error: string | null;
}

export function useBookTags(userId: string | undefined, bookId: string): UseBookTagsResult {
  const [tags, setTags] = useState<BookTag[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    bookTagRepository.findByUserAndBook(userId, bookId)
      .then(setTags)
      .catch(err => setError(err instanceof Error ? err.message : String(err)));
  }, [userId, bookId]);

  const tagsForRef = useCallback(
    (ref: string) => tags.filter(t => t.ref === ref),
    [tags],
  );

  const tagsForChapter = useCallback(
    (chapterOrder: number) => tags.filter(t => t.chapter_order === chapterOrder),
    [tags],
  );

  const addTag = useCallback(
    async (chapterOrder: number, text: string, color: TagColor, ref?: string) => {
      if (!userId) { setError('Faça login para adicionar tags'); return; }
      if (!text.trim() || text.length > 80) return;
      setError(null);
      try {
        const created = await bookTagRepository.add(userId, bookId, chapterOrder, text.trim(), color, ref);
        setTags(prev => [...prev, created].sort((a, b) =>
          a.chapter_order !== b.chapter_order
            ? a.chapter_order - b.chapter_order
            : a.created_at.localeCompare(b.created_at)
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar tag');
      }
    },
    [userId, bookId],
  );

  const updateTag = useCallback(
    async (id: string, text: string, color: TagColor) => {
      if (!text.trim()) return;
      setError(null);
      try {
        await bookTagRepository.update(id, text.trim(), color);
        setTags(prev => prev.map(t => t.id === id ? { ...t, text: text.trim(), color } : t));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar tag');
      }
    },
    [],
  );

  const removeTag = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await bookTagRepository.remove(id);
        setTags(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao remover tag');
      }
    },
    [],
  );

  return { tags, tagsForRef, tagsForChapter, addTag, updateTag, removeTag, error };
}
