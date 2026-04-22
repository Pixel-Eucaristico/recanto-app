import { Role } from '@/shared/types/role';

export type HabitCategory = 'oracao' | 'estudo' | 'caridade' | 'disciplina' | 'outro';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category: HabitCategory;
  /** Roles que devem registrar esse hábito. Vazio = sem restrição (qualquer pode logar). */
  required_for_roles: Role[];
  order: number;
  /**
   * Janela em dias pra registrar retroativamente. Se o usuário esqueceu,
   * pode marcar até `grace_days` dias atrás. Passou disso, não dá mais pra registrar.
   * Default 3. Admin pode aumentar/diminuir por hábito.
   */
  grace_days?: number;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  /** YYYY-MM-DD no fuso do usuário (cliente grava). */
  log_date: string;
  logged_at: string;
}

export interface HabitStreakInfo {
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  /** Dias desde o último registro. 0 = registrado hoje. */
  days_since_last: number;
  last_log_date?: string;
}
