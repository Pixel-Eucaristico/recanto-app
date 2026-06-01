import { bookRepository } from '@/infrastructure/library/BookRepository';
import { bookChapterRepository } from '@/infrastructure/library/BookChapterRepository';
import type {
  Book, BookChapter, BookCategory, BookSpoilerMode,
  BookFootnote, BookReference, BookGlossaryTerm, BookCredits, CitationStyle,
} from '@/domain/library/types';
import type { Role } from '@/shared/types/role';
import type { AgeRating } from '@/shared/types/content-access';
import { BookEntity } from '@/domain/library/entities/Book';
import { CanonicalRefEntity } from '@/domain/library/entities/CanonicalRef';
import { BookSpoilerEngine, type SpoilerLessonInput } from '@/application/library/BookSpoilerEngine';
import { libraryCategoryService, type SaveCategoryInput } from './LibraryCategoryService';
import type { ImportedBookChapterDraft } from './BookEpubImporter';

export type { SaveCategoryInput };

export interface SaveBookInput {
  id?: string;
  title: string;
  subtitle?: string;
  author?: string;
  language?: string;
  description?: string;
  cover_url?: string;
  back_cover_url?: string;
  category_ids?: string[];
  tags?: string[];
  isbn?: string;
  source_type?: Book['source_type'];
  source_identifier?: string;
  source_hash?: string;
  duplicate_key?: string;
  edition?: string;
  year?: number;
  is_published?: boolean;
  spoiler_mode?: BookSpoilerMode;
  required_roles?: Role[];
  age_rating?: AgeRating;
  created_by: string;
}

export interface SaveChapterInput {
  /** ID do capítulo (passar quando estiver editando — preserva doc existente). */
  id?: string;
  book_id: string;
  order: number;
  title: string;
  title_level?: number;
  subtitle?: string;
  kind?: BookChapter['kind'];
  blocks: BookChapter['blocks'];
  footnotes?: BookFootnote[];
  references?: BookReference[];
  citation_style?: CitationStyle;
  glossary_terms?: BookGlossaryTerm[];
  credits?: BookCredits;
}

export interface ImportBookInput extends SaveBookInput {
  chapters: ImportedBookChapterDraft[];
  chapterConcurrency?: number;
  onProgress?: (progress: { saved: number; total: number; book: Book }) => void;
}

export class LibraryService {
  // ─── Books ────────────────────────────────────────────────────────────────

  async saveBook(input: SaveBookInput): Promise<Book> {
    const now = new Date().toISOString();
    const draft: Book = {
      id: input.id ?? '',
      title: input.title.trim(),
      subtitle: input.subtitle,
      author: input.author,
      language: input.language ?? 'pt',
      description: input.description,
      cover_url: input.cover_url,
      back_cover_url: input.back_cover_url,
      category_ids: input.category_ids ?? [],
      tags: input.tags ?? [],
      isbn: input.isbn,
      source_type: input.source_type,
      source_identifier: input.source_identifier,
      source_hash: input.source_hash,
      duplicate_key: input.duplicate_key,
      edition: input.edition,
      year: input.year,
      is_published: input.is_published ?? false,
      spoiler_mode: input.spoiler_mode ?? 'open',
      required_roles: input.required_roles ?? [],
      age_rating: input.age_rating ?? 'L',
      created_by: input.created_by,
      created_at: now,
    };
    const errors = BookEntity.validate(draft);
    if (errors.length > 0) throw new Error(errors.join(' '));

    if (input.id) {
      const updated = await bookRepository.update(input.id, {
        title: draft.title, subtitle: draft.subtitle, author: draft.author, language: draft.language,
        description: draft.description, cover_url: draft.cover_url, back_cover_url: draft.back_cover_url,
        category_ids: draft.category_ids, tags: draft.tags, isbn: draft.isbn,
        source_type: draft.source_type, source_identifier: draft.source_identifier,
        source_hash: draft.source_hash, duplicate_key: draft.duplicate_key,
        edition: draft.edition,
        year: draft.year, is_published: draft.is_published, spoiler_mode: draft.spoiler_mode,
        required_roles: draft.required_roles, age_rating: draft.age_rating,
      });
      if (!updated) throw new Error('Livro não encontrado.');
      return updated;
    }
    const { id: _id, ...payload } = draft;
    return bookRepository.create(payload);
  }

  async importBook(input: ImportBookInput): Promise<{ book: Book; chapters: BookChapter[] }> {
    const {
      chapters: chapterDrafts,
      chapterConcurrency = 4,
      onProgress,
      ...bookInput
    } = input;
    const duplicate = await this.findImportDuplicate(bookInput);
    if (duplicate) {
      throw new Error(`Este livro já foi importado: "${duplicate.title}".`);
    }
    const book = await this.saveBook({
      ...bookInput,
      is_published: false,
    });

    try {
      const savedChapters = await this.saveImportedChapters(
        book,
        chapterDrafts,
        Math.max(1, Math.min(8, chapterConcurrency)),
        onProgress,
      );
      return { book, chapters: savedChapters };
    } catch (error) {
      await this.deleteBook(book.id);
      throw error;
    }
  }

  async findImportDuplicate(input: Pick<SaveBookInput, 'source_hash' | 'source_identifier' | 'isbn' | 'duplicate_key'>): Promise<Book | null> {
    if (input.source_hash) {
      const [book] = await bookRepository.findBySourceHash(input.source_hash);
      if (book) return book;
    }
    if (input.source_identifier) {
      const [book] = await bookRepository.findBySourceIdentifier(input.source_identifier);
      if (book) return book;
    }
    if (input.isbn) {
      const [book] = await bookRepository.findByIsbn(input.isbn);
      if (book) return book;
    }
    if (input.duplicate_key) {
      const [book] = await bookRepository.findByDuplicateKey(input.duplicate_key);
      if (book) return book;
    }
    return null;
  }

