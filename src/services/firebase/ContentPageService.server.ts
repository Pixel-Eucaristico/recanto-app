// WORKAROUND: Usando Client SDK até resolver credenciais Admin
// import { firestore } from '@/domains/auth/services/firebaseAdmin';
import { firestore } from '@/domains/auth/services/firebaseClient';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getDoc,
  doc,
} from 'firebase/firestore';
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
      console.log(`🔥 [SERVER] Buscando página com slug: "${slug}"`);

      const q = query(
        collection(firestore, this.collectionName),
        where('slug', '==', slug),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log(`❌ [SERVER] Nenhuma página encontrada com slug: "${slug}"`);
        return null;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data() as Omit<CMSPage, 'id'>;

      const page: CMSPage = {
        id: docSnap.id,
        ...data,
      };

      console.log(`✅ [SERVER] Página encontrada:`, {
        id: page.id,
        slug: page.slug,
        title: page.title,
        is_published: page.is_published,
        blocks: page.blocks?.length || 0,
      });

      return page;
    } catch (error) {
      console.error(`❌ [SERVER] Erro ao buscar página:`, error);
      return null;
    }
  }

  /**
   * Listar apenas páginas publicadas
   * @returns Array de páginas publicadas
   */
  async listPublished(): Promise<CMSPage[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('is_published', '==', true),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);

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
      const docRef = doc(firestore, this.collectionName, pageId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as CMSPage;
    } catch (error) {
      console.error('Erro ao buscar página por ID:', error);
      return null;
    }
  }
}

export const contentPageServerService = new ContentPageServerService();
