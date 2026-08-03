import { DirectusRepository } from '../DirectusRepository';
import type {
  Book,
  BookCategory,
  BookChapter,
  BookComment,
  BookHighlight,
  BookReadingProgress,
  BookTag,
  HighlightColor,
  TagColor,
} from '@/domain/library/types';
import type {
  BookCategoryRepositoryContract,
  BookChapterRepositoryContract,
  BookCommentRepositoryContract,
  BookHighlightRepositoryContract,
  BookReadingProgressRepositoryContract,
  BookRepositoryContract,
  BookTagRepositoryContract,
} from '@/domain/library/LibraryRepositories';

function progressId(userId: string, bookId: string): string {
  return `${userId}_${bookId}`;
}

export class DirectusBookRepository
  extends DirectusRepository<Book>
  implements BookRepositoryContract
{
  constructor() {
    super('books');
  }

  async listPublished(): Promise<Book[]> {
    const books = await this.findManyBy({ is_published: true }, 'title');
    return books.map(this.normalizeBook);
  }

  async listAll(): Promise<Book[]> {
    const books = await this.list('title', 'asc');
    return books.map(this.normalizeBook);
  }

  async findByCategory(categoryId: string): Promise<Book[]> {
    const books = await this.listAll();
    return books.filter(book => book.category_ids.includes(categoryId));
  }

  async findByIds(ids: string[]): Promise<Book[]> {
    if (ids.length === 0) return [];
    const books = await Promise.all(ids.map(id => this.get(id)));
    return books.filter((book): book is Book => Boolean(book)).map(this.normalizeBook);
  }

  findBySourceHash(hash: string): Promise<Book[]> {
    return this.findManyBy({ source_hash: hash });
  }

  findBySourceIdentifier(identifier: string): Promise<Book[]> {
    return this.findManyBy({ source_identifier: identifier });
  }

  findByIsbn(isbn: string): Promise<Book[]> {
    return this.findManyBy({ isbn });
  }

  findByDuplicateKey(key: string): Promise<Book[]> {
    return this.findManyBy({ duplicate_key: key });
  }

  private normalizeBook(book: Book): Book {
    return {
      ...book,
      category_ids: Array.isArray(book.category_ids) ? book.category_ids : [],
      tags: Array.isArray(book.tags) ? book.tags : [],
      required_roles: Array.isArray(book.required_roles) ? book.required_roles : [],
      age_rating: book.age_rating ?? 'L',
    };
  }
}

export class DirectusBookCategoryRepository
  extends DirectusRepository<BookCategory>
  implements BookCategoryRepositoryContract
{
  constructor() {
    super('book_categories');
  }

  listAll(): Promise<BookCategory[]> {
    return this.list('order', 'asc');
  }
}

export class DirectusBookChapterRepository
  extends DirectusRepository<BookChapter>
  implements BookChapterRepositoryContract
{
  constructor() {
    super('book_chapters');
  }

  async upsert(chapter: BookChapter): Promise<BookChapter> {
    if (chapter.id) {
      return (await this.update(chapter.id, chapter)) ?? chapter;
    }

    const { id: _id, ...data } = chapter;
    return this.create(data);
  }

  get(id: string): Promise<BookChapter | null>;
  get(bookId: string, order: number): Promise<BookChapter | null>;
  async get(bookIdOrId: string, order?: number): Promise<BookChapter | null> {
    if (order === undefined) return super.get(bookIdOrId);
    const bookId = bookIdOrId;
    return this.findOneBy({ book_id: bookId, order });
  }

  findByBook(bookId: string): Promise<BookChapter[]> {
    return this.findManyBy({ book_id: bookId }, 'order');
  }

  delete(id: string): Promise<void>;
  delete(bookId: string, order: number): Promise<void>;
  async delete(bookIdOrId: string, order?: number): Promise<void> {
    if (order === undefined) {
      await super.delete(bookIdOrId);
      return;
    }
    const bookId = bookIdOrId;
    const chapter = await this.get(bookId, order);
    if (chapter) await super.delete(chapter.id);
  }

  deleteById(id: string): Promise<void> {
    return super.delete(id);
  }

  async deleteAllByBook(bookId: string): Promise<void> {
    const chapters = await this.findByBook(bookId);
    await Promise.all(chapters.map(chapter => super.delete(chapter.id)));
  }
}

