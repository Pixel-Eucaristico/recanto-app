import { BaseFirebaseService } from './BaseFirebaseService';
import { ModConfig } from '@/types/cms-types';

/**
 * Service para gerenciar configurações dos Mods
 * (Opcional - Mods podem ser gerenciados diretamente no código)
 */
class ModConfigService extends BaseFirebaseService<ModConfig> {
  constructor() {
    super('mods_configs');
  }

  /**
   * Listar Mods por categoria
   * @param category - Categoria do Mod (hero, content, chart, etc.)
   * @returns Array de ModConfigs
   */
  async listByCategory(category: string): Promise<ModConfig[]> {
    return this.queryByField('category', category);
  }

  /**
   * Buscar Mod por ID
   * @param modId - ID do Mod
   * @returns ModConfig ou null
   */
  async getByModId(modId: string): Promise<ModConfig | null> {
    const configs = await this.queryByField('id', modId);
    return configs[0] || null;
  }
}

export const modConfigService = new ModConfigService();
