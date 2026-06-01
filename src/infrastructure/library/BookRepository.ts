import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { Book } from '@/domain/library/types';

export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super('library_books');
  }

  protected deserialize(id: string, data: Record<string, unknown>): Book {
    const raw = { id, ...data } as Book;
    return {
      ...raw,
      required_roles: Array.isArray(raw.required_roles) ? raw.required_roles : [],
      age_rating: raw.age_rating ?? 'L',
    };
  }

  async listPublished(): Promise<Book[]> {
    const list = await this.queryByFilters([
      { field: 'is_published', operator: '==', value: true },
    ]);
    return [...list].sort((a, b) => a.title.localeCompare(b.title));
  }

  async listAll(): Promise<Book[]> {
    const list = await this.list();
    return [...list].sort((a, b) => a.title.localeCompare(b.title));
  }

  async findByCategory(categoryId: string): Promise<Book[]> {
    return this.queryByFilters([
      { field: 'category_ids', operator: 'array-contains', value: categoryId },
    ]);
  }

  async findByIds(ids: string[]): Promise<Book[]> {
    if (ids.length === 0) return [];
    const docs = await Promise.all(ids.map(id => this.get(id)));
    return docs.filter((d): d is Book => d !== null);
  }

  async findBySourceHash(hash: string): Promise<Book[]> {
    return this.queryByFilters([{ field: 'source_hash', operator: '==', value: hash }], { limitCount: 1 });
  }

  async findBySourceIdentifier(identifier: string): Promise<Book[]> {
    return this.queryByFilters([{ field: 'source_identifier', operator: '==', value: identifier }], { limitCount: 1 });
  }

  async findByIsbn(isbn: string): Promise<Book[]> {
    return this.queryByFilters([{ field: 'isbn', operator: '==', value: isbn }], { limitCount: 1 });
  }

  async findByDuplicateKey(key: string): Promise<Book[]> {
    return this.queryByFilters([{ field: 'duplicate_key', operator: '==', value: key }], { limitCount: 1 });
  }
}

export const bookRepository = new BookRepository();
