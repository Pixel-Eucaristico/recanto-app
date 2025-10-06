import { database } from './firebaseClient';
import { ref, set, get, child } from 'firebase/database';
import { Role } from '@/features/auth/types/user';

/**
 * Serviço para gerenciar cargos de usuários no Firebase Realtime Database
 */
const userRoleService = {
  /**
   * Define o cargo de um usuário
   * @param userId ID do usuário
   * @param role Cargo do usuário
   */
  async setUserRole(userId: string, role: Role): Promise<void> {
    try {
      const userRoleRef = ref(database, `users/${userId}/role`);
      await set(userRoleRef, role);
    } catch (error) {
      console.error('Erro ao definir cargo do usuário:', error);
      throw error;
    }
  },

  /**
   * Obtém o cargo de um usuário
   * @param userId ID do usuário
   * @returns Cargo do usuário ou null se não existir
   */
  async getUserRole(userId: string): Promise<Role | null> {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${userId}/role`));
      
      if (snapshot.exists()) {
        return snapshot.val() as Role;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao obter cargo do usuário:', error);
      return null;
    }
  },

  /**
   * Verifica se um usuário tem um determinado cargo
   * @param userId ID do usuário
   * @param role Cargo a verificar
   * @returns true se o usuário tiver o cargo, false caso contrário
   */
  async hasRole(userId: string, role: Role): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return userRole === role;
  },

  /**
   * Verifica se um usuário é administrador
   * @param userId ID do usuário
   * @returns true se o usuário for administrador, false caso contrário
   */
  async isAdmin(userId: string): Promise<boolean> {
    return await this.hasRole(userId, 'admin');
  }
};

export default userRoleService;