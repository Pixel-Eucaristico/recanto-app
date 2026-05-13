'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Book, BookChapter, BookReference } from '@/domain/library/types';
import type { SaveChapterPayload } from '@/features/library/components/ChapterEditor/hooks/useChapterEditor';
import type { BookFormState } from '@/features/library';
import { useBooksAdmin, useLibraryCatalog, useBookChapters } from '@/features/library';
import { contentGrantService } from '@/application/content-access/ContentGrantService';

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
    const saved = await save({
      id: form.id,
      title: form.title,
      subtitle: form.subtitle || undefined,
      author: form.author || undefined,
      language: form.language,
      description: form.description || undefined,
      cover_url: form.cover_url || undefined,
      back_cover_url: form.back_cover_url || undefined,
      category_ids: form.category_ids,
      tags,
      isbn: form.isbn || undefined,
      edition: form.edition || undefined,
      year,
      is_published: form.is_published,
      spoiler_mode: form.spoiler_mode,
      required_roles: form.required_roles,
      age_rating: form.age_rating,
      created_by: form.created_by,
    });
    if (saved?.id) {
      await contentGrantService.syncGrants(saved.id, 'book', form.allowed_user_ids, form.created_by);
    }
    setView('list');
    setActiveBook(null);
  }

  async function confirmDeleteBook() {
    if (!deleteBookTarget) return;
    await remove(deleteBookTarget.id);
    setDeleteBookTarget(null);
  }

  async function handleSaveChapter(input: SaveChapterPayload) {
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

  // Find bibliography section in this book (for citation picker integration)
  const bibliographyChapter = chapters.find(c => c.kind === 'bibliography');
  const bookReferences: BookReference[] = bibliographyChapter?.references ?? [];
  const bookCitationStyle = bibliographyChapter?.citation_style ?? 'abnt';

  /** Update the bibliography chapter's references list (called from CitationPickerModal). */
  async function handleUpdateBookReferences(refs: BookReference[]) {
    if (!activeBook) return;
    if (bibliographyChapter) {
      await saveChapter({
        book_id: activeBook.id,
        order: bibliographyChapter.order,
        title: bibliographyChapter.title,
        subtitle: bibliographyChapter.subtitle,
        kind: 'bibliography',
        blocks: [],
        references: refs,
        citation_style: bibliographyChapter.citation_style ?? 'abnt',
      });
    } else {
      // Auto-create bibliography chapter on first reference add
      const nextOrder = chapters.length > 0 ? Math.max(...chapters.map(c => c.order)) + 1 : 1;
      await saveChapter({
        book_id: activeBook.id,
        order: nextOrder,
        title: 'Bibliografia',
        kind: 'bibliography',
        blocks: [],
        references: refs,
        citation_style: 'abnt',
      });
    }
  }

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
    bookReferences, bookCitationStyle, handleUpdateBookReferences,
  };
}
