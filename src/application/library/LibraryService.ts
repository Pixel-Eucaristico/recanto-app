import { bookRepository } from '@/infrastructure/library/BookRepository';
import { bookChapterRepository } from '@/infrastructure/library/BookChapterRepository';
import { bookCategoryRepository } from '@/infrastructure/library/BookCategoryRepository';
import { Book, BookChapter, BookCategory, BookSpoilerMode } from '@/domain/library/types';
import { BookEntity } from '@/domain/library/entities/Book';
import { CanonicalRefEntity } from '@/domain/library/entities/CanonicalRef';
import { BookSpoilerEngine, SpoilerLessonInput } from '@/application/library/BookSpoilerEngine';

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
  edition?: string;
  year?: number;
  is_published?: boolean;
  spoiler_mode?: BookSpoilerMode;
  created_by: string;
}

export interface SaveChapterInput {
  book_id: string;
  order: number;
  title: string;
  subtitle?: string;
  blocks: BookChapter['blocks'];
}

export interface SaveCategoryInput {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  order?: number;
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
      edition: input.edition,
      year: input.year,
      is_published: input.is_published ?? false,
      spoiler_mode: input.spoiler_mode ?? 'open',
      created_by: input.created_by,
      created_at: now,
    };
    const errors = BookEntity.validate(draft);
    if (errors.length > 0) throw new Error(errors.join(' '));

    if (input.id) {
      const updated = await bookRepository.update(input.id, {
        title: draft.title,
        subtitle: draft.subtitle,
        author: draft.author,
        language: draft.language,
        description: draft.description,
        cover_url: draft.cover_url,
        back_cover_url: draft.back_cover_url,
        category_ids: draft.category_ids,
        tags: draft.tags,
        isbn: draft.isbn,
        edition: draft.edition,
        year: draft.year,
        is_published: draft.is_published,
        spoiler_mode: draft.spoiler_mode,
      });
      if (!updated) throw new Error('Livro não encontrado.');
      return updated;
    }
    const { id: _id, ...payload } = draft;
    return bookRepository.create(payload);
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
    const draft: BookChapter = {
      id: '',
      book_id: input.book_id,
      order: input.order,
      title: input.title.trim(),
      subtitle: input.subtitle,
      blocks: input.blocks,
      created_at: new Date().toISOString(),
    };
    const errors = BookEntity.validateChapter(draft);
    if (errors.length > 0) throw new Error(errors.join(' '));

    // Aplica numeração canônica antes de salvar — refs ficam estáveis
    const numbered = BookEntity.numberChapter(draft);
    return bookChapterRepository.upsert(numbered);
  }

  async getChapter(bookId: string, order: number): Promise<BookChapter | null> {
    return bookChapterRepository.get(bookId, order);
  }

  async listChapters(bookId: string): Promise<BookChapter[]> {
    return bookChapterRepository.findByBook(bookId);
  }

  async deleteChapter(bookId: string, order: number): Promise<void> {
    await bookChapterRepository.delete(bookId, order);
  }

  /**
   * Carrega o livro pra leitura aplicando o corte de spoiler do aluno (se livro for `progressive`).
   * Aceita lista de aulas que referenciam o livro pra decidir o limite.
   */
  async getBookForReading(
    bookId: string,
    lessons: SpoilerLessonInput[],
  ): Promise<{
    book: Book | null;
    chapters: BookChapter[];
    visible_until: string | null;
    truncated: boolean;
  }> {
    const book = await this.getBook(bookId);
    if (!book) return { book: null, chapters: [], visible_until: null, truncated: false };

    const chapters = await this.listChapters(bookId);
    const { visible_until } = BookSpoilerEngine.compute(book, lessons);
    const { chapters: cut, truncatedAt } = BookSpoilerEngine.applyCut(chapters, visible_until);

    return {
      book,
      chapters: cut,
      visible_until: visible_until ? CanonicalRefEntity.format(visible_until) : null,
      truncated: !!truncatedAt,
    };
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  async listCategories(): Promise<BookCategory[]> {
    return bookCategoryRepository.listAll();
  }

  async saveCategory(input: SaveCategoryInput): Promise<BookCategory> {
    const now = new Date().toISOString();
    const slug = input.slug.trim().toLowerCase();
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Slug inválido (use letras minúsculas, números e hífen).');
    }
    if (!input.name || input.name.trim().length === 0) throw new Error('Nome da categoria vazio.');

    if (input.id) {
      const updated = await bookCategoryRepository.update(input.id, {
        slug,
        name: input.name.trim(),
        description: input.description,
        order: input.order ?? 0,
      });
      if (!updated) throw new Error('Categoria não encontrada.');
      return updated;
    }
    const draft: Omit<BookCategory, 'id'> = {
      slug,
      name: input.name.trim(),
      description: input.description,
      order: input.order ?? 0,
      created_at: now,
    };
    return bookCategoryRepository.create(draft);
  }

  async deleteCategory(id: string): Promise<void> {
    return bookCategoryRepository.delete(id);
  }
}

export const libraryService = new LibraryService();
