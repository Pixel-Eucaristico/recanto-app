import { bookCategoryRepository } from '@/infrastructure/library/BookCategoryRepository';
import type { BookCategory } from '@/domain/library/types';

export interface SaveCategoryInput {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  order?: number;
}

export class LibraryCategoryService {
  async listCategories(): Promise<BookCategory[]> {
    return bookCategoryRepository.listAll();
  }

  async saveCategory(input: SaveCategoryInput): Promise<BookCategory> {
    const now = new Date().toISOString();
    const slug = input.slug.trim().toLowerCase();
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error('Slug inválido (use letras minúsculas, números e hífen).');
    if (!input.name || input.name.trim().length === 0) throw new Error('Nome da categoria vazio.');

    if (input.id) {
      const updated = await bookCategoryRepository.update(input.id, {
        slug, name: input.name.trim(), description: input.description, order: input.order ?? 0,
      });
      if (!updated) throw new Error('Categoria não encontrada.');
      return updated;
    }

    return bookCategoryRepository.create({
      slug, name: input.name.trim(), description: input.description, order: input.order ?? 0, created_at: now,
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return bookCategoryRepository.delete(id);
  }
}

export const libraryCategoryService = new LibraryCategoryService();
