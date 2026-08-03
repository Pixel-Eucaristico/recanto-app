import { DirectusRepository } from '../DirectusRepository';
import type { Role } from '@/features/auth/types/user';
import type { UserRepository } from '@/domain/users/UserRepository';
import type { FirebaseUser } from '@/types/firebase-entities';

export class DirectusUserRepository
  extends DirectusRepository<FirebaseUser>
  implements UserRepository
{
  constructor() {
    super('app_users');
  }

  getUserByEmail(email: string): Promise<FirebaseUser | null> {
    return this.findOneBy({ email });
  }

  getUsersByRole(role: Role): Promise<FirebaseUser[]> {
    return this.findManyBy({ role });
  }

  getRecantianosByMissionario(missionarioId: string): Promise<FirebaseUser[]> {
    return this.findManyBy({ missionario_responsavel_id: missionarioId });
  }

  async getFilhoRecantiano(paiId: string): Promise<FirebaseUser | null> {
    const pai = await this.get(paiId);
    if (!pai?.filho_recantiano_id) return null;
    return this.get(pai.filho_recantiano_id);
  }

  updateRole(userId: string, role: Role): Promise<FirebaseUser | null> {
    return this.update(userId, { role } as Partial<Omit<FirebaseUser, 'id'>>);
  }

  vincularRecantianoAMissionario(
    recantianoId: string,
    missionarioId: string,
  ): Promise<FirebaseUser | null> {
    return this.update(recantianoId, {
      missionario_responsavel_id: missionarioId,
    } as Partial<Omit<FirebaseUser, 'id'>>);
  }

  vincularPaiAFilho(
    paiId: string,
    filhoRecantianoId: string,
  ): Promise<FirebaseUser | null> {
    return this.update(paiId, {
      filho_recantiano_id: filhoRecantianoId,
    } as Partial<Omit<FirebaseUser, 'id'>>);
  }
}

export const directusUserRepository = new DirectusUserRepository();
