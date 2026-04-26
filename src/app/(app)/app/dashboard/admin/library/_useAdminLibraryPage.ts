'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Book, BookChapter } from '@/domain/library/types';
import type { BookFormState } from '@/features/library';
import { useBooksAdmin, useLibraryCatalog, useBookChapters } from '@/features/library';

type View = 'list' | 'form' | 'categories' | 'chapters' | 'chapter-edit';

export function useAdminLibraryPage() {
  const searchParams = useSearchParams();
  const { books, loading, error, saving, save, remove, reload } = useBooksAdmin();
  const { categories } = useLibraryCatalog({ onlyPublished: false });
  const [view, setView] = useState<View>('list');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [activeChapter, setActiveChapter] = useState<BookChapter | null>(null);
  const [deleteBookTarget, setDeleteBookTarget] = useState<Book | null>(null);
  const [deleteChapterTarget, setDeleteChapterTarget] = useState<BookChapter | null>(null);

  useEffect(() => {
    const queryView = searchParams.get('view');
    const queryBook = searchParams.get('book');
    if (queryBook && books.length > 0) {
      const book = books.find(b => b.id === queryBook);
      if (book) setActiveBook(book);
    }
    if (queryView === 'form') setView('form');
    else if (queryView === 'chapters' && queryBook) setView('chapters');
    else if (queryView === 'categories') setView('categories');
  }, [searchParams, books]);

  const { chapters, loading: loadingChapters, saving: savingChapter, saveChapter, deleteChapter } =
    useBookChapters(activeBook?.id ?? null);

  async function handleSaveBook(form: BookFormState) {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const year = form.year ? Number(form.year) : undefined;
    await save({ id: form.id, title: form.title, subtitle: form.subtitle || undefined, author: form.author || undefined, language: form.language, description: form.description || undefined, cover_url: form.cover_url || undefined, back_cover_url: form.back_cover_url || undefined, category_ids: form.category_ids, tags, isbn: form.isbn || undefined, edition: form.edition || undefined, year, is_published: form.is_published, spoiler_mode: form.spoiler_mode, created_by: form.created_by });
    setView('list');
    setActiveBook(null);
  }

  async function confirmDeleteBook() {
    if (!deleteBookTarget) return;
    await remove(deleteBookTarget.id);
    setDeleteBookTarget(null);
  }

  async function handleSaveChapter(input: { book_id: string; order: number; title: string; subtitle?: string; blocks: BookChapter['blocks'] }) {
    await saveChapter(input);
    setView('chapters');
    setActiveChapter(null);
  }

  async function confirmDeleteChapter() {
    if (!deleteChapterTarget) return;
    await deleteChapter(deleteChapterTarget.order);
    setDeleteChapterTarget(null);
  }

  function backToList() { setView('list'); setActiveBook(null); setActiveChapter(null); }

  return {
    view, setView,
    activeBook, setActiveBook,
    activeChapter, setActiveChapter,
    deleteBookTarget, setDeleteBookTarget,
    deleteChapterTarget, setDeleteChapterTarget,
    books, loading, error, saving, categories, reload,
    chapters, loadingChapters, savingChapter,
    handleSaveBook, confirmDeleteBook,
    handleSaveChapter, confirmDeleteChapter,
    backToList,
  };
}
