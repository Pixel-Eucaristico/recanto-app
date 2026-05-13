'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { libraryService } from '@/application/library/LibraryService';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { Book, BookCategory } from '@/domain/library/types';
import { useUserGrants } from '@/features/content-access/hooks/useUserGrants';
import { evaluateAccess } from '@/shared/content-access/accessGate';
import type { Role } from '@/shared/types/role';

interface Options {
  /** Se true, lista só livros publicados (default). False = todos (admin). */
  onlyPublished?: boolean;
  /**
   * Quando definido, aplica gate de progresso:
   * só inclui livros que o usuário já tem progresso de leitura (qualquer parte vista via curso).
   * Combinado com bypass — se `bypassProgressGate=true`, ignora.
   */
  userId?: string;
  /** Role do usuário corrente (pra access gate). */
  userRole?: Role;
  /** Data de nascimento ISO do usuário (pra age gate). */
  userBirthdate?: string;
  /** Se true (ex: tem `read:library`), ignora o gate de progresso e mostra tudo. */
  bypassProgressGate?: boolean;
}

export function useLibraryCatalog({
  onlyPublished = true,
  userId,
  userRole = null,
  userBirthdate,
  bypassProgressGate = true,
}: Options = {}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [unlockedBookIds, setUnlockedBookIds] = useState<Set<string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const { grantedIds } = useUserGrants(userId, 'book');

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
    const accessUser = userId ? { uid: userId, role: userRole, birthdate: userBirthdate } : null;
    return books.filter(b => {
      // Access gate: role + age + per-user grant. Admin always passes.
      if (accessUser) {
        const decision = evaluateAccess(b, accessUser, grantedIds);
        if (!decision.allowed) return false;
      }
      // Progress gate: if active, hide books the user hasn't started yet
      if (unlockedBookIds && !unlockedBookIds.has(b.id)) return false;
      if (activeCategoryId && !b.category_ids.includes(activeCategoryId)) return false;
      if (term.length === 0) return true;
      const haystack = [b.title, b.subtitle ?? '', b.author ?? '', ...(b.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [books, search, activeCategoryId, unlockedBookIds, userId, userRole, userBirthdate, grantedIds]);

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
