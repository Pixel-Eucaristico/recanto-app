'use client';

import { useEffect, useState } from 'react';
import type { Book, BookSpoilerMode } from '@/domain/library/types';
import type { Role } from '@/shared/types/role';
import type { AgeRating } from '@/shared/types/content-access';
import { contentGrantService } from '@/application/content-access/ContentGrantService';

export interface BookFormState {
  id?: string;
  title: string;
  subtitle: string;
  author: string;
  language: string;
  description: string;
  cover_url: string;
  back_cover_url: string;
  category_ids: string[];
  tags: string;
  isbn: string;
  edition: string;
  year: string;
  is_published: boolean;
  spoiler_mode: BookSpoilerMode;
  required_roles: Role[];
  age_rating: AgeRating;
  allowed_user_ids: string[];
  created_by: string;
}

function buildState(book: Book | null, userId: string): BookFormState {
  return {
    id: book?.id,
    title: book?.title ?? '',
    subtitle: book?.subtitle ?? '',
    author: book?.author ?? '',
    language: book?.language ?? 'pt',
    description: book?.description ?? '',
    cover_url: book?.cover_url ?? '',
    back_cover_url: book?.back_cover_url ?? '',
    category_ids: book?.category_ids ?? [],
    tags: (book?.tags ?? []).join(', '),
    isbn: book?.isbn ?? '',
    edition: book?.edition ?? '',
    year: book?.year ? String(book.year) : '',
    is_published: book?.is_published ?? false,
    spoiler_mode: book?.spoiler_mode ?? 'open',
    required_roles: book?.required_roles ?? [],
    age_rating: book?.age_rating ?? 'L',
    allowed_user_ids: [],
    created_by: book?.created_by ?? userId,
  };
}

export function useBookForm(book: Book | null, userId: string) {
  const [form, setForm] = useState<BookFormState>(() => buildState(book, userId));

  // Depende de book?.id (ID estável) em vez de book (ref) — evita reset ao re-render do pai
  useEffect(() => {
    setForm(buildState(book, userId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, userId]);

  // Carrega grants existentes do livro
  useEffect(() => {
    if (!book?.id) return;
    let alive = true;
    contentGrantService
      .listForContent(book.id, 'book')
      .then(grants => {
        if (alive) setForm(f => ({ ...f, allowed_user_ids: grants.map(g => g.user_id) }));
      })
      .catch(err => console.error('[useBookForm] erro carregar grants:', err));
    return () => {
      alive = false;
    };
  }, [book?.id]);

  function patch(p: Partial<BookFormState>) {
    setForm(f => ({ ...f, ...p }));
  }

  function toggleCategory(id: string) {
    setForm(f => ({
      ...f,
      category_ids: f.category_ids.includes(id)
        ? f.category_ids.filter(x => x !== id)
        : [...f.category_ids, id],
    }));
  }

  function toggleRole(role: Role) {
    if (!role) return;
    setForm(f => ({
      ...f,
      required_roles: f.required_roles.includes(role)
        ? f.required_roles.filter(r => r !== role)
        : [...f.required_roles, role],
    }));
  }

  function setAllowedUserIds(ids: string[]) {
    setForm(f => ({ ...f, allowed_user_ids: ids }));
  }

  return { form, patch, toggleCategory, toggleRole, setAllowedUserIds };
}
