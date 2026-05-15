import { Role } from '@/shared/types/role';

export type HabitCategory = 'oracao' | 'estudo' | 'caridade' | 'disciplina' | 'outro';

/**
 * Origem do hábito:
 * - 'user': criado pelo próprio usuário (livre, pode remover quando quiser)
 * - 'course': inserido por uma aula/curso (temporário; expira após `duration_days` ou ao concluir o curso)
 * - 'community': inserido por admin/formador como permanente para a comunidade (só formador/admin remove)
 */
export type HabitSource = 'user' | 'course' | 'community';

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
  /** Origem do hábito (default: 'user'). */
  source?: HabitSource;
  /** Para 'course' — ID da trilha/curso que inseriu o hábito. */
  course_id?: string;
  /** Para 'course' — ID da aula que adicionou (permite filtrar por aula). */
  lesson_id?: string;
  /** Quantidade de dias da prática temporária (ex: 3, 7, 12, 30). Vazio = permanente. */
  duration_days?: number;
  /**
   * Para hábitos de curso com requisito: % de dias completos exigido para liberar próxima aula.
   * Ex: 80 = aluno precisa cumprir 80% dos `duration_days` antes da aula desbloquear.
   */
  required_completion_percent?: number;
  /** ID do dono — null/undefined para community/course (visíveis pra todos com role). */
  owner_user_id?: string;
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