export class DirectusBookReadingProgressRepository
  extends DirectusRepository<BookReadingProgress>
  implements BookReadingProgressRepositoryContract
{
  constructor() {
    super('book_reading_progress');
  }

  get(id: string): Promise<BookReadingProgress | null>;
  get(userId: string, bookId: string): Promise<BookReadingProgress | null>;
  get(userIdOrId: string, bookId?: string): Promise<BookReadingProgress | null> {
    if (bookId === undefined) return super.get(userIdOrId);
    const userId = userIdOrId;
    return super.get(progressId(userId, bookId));
  }

  findByUser(userId: string): Promise<BookReadingProgress[]> {
    return this.findManyBy({ user_id: userId }, '-updated_at');
  }

  async upsert(progress: Omit<BookReadingProgress, 'id'>): Promise<BookReadingProgress> {
    const id = progressId(progress.user_id, progress.book_id);
    const existing = await super.get(id);
    const now = new Date().toISOString();
    const next: BookReadingProgress = {
      id,
      ...existing,
      ...progress,
      updated_at: now,
      started_at: existing?.started_at ?? progress.started_at ?? now,
      highlights_count: existing?.highlights_count ?? progress.highlights_count ?? 0,
      notes_count: existing?.notes_count ?? progress.notes_count ?? 0,
    };

    if (existing) return (await this.update(id, next)) ?? next;
    return this.create(next);
  }

  async updateHighlightCount(userId: string, bookId: string, delta: 1 | -1): Promise<void> {
    await this.incrementCounter(userId, bookId, 'highlights_count', delta);
  }

  async updateNotesCount(userId: string, bookId: string, delta: 1 | -1): Promise<void> {
    await this.incrementCounter(userId, bookId, 'notes_count', delta);
  }

  private async incrementCounter(
    userId: string,
    bookId: string,
    field: 'highlights_count' | 'notes_count',
    delta: 1 | -1,
  ): Promise<void> {
    const current = await this.get(userId, bookId);
    const base = current ?? {
      id: progressId(userId, bookId),
      user_id: userId,
      book_id: bookId,
      last_chapter_order: 1,
      percent: 0,
      updated_at: new Date().toISOString(),
    } as BookReadingProgress;

    await this.upsert({
      ...base,
      [field]: Math.max(0, (base[field] ?? 0) + delta),
    });
  }
}

export class DirectusBookHighlightRepository
  extends DirectusRepository<BookHighlight>
  implements BookHighlightRepositoryContract
{
  constructor() {
    super('book_highlights');
  }

  add(
    userId: string,
    bookId: string,
    ref: string,
    color: HighlightColor,
    selectedText?: string,
    occurrenceIndex?: number,
  ): Promise<BookHighlight> {
    return this.create({
      user_id: userId,
      book_id: bookId,
      ref,
      color,
      selected_text: selectedText,
      occurrence_index: occurrenceIndex,
      created_at: new Date().toISOString(),
    } as Omit<BookHighlight, 'id'>);
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }

  findByUserAndBook(userId: string, bookId: string): Promise<BookHighlight[]> {
    return this.findManyBy({ user_id: userId, book_id: bookId }, 'created_at');
  }

  findByUser(userId: string): Promise<BookHighlight[]> {
    return this.findManyBy({ user_id: userId }, '-created_at');
  }
}

export class DirectusBookCommentRepository
  extends DirectusRepository<BookComment>
  implements BookCommentRepositoryContract
{
  constructor() {
    super('book_comments');
  }

  add(userId: string, bookId: string, ref: string, text: string): Promise<BookComment> {
    return this.create({
      user_id: userId,
      book_id: bookId,
      ref,
      text,
      created_at: new Date().toISOString(),
    } as Omit<BookComment, 'id'>);
  }

  update(id: string, data: Partial<Omit<BookComment, 'id'>>): Promise<BookComment | null>;
  update(id: string, text: string): Promise<void>;
  async update(
    id: string,
    dataOrText: Partial<Omit<BookComment, 'id'>> | string,
  ): Promise<BookComment | null | void> {
    if (typeof dataOrText === 'string') {
      await super.update(id, { text: dataOrText });
      return;
    }
    return super.update(id, dataOrText);
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }

  findByUserAndBook(userId: string, bookId: string): Promise<BookComment[]> {
    return this.findManyBy({ user_id: userId, book_id: bookId }, 'created_at');
  }

  findByUser(userId: string): Promise<BookComment[]> {
    return this.findManyBy({ user_id: userId }, '-created_at');
  }
}

export class DirectusBookTagRepository
  extends DirectusRepository<BookTag>
  implements BookTagRepositoryContract
{
  constructor() {
    super('book_tags');
  }

  add(
    userId: string,
    bookId: string,
    chapterOrder: number,
    text: string,
    color: TagColor,
    ref?: string,
  ): Promise<BookTag> {
    return this.create({
      user_id: userId,
      book_id: bookId,
      chapter_order: chapterOrder,
      ref,
      text,
      color,
      created_at: new Date().toISOString(),
    } as Omit<BookTag, 'id'>);
  }

  update(id: string, data: Partial<Omit<BookTag, 'id'>>): Promise<BookTag | null>;
  update(id: string, text: string, color: TagColor): Promise<void>;
  async update(
    id: string,
    dataOrText: Partial<Omit<BookTag, 'id'>> | string,
    color?: TagColor,
  ): Promise<BookTag | null | void> {
    if (typeof dataOrText === 'string') {
      await super.update(id, { text: dataOrText, color });
      return;
    }
    return super.update(id, dataOrText);
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }

  findByUserAndBook(userId: string, bookId: string): Promise<BookTag[]> {
    return this.findManyBy({ user_id: userId, book_id: bookId }, 'chapter_order,created_at');
  }
}

export const directusBookRepository = new DirectusBookRepository();
export const directusBookCategoryRepository = new DirectusBookCategoryRepository();
export const directusBookChapterRepository = new DirectusBookChapterRepository();
export const directusBookReadingProgressRepository = new DirectusBookReadingProgressRepository();
export const directusBookHighlightRepository = new DirectusBookHighlightRepository();
export const directusBookCommentRepository = new DirectusBookCommentRepository();
export const directusBookTagRepository = new DirectusBookTagRepository();
