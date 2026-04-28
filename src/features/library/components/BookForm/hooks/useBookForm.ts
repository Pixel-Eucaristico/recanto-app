'use client';

import { useEffect, useState } from 'react';
import type { Book, BookSpoilerMode } from '@/domain/library/types';

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
    created_by: book?.created_by ?? userId,
  };
}

export function useBookForm(book: Book | null, userId: string) {
  const [form, setForm] = useState<BookFormState>(() => buildState(book, userId));

  useEffect(() => {
    setForm(buildState(book, userId));
  }, [book, userId]);

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

  return { form, patch, toggleCategory };
}
