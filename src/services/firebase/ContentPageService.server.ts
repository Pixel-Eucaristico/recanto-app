import { firestore } from '@/domains/auth/services/firebaseAdmin';
import { CMSPage } from '@/types/cms-types';

/**
 * Service SERVIDOR para páginas CMS
 * Usa Firebase Admin SDK - SEM necessidade de autenticação
 * Use APENAS em Server Components e API Routes
 */
class ContentPageServerService {
  private collectionName = 'content_pages';

  /**
   * Buscar página por slug (Server-side com Admin SDK)
   * @param slug - URL da página (ex: "/sobre", "/vocacional")
   * @returns CMSPage ou null se não encontrada
   */
  async getBySlug(slug: string): Promise<CMSPage | null> {
    try {
      const snapshot = await firestore
        .collection(this.collectionName)
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as CMSPage;
    } catch (error) {
      console.error(`Erro ao buscar página com slug "${slug}":`, error);
      return null;
    }
  }

  /**
   * Listar apenas páginas publicadas
   * @returns Array de páginas publicadas
   */
  async listPublished(): Promise<CMSPage[]> {
    try {
      const snapshot = await firestore
        .collection(this.collectionName)
        .where('is_published', '==', true)
        .orderBy('created_at', 'desc')
        .get();

      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as CMSPage));
    } catch (error) {
      console.error('Erro ao listar páginas publicadas:', error);
      return [];
    }
  }

  /**
   * Buscar página por ID
   * @param pageId - ID do documento
   * @returns CMSPage ou null
   */
  async getById(pageId: string): Promise<CMSPage | null> {
    try {
      const docSnap = await firestore
        .collection(this.collectionName)
        .doc(pageId)
        .get();

      if (!docSnap.exists) {
        return null;
      }

      return { id: docSnap.id, ...docSnap.data() } as CMSPage;
    } catch (error) {
      console.error('Erro ao buscar página por ID:', error);
      return null;
    }
  }
}

export const contentPageServerService = new ContentPageServerService();
