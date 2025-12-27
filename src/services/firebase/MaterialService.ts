import { BaseFirebaseService } from './BaseFirebaseService';
import { Material } from '@/types/firebase-entities';
import { Role } from '@/features/auth/types/user';

class MaterialService extends BaseFirebaseService<Material> {
  constructor() {
    super('materials');
  }

  /**
   * Busca materiais por categoria
   */
  async getMaterialsByCategory(category: Material['category']): Promise<Material[]> {
    return this.queryByField('category', category);
  }

  /**
   * Busca materiais por tipo
   */
  async getMaterialsByType(type: Material['type']): Promise<Material[]> {
    return this.queryByField('type', type);
  }

  /**
   * Busca materiais acessíveis para um role específico
   * OTIMIZADO: Query direto no Firestore (impossível no Realtime Database!)
   */
  async getMaterialsByRole(role: Role): Promise<Material[]> {
    return this.queryWithFilters([
      { field: 'target_audience', operator: 'array-contains', value: role }
    ]);
  }

  /**
   * Busca materiais criados por um admin específico
   */
  async getMaterialsByCreator(creatorId: string): Promise<Material[]> {
    return this.queryByField('created_by', creatorId);
  }
}

export const materialService = new MaterialService();
export default materialService;
