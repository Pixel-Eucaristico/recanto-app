import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/domains/auth/services/firebaseClient';
import { MenuConfig } from '@/types/cms-types';

/**
 * Service para gerenciar configuração do menu navbar
 * Usa padrão Singleton - apenas um documento no Firestore
 */
class MenuConfigService {
  private readonly COLLECTION = 'menu_config';
  private readonly DOC_ID = 'main_menu';

  /**
   * Buscar configuração do menu
   * @returns MenuConfig ou null se não existir
   */
  async get(): Promise<MenuConfig | null> {
    try {
      const docRef = doc(firestore, this.COLLECTION, this.DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as MenuConfig;
      }

      return null;
    } catch (error) {
      console.error('Error getting menu config:', error);
      throw error;
    }
  }

  /**
   * Salvar ou atualizar configuração do menu
   * @param menuConfig - Configuração do menu (sem id)
   * @returns MenuConfig salvo
   */
  async save(menuConfig: Omit<MenuConfig, 'id'>): Promise<MenuConfig> {
    try {
      const docRef = doc(firestore, this.COLLECTION, this.DOC_ID);
      const now = new Date().toISOString();

      const existingDoc = await getDoc(docRef);

      // Limpar campos undefined recursivamente
      const cleanedItems = this.removeUndefinedFields(menuConfig.items);

      const data: MenuConfig = {
        id: this.DOC_ID,
        items: cleanedItems,
        is_published: menuConfig.is_published,
        created_at: existingDoc.exists() ? existingDoc.data().created_at : now,
        updated_at: now,
      };

      await setDoc(docRef, data);
      return data;
    } catch (error) {
      console.error('Error saving menu config:', error);
      throw error;
    }
  }

  /**
   * Remove campos undefined recursivamente
   */
  private removeUndefinedFields(items: any[]): any[] {
    return items.map(item => {
      const cleaned: any = {
        id: item.id,
        title: item.title,
        url: item.url,
        order: item.order,
      };

      // Adicionar campos opcionais apenas se não forem undefined
      if (item.description !== undefined) cleaned.description = item.description;
      if (item.icon !== undefined) cleaned.icon = item.icon;

      // Processar subitens recursivamente
      if (item.items !== undefined && Array.isArray(item.items)) {
        cleaned.items = this.removeUndefinedFields(item.items);
      }

      return cleaned;
    });
  }

  /**
   * Publicar menu (ativa o menu do CMS no site)
   */
  async publish(): Promise<void> {
    const config = await this.get();
    if (!config) throw new Error('Menu config not found');

    await this.save({ ...config, is_published: true });
  }

  /**
   * Despublicar menu (volta a usar routes_main.ts)
   */
  async unpublish(): Promise<void> {
    const config = await this.get();
    if (!config) throw new Error('Menu config not found');

    await this.save({ ...config, is_published: false });
  }

  /**
   * Criar menu inicial a partir do routes_main.ts
   */
  async initializeFromDefault(defaultMenu: any[]): Promise<MenuConfig> {
    const menuConfig: Omit<MenuConfig, 'id'> = {
      items: this.convertToMenuItems(defaultMenu),
      is_published: false,
      created_at: new Date().toISOString(),
    };

    return this.save(menuConfig);
  }

  /**
   * Converte estrutura do routes_main.ts para MenuConfig
   */
  private convertToMenuItems(items: any[], parentOrder = 0): any[] {
    return items.map((item, index) => {
      const menuItem: any = {
        id: this.generateId(),
        title: item.title,
        url: item.url || '#',
        order: parentOrder * 1000 + index,
      };

      // Adicionar campos opcionais apenas se existirem
      if (item.description) menuItem.description = item.description;
      if (item.icon?.name) menuItem.icon = item.icon.name;
      if (item.items && item.items.length > 0) {
        menuItem.items = this.convertToMenuItems(item.items, index);
      }

      return menuItem;
    });
  }

  /**
   * Gera ID único para item de menu
   */
  private generateId(): string {
    return `menu_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const menuConfigService = new MenuConfigService();
