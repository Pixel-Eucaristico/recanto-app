import { BaseFirebaseService } from './BaseFirebaseService';
import { CMSPage } from '@/types/cms-types';

/**
 * Service para gerenciar páginas do CMS
 * Extends BaseFirebaseService para CRUD genérico
 */
class ContentPageService extends BaseFirebaseService<CMSPage> {
  constructor() {
    super('content_pages');
  }

  /**
   * Listar todas as páginas
   * Alias para list() com ordenação por data de criação
   */
  async getAll(): Promise<CMSPage[]> {
    return this.list('created_at', 'desc');
  }

  /**
   * Buscar página por slug
   * @param slug - URL da página (ex: "/sobre", "/")
   * @returns CMSPage ou null se não encontrada
   */
  async getBySlug(slug: string): Promise<CMSPage | null> {
    const pages = await this.queryByField('slug', slug);
    return pages[0] || null;
  }

  /**
   * Listar apenas páginas publicadas
   * @returns Array de páginas publicadas
   */
  async listPublished(): Promise<CMSPage[]> {
    return this.queryByField('is_published', true);
  }

  /**
   * Listar páginas públicas (sem controle de acesso)
   * @returns Array de páginas públicas
   */
  async listPublic(): Promise<CMSPage[]> {
    const pages = await this.listPublished();
    // Filtra páginas sem target_audience ou que incluem null (público)
    return pages.filter(p => !p.target_audience || p.target_audience.includes(null));
  }

  /**
   * Verificar se slug já existe
   * @param slug - Slug a verificar
   * @param excludeId - ID da página a excluir da verificação (útil para edição)
   * @returns true se slug já existe
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const pages = await this.queryByField('slug', slug);
    if (excludeId) {
      return pages.some(p => p.id !== excludeId);
    }
    return pages.length > 0;
  }
}

export const contentPageService = new ContentPageService();
