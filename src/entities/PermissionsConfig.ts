import { BaseFirebaseService } from '@/services/firebase/BaseFirebaseService';

export interface PermissionsConfig {
  id: string; // O ID será o próprio nome da Role (ex: 'admin', 'missionario')
  display_name?: string; // Nome amigável para exibição (ex: 'Administrador', 'Missionário')
  features: string[];
  description?: string;
  updated_at?: string;
}

class PermissionsConfigService extends BaseFirebaseService<PermissionsConfig> {
  constructor() {
    super('permissions_config');
  }

  /**
   * Busca todas as configurações de permissões e as transforma em um objeto Record.
   */
  async getAllAsMap(): Promise<Record<string, string[]>> {
    const configs = await this.list();
    const map: Record<string, string[]> = {};
    configs.forEach(c => {
      map[c.id] = c.features;
    });
    return map;
  }
}

export const permissionsConfigService = new PermissionsConfigService();
