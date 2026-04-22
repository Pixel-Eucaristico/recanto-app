import { Habit } from '@/domain/habits/types';
import { Role } from '@/shared/types/role';

export class HabitEntity {
  static validate(h: Habit): string[] {
    const errors: string[] = [];
    if (!h.title || h.title.trim().length === 0) errors.push('Título vazio.');
    if (!h.category) errors.push('Categoria vazia.');
    return errors;
  }

  /** Retorna habitos aplicáveis a uma role. */
  static filterByRole(habits: Habit[], role: Role): Habit[] {
    return habits.filter(h => {
      if (!h.required_for_roles || h.required_for_roles.length === 0) return true;
      return h.required_for_roles.includes(role);
    });
  }
}
