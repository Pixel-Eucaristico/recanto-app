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
} from './types';
import type { Repository } from '@/domain/shared/Repository';

export interface BookRepositoryContract extends Repository<Book> {
  listPublished(): Promise<Book[]>;
  listAll(): Promise<Book[]>;
  findByCategory(categoryId: string): Promise<Book[]>;
  findByIds(ids: string[]): Promise<Book[]>;
  findBySourceHash(hash: string): Promise<Book[]>;
  findBySourceIdentifier(identifier: string): Promise<Book[]>;
  findByIsbn(isbn: string): Promise<Book[]>;
  findByDuplicateKey(key: string): Promise<Book[]>;
}

export interface BookCategoryRepositoryContract extends Repository<BookCategory> {
  listAll(): Promise<BookCategory[]>;
}

export interface BookChapterRepositoryContract {
  upsert(chapter: BookChapter): Promise<BookChapter>;
  get(bookId: string, order: number): Promise<BookChapter | null>;
  findByBook(bookId: string): Promise<BookChapter[]>;
  delete(bookId: string, order: number): Promise<void>;
  deleteById(id: string): Promise<void>;
  deleteAllByBook(bookId: string): Promise<void>;
}

export interface BookReadingProgressRepositoryContract {
  get(userId: string, bookId: string): Promise<BookReadingProgress | null>;
  findByUser(userId: string): Promise<BookReadingProgress[]>;
  upsert(progress: Omit<BookReadingProgress, 'id'>): Promise<BookReadingProgress>;
  updateHighlightCount(userId: string, bookId: string, delta: 1 | -1): Promise<void>;
  updateNotesCount(userId: string, bookId: string, delta: 1 | -1): Promise<void>;
}

export interface BookHighlightRepositoryContract {
  add(
    userId: string,
    bookId: string,
    ref: string,
    color: HighlightColor,
    selectedText?: string,
    occurrenceIndex?: number,
  ): Promise<BookHighlight>;
  remove(id: string): Promise<void>;
  findByUserAndBook(userId: string, bookId: string): Promise<BookHighlight[]>;
  findByUser(userId: string): Promise<BookHighlight[]>;
}

export interface BookCommentRepositoryContract {
  add(userId: string, bookId: string, ref: string, text: string): Promise<BookComment>;
  update(id: string, text: string): Promise<void>;
  remove(id: string): Promise<void>;
  findByUserAndBook(userId: string, bookId: string): Promise<BookComment[]>;
  findByUser(userId: string): Promise<BookComment[]>;
}

export interface BookTagRepositoryContract {
  add(
    userId: string,
    bookId: string,
    chapterOrder: number,
    text: string,
    color: TagColor,
    ref?: string,
  ): Promise<BookTag>;
  update(id: string, text: string, color: TagColor): Promise<void>;
  remove(id: string): Promise<void>;
  findByUserAndBook(userId: string, bookId: string): Promise<BookTag[]>;
}
