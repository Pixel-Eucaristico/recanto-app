import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { Book } from '@/domain/library/types';

export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super('library_books');
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
}

export const bookRepository = new BookRepository();
