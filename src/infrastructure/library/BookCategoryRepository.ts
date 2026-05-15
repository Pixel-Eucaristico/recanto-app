import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { BookCategory } from '@/domain/library/types';

export class BookCategoryRepository extends BaseRepository<BookCategory> {
  constructor() {
    super('library_book_categories');
  }

  async listAll(): Promise<BookCategory[]> {
    const list = await this.list();
    return [...list].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }
}

export const bookCategoryRepository = new BookCategoryRepository();