  private async saveImportedChapters(
    book: Book,
    chapters: ImportedBookChapterDraft[],
    concurrency: number,
    onProgress?: ImportBookInput['onProgress'],
  ): Promise<BookChapter[]> {
    const savedChapters: BookChapter[] = [];
    let cursor = 0;
    let saved = 0;

    const worker = async () => {
      while (cursor < chapters.length) {
        const chapter = chapters[cursor++];
        const draft: BookChapter = {
          id: '',
          book_id: book.id,
          order: chapter.order,
          title: chapter.title.trim(),
          title_level: chapter.title_level,
          subtitle: chapter.subtitle,
          kind: chapter.kind ?? 'chapter',
          blocks: chapter.blocks,
          footnotes: chapter.footnotes,
          credits: chapter.credits,
          created_at: new Date().toISOString(),
        };
        const errors = BookEntity.validateChapter(draft);
        if (errors.length > 0) throw new Error(errors.join(' '));
        const savedChapter = await bookChapterRepository.upsert(BookEntity.numberChapter(draft));
        savedChapters.push(savedChapter);
        saved++;
        onProgress?.({ saved, total: chapters.length, book });
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, chapters.length) }, worker));
    return BookEntity.sortChapters(savedChapters);
  }

  async deleteBook(bookId: string): Promise<void> {
    await bookChapterRepository.deleteAllByBook(bookId);
    await bookRepository.delete(bookId);
  }

  async getBook(bookId: string): Promise<Book | null> {
    return bookRepository.get(bookId);
  }

  async listCatalog(opts?: { onlyPublished?: boolean }): Promise<Book[]> {
    return opts?.onlyPublished ? bookRepository.listPublished() : bookRepository.listAll();
  }

  // ─── Chapters ─────────────────────────────────────────────────────────────

  async saveChapter(input: SaveChapterInput): Promise<BookChapter> {
    const kind = input.kind ?? 'chapter';
    const isCreating = !input.id;

    // Carrega capítulos existentes pra resolver ID (singleton) e order correto
    const existingChapters = isCreating
      ? await bookChapterRepository.findByBook(input.book_id)
      : [];

    // Singletons: bibliography, credits, preface, introduction, glossary, about.
    // Se já existe um capítulo com mesmo kind, REUTILIZA o ID dele.
    let resolvedId = input.id ?? '';
    if (isCreating && !BookEntity.allowsMultiple(kind)) {
      const dup = existingChapters.find(c => BookEntity.kindOf(c) === kind);
      if (dup) resolvedId = dup.id;
    }

    // Calcula order correto baseado no kind (não no total de capítulos)
    // Só faz isso na criação — edição preserva order escolhido pelo user
    let resolvedOrder = input.order;
    if (isCreating && !resolvedId) {
      const sameKindOrders = existingChapters
        .filter(c => BookEntity.kindOf(c) === kind)
        .map(c => c.order);
      resolvedOrder = sameKindOrders.length > 0 ? Math.max(...sameKindOrders) + 1 : 1;
    }

    const draft: BookChapter = {
      id: resolvedId,
      book_id: input.book_id,
      order: resolvedOrder,
      title: input.title.trim(),
      subtitle: input.subtitle,
      kind,
      blocks: input.blocks,
      footnotes: input.footnotes,
      references: input.references,
      citation_style: input.citation_style,
      glossary_terms: input.glossary_terms,
      credits: input.credits,
      created_at: new Date().toISOString(),
    };
    const errors = BookEntity.validateChapter(draft);
    if (errors.length > 0) throw new Error(errors.join(' '));
    return bookChapterRepository.upsert(BookEntity.numberChapter(draft));
  }

  async getChapter(bookId: string, order: number): Promise<BookChapter | null> {
    return bookChapterRepository.get(bookId, order);
  }

  async listChapters(bookId: string): Promise<BookChapter[]> {
    const chapters = await bookChapterRepository.findByBook(bookId);
    return BookEntity.sortChapters(chapters);
  }

  async deleteChapter(bookId: string, order: number): Promise<void> {
    await bookChapterRepository.delete(bookId, order);
  }

  async getBookForReading(bookId: string, lessons: SpoilerLessonInput[]): Promise<{
    book: Book | null; chapters: BookChapter[]; visible_until: string | null; truncated: boolean;
  }> {
    const book = await this.getBook(bookId);
    if (!book) return { book: null, chapters: [], visible_until: null, truncated: false };
    const chapters = await this.listChapters(bookId);
    const { visible_until } = BookSpoilerEngine.compute(book, lessons);
    const { chapters: cut, truncatedAt } = BookSpoilerEngine.applyCut(chapters, visible_until);
    return { book, chapters: cut, visible_until: visible_until ? CanonicalRefEntity.format(visible_until) : null, truncated: !!truncatedAt };
  }

  // ─── Categories (delegated to LibraryCategoryService) ─────────────────────

  async listCategories(): Promise<BookCategory[]> {
    return libraryCategoryService.listCategories();
  }

  async saveCategory(input: SaveCategoryInput): Promise<BookCategory> {
    return libraryCategoryService.saveCategory(input);
  }

  async deleteCategory(id: string): Promise<void> {
    return libraryCategoryService.deleteCategory(id);
  }
}

export const libraryService = new LibraryService();
