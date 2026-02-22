import { BaseFirebaseService } from '@/services/firebase/BaseFirebaseService';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/domains/auth/services/firebaseClient';

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
   * Sobrescreve o método de update usando setDoc com merge=true.
   * Isso previne o erro de 'not found' quando o admin salva um grupo 
   * default pela primeira vez no Firestore.
   */
  async update(id: string, data: Partial<PermissionsConfig>): Promise<PermissionsConfig | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      // Remover propriedades undefined
      Object.keys(updateData).forEach(
        key => updateData[key] === undefined && delete updateData[key]
      );

      await setDoc(docRef, updateData, { merge: true });
      return this.get(id);
    } catch (error) {
      console.error(`Error updating permissions_config/${id}:`, error);
      throw error;
    }
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
