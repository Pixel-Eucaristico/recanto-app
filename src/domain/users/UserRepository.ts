import type { Role } from '@/features/auth/types/user';
import type { FirebaseUser } from '@/types/firebase-entities';
import type { Repository } from '@/domain/shared/Repository';

export interface UserRepository extends Repository<FirebaseUser> {
  getUserByEmail(email: string): Promise<FirebaseUser | null>;
  getUsersByRole(role: Role): Promise<FirebaseUser[]>;
  getRecantianosByMissionario(missionarioId: string): Promise<FirebaseUser[]>;
  getFilhoRecantiano(paiId: string): Promise<FirebaseUser | null>;
  updateRole(userId: string, role: Role): Promise<FirebaseUser | null>;
  vincularRecantianoAMissionario(
    recantianoId: string,
    missionarioId: string,
  ): Promise<FirebaseUser | null>;
  vincularPaiAFilho(
    paiId: string,
    filhoRecantianoId: string,
  ): Promise<FirebaseUser | null>;
}
