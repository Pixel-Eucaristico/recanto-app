import { userService } from '@/services/firebase';
import { FirebaseUser } from '@/types/firebase-entities';
import { Role } from '@/features/auth/types/user';

export interface User {
  id?: string
  name: string
  email: string
  role?: string
  created_at?: string
}

export class User {
  static async list(orderBy?: string): Promise<FirebaseUser[]> {
    return userService.list(orderBy);
  }

  static async get(id: string): Promise<FirebaseUser | null> {
    return userService.get(id);
  }

  static async create(data: Omit<FirebaseUser, 'id' | 'created_at'>): Promise<FirebaseUser> {
    return userService.create(data);
  }

  static async update(id: string, data: Partial<FirebaseUser>): Promise<FirebaseUser | null> {
    return userService.update(id, data);
  }

  static async delete(id: string): Promise<void> {
    return userService.delete(id);
  }

  static async getUserByEmail(email: string): Promise<FirebaseUser | null> {
    return userService.getUserByEmail(email);
  }

  static async getUsersByRole(role: Role): Promise<FirebaseUser[]> {
    return userService.getUsersByRole(role);
  }
}
