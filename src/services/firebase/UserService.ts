import { BaseFirebaseService } from './BaseFirebaseService';
import { FirebaseUser } from '@/types/firebase-entities';
import { Role } from '@/features/auth/types/user';

class UserService extends BaseFirebaseService<FirebaseUser> {
  constructor() {
    super('users');
  }

  /**
   * Busca usuário por email
   */
  async getUserByEmail(email: string): Promise<FirebaseUser | null> {
    const users = await this.queryByField('email', email);
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Busca usuários por role
   */
  async getUsersByRole(role: Role): Promise<FirebaseUser[]> {
    return this.queryByField('role', role);
  }

  /**
   * Busca recantianos de um missionário específico
   */
  async getRecantianosByMissionario(missionarioId: string): Promise<FirebaseUser[]> {
    return this.queryByField('missionario_responsavel_id', missionarioId);
  }

  /**
   * Busca filho recantiano de um pai
   */
  async getFilhoRecantiano(paiId: string): Promise<FirebaseUser | null> {
    const pai = await this.get(paiId);
    if (pai?.filho_recantiano_id) {
      return this.get(pai.filho_recantiano_id);
    }
    return null;
  }

  /**
   * Atualiza role do usuário
   */
  async updateRole(userId: string, role: Role): Promise<FirebaseUser | null> {
    return this.update(userId, { role } as Partial<FirebaseUser>);
  }

  /**
   * Vincula recantiano a missionário
   */
  async vincularRecantianoAMissionario(
    recantianoId: string,
    missionarioId: string
  ): Promise<FirebaseUser | null> {
    return this.update(recantianoId, {
      missionario_responsavel_id: missionarioId,
    } as Partial<FirebaseUser>);
  }

  /**
   * Vincula pai a filho recantiano
   */
  async vincularPaiAFilho(
    paiId: string,
    filhoRecantianoId: string
  ): Promise<FirebaseUser | null> {
    return this.update(paiId, {
      filho_recantiano_id: filhoRecantianoId,
    } as Partial<FirebaseUser>);
  }
}

export const userService = new UserService();
export default userService;
