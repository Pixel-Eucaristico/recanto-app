'use client';

import { useCallback, useEffect, useState } from 'react';
import { bookHighlightRepository } from '@/infrastructure/library/BookHighlightRepository';
import { bookCommentRepository } from '@/infrastructure/library/BookCommentRepository';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { BookHighlight, BookComment, HighlightColor } from '@/domain/library/types';

interface UseBookAnnotationsResult {
  highlights: BookHighlight[];
  comments: BookComment[];
  loading: boolean;
  error: string | null;
  /** Highlights de uma ref — pode ser múltiplos (textos diferentes). */
  highlightsForRef: (ref: string) => BookHighlight[];
  commentsForRef: (ref: string) => BookComment[];
  /**
   * Adiciona highlight de texto selecionado.
   * Se já existe highlight com mesmo selectedText + ref → remove (toggle).
   */
  addHighlight: (ref: string, color: HighlightColor, selectedText: string) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  addComment: (ref: string, text: string) => Promise<void>;
  updateComment: (id: string, text: string) => Promise<void>;
  removeComment: (id: string) => Promise<void>;
}

export function useBookAnnotations(
  userId: string | undefined,
  bookId: string,
): UseBookAnnotationsResult {
  const [highlights, setHighlights] = useState<BookHighlight[]>([]);
  const [comments, setComments] = useState<BookComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      bookHighlightRepository.findByUserAndBook(userId, bookId),
      bookCommentRepository.findByUserAndBook(userId, bookId),
    ])
      .then(([h, c]) => { setHighlights(h); setComments(c); })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [userId, bookId]);

  const highlightsForRef = useCallback(
    (ref: string) => highlights.filter(h => h.ref === ref),
    [highlights],
  );

  const commentsForRef = useCallback(
    (ref: string) => comments.filter(c => c.ref === ref),
    [comments],
  );

  const addHighlight = useCallback(
    async (ref: string, color: HighlightColor, selectedText: string) => {
      if (!userId) { setError('Faça login para salvar destaques'); return; }
      if (!selectedText.trim()) return;
      setError(null);
      try {
        const refHighlights = highlights.filter(h => h.ref === ref && h.selected_text);

        // Mesma seleção exata → toggle (remove)
        const exactMatch = refHighlights.find(h => h.selected_text === selectedText);
        if (exactMatch) {
          await bookHighlightRepository.remove(exactMatch.id);
          setHighlights(prev => prev.filter(h => h.id !== exactMatch.id));
          await bookReadingProgressRepository.updateHighlightCount(userId, bookId, -1);
          return;
        }

        // Remove highlights que se sobrepõem com a nova seleção:
        // - highlights que estão DENTRO da nova seleção (new contém old)
        // - highlights que CONTÊM a nova seleção (old contém new)
        const overlapping = refHighlights.filter(h => {
          const t = h.selected_text!;
          return selectedText.includes(t) || t.includes(selectedText);
        });

        let countDelta = 0;
        const removedIds = new Set<string>();
        for (const h of overlapping) {
          await bookHighlightRepository.remove(h.id);
          removedIds.add(h.id);
          countDelta--;
        }

        // Adiciona novo highlight
        const created = await bookHighlightRepository.add(userId, bookId, ref, color, selectedText);
        countDelta++;

        setHighlights(prev => [
          ...prev.filter(h => !removedIds.has(h.id)),
          created,
        ]);

        // Atualiza counter com delta real (pode ter removido vários e adicionado 1)
        if (countDelta > 0) {
          for (let i = 0; i < countDelta; i++) await bookReadingProgressRepository.updateHighlightCount(userId, bookId, 1);
        } else if (countDelta < 0) {
          for (let i = 0; i < -countDelta; i++) await bookReadingProgressRepository.updateHighlightCount(userId, bookId, -1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar destaque');
      }
    },
    [userId, bookId, highlights],
  );

  const removeHighlight = useCallback(
    async (id: string) => {
      if (!userId) return;
      setError(null);
      try {
        await bookHighlightRepository.remove(id);
        setHighlights(prev => prev.filter(h => h.id !== id));
        await bookReadingProgressRepository.updateHighlightCount(userId, bookId, -1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao remover destaque');
      }
    },
    [userId, bookId],
  );

  const addComment = useCallback(
    async (ref: string, text: string) => {
      if (!userId) { setError('Faça login para adicionar notas'); return; }
      if (!text.trim() || text.length > 1000) return;
      setError(null);
      try {
        const created = await bookCommentRepository.add(userId, bookId, ref, text.trim());
        setComments(prev => [...prev, created]);
        await bookReadingProgressRepository.updateNotesCount(userId, bookId, 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar comentário');
      }
    },
    [userId, bookId],
  );

  const updateComment = useCallback(
    async (id: string, text: string) => {
      if (!text.trim() || text.length > 1000) return;
      setError(null);
      try {
        await bookCommentRepository.update(id, text.trim());
        setComments(prev => prev.map(c => c.id === id ? { ...c, text: text.trim(), updated_at: new Date().toISOString() } : c));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar comentário');
      }
    },
    [],
  );

  const removeComment = useCallback(
    async (id: string) => {
      if (!userId) return;
      setError(null);
      try {
        await bookCommentRepository.remove(id);
        setComments(prev => prev.filter(c => c.id !== id));
        await bookReadingProgressRepository.updateNotesCount(userId, bookId, -1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao remover comentário');
      }
    },
    [userId, bookId],
  );

  return { highlights, comments, loading, error, highlightsForRef, commentsForRef, addHighlight, removeHighlight, addComment, updateComment, removeComment };
}
