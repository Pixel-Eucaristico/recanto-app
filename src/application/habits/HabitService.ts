import { habitRepository } from '@/infrastructure/habits/HabitRepository';
import { habitLogRepository } from '@/infrastructure/habits/HabitLogRepository';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { Habit, HabitLog, HabitSource, HabitStreakInfo } from '@/domain/habits/types';
import { HabitStreakEntity, DEFAULT_GRACE_DAYS } from '@/domain/habits/entities/HabitStreak';
import { HabitEntity } from '@/domain/habits/entities/Habit';
import { Role } from '@/shared/types/role';

export interface SaveHabitInput {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  category: Habit['category'];
  required_for_roles: Role[];
  order?: number;
  grace_days?: number;
  created_by: string;
  source?: HabitSource;
  course_id?: string;
  lesson_id?: string;
  duration_days?: number;
  required_completion_percent?: number;
  owner_user_id?: string;
}

export class HabitService {
  async listForRole(role: Role): Promise<Habit[]> {
    const all = await habitRepository.listAll();
    return HabitEntity.filterByRole(all, role);
  }

  async listAll(): Promise<Habit[]> {
    return habitRepository.listAll();
  }

  async saveHabit(input: SaveHabitInput): Promise<Habit> {
    const now = new Date().toISOString();
    const graceDays = input.grace_days ?? DEFAULT_GRACE_DAYS;
    if (graceDays < 0) throw new Error('Janela de dias não pode ser negativa.');

    const draft: Habit = {
      id: input.id ?? '',
      title: input.title.trim(),
      description: input.description,
      icon: input.icon,
      category: input.category,
      required_for_roles: input.required_for_roles,
      order: input.order ?? 0,
      grace_days: graceDays,
      source: input.source,
      course_id: input.course_id,
      lesson_id: input.lesson_id,
      duration_days: input.duration_days,
      required_completion_percent: input.required_completion_percent,
      owner_user_id: input.owner_user_id,
      created_at: now,
      created_by: input.created_by,
    };
    const errors = HabitEntity.validate(draft);
    if (errors.length > 0) throw new Error(errors.join(' '));

    if (input.id) {
      const updated = await habitRepository.update(input.id, {
        title: draft.title,
        description: draft.description,
        icon: draft.icon,
        category: draft.category,
        required_for_roles: draft.required_for_roles,
        order: draft.order,
        grace_days: draft.grace_days,
        source: draft.source,
        course_id: draft.course_id,
        lesson_id: draft.lesson_id,
        duration_days: draft.duration_days,
        required_completion_percent: draft.required_completion_percent,
        owner_user_id: draft.owner_user_id,
      });
      if (!updated) throw new Error('Hábito não encontrado.');
      return updated;
    }
    const { id: _id, ...payload } = draft;
    return habitRepository.create(payload);
  }

  async deleteHabit(id: string): Promise<void> {
    return habitRepository.delete(id);
  }

  /**
   * Registra um dia específico (YYYY-MM-DD). Valida janela de grace do hábito.
   * Se `dateKey` omitido, usa hoje.
   */
  async logDate(habitId: string, userId: string, dateKey?: string): Promise<HabitLog> {
    const key = dateKey ?? HabitStreakEntity.todayKey();
    const habit = await habitRepository.get(habitId);
    if (!habit) throw new Error('Hábito não encontrado.');
    const grace = habit.grace_days ?? DEFAULT_GRACE_DAYS;
    if (!HabitStreakEntity.isWithinGrace(key, grace)) {
      throw new Error(`Fora da janela de ${grace} ${grace === 1 ? 'dia' : 'dias'} pra registrar.`);
    }
    return habitLogRepository.log(habitId, userId, key);
  }

  async unlogDate(habitId: string, userId: string, dateKey?: string): Promise<void> {
    const key = dateKey ?? HabitStreakEntity.todayKey();
    const habit = await habitRepository.get(habitId);
    if (!habit) throw new Error('Hábito não encontrado.');
    const grace = habit.grace_days ?? DEFAULT_GRACE_DAYS;
    if (!HabitStreakEntity.isWithinGrace(key, grace)) {
      throw new Error(`Fora da janela de ${grace} ${grace === 1 ? 'dia' : 'dias'} pra desmarcar.`);
    }
    await habitLogRepository.unlog(habitId, userId, key);
  }

  async isLogged(habitId: string, userId: string, dateKey?: string): Promise<boolean> {
    const key = dateKey ?? HabitStreakEntity.todayKey();
    return habitLogRepository.checkLogged(habitId, userId, key);
  }

  /** Retorna streak + todos logs (como Set de datas YYYY-MM-DD) por hábito. */
  async getStreaksForUser(
    userId: string,
    role: Role,
  ): Promise<{ habit: Habit; streak: HabitStreakInfo; loggedDays: Set<string> }[]> {
    const habits = await this.listForRole(role);
    const result = await Promise.all(
      habits.map(async h => {
        const logs = await habitLogRepository.findByUserAndHabit(userId, h.id);
        const streak = HabitStreakEntity.compute(h.id, logs);
        const loggedDays = new Set(logs.map(l => l.log_date));
        return { habit: h, streak, loggedDays };
      }),
    );
    return result;
  }

  /**
   * Hábitos relevantes pra um usuário, filtrados por escopo:
   * - 'community': só os permanentes da comunidade.
   * - 'course': só os do curso/trilha (course_id).
   * - 'mine': hábitos pessoais (owner_user_id == userId).
   * - 'all': community + cursos em que o user tem progresso + próprios.
   */
  async listForUserScoped(
    userId: string,
    role: Role,
    scope: 'community' | 'course' | 'mine' | 'all',
    courseId?: string,
  ): Promise<Habit[]> {
    if (scope === 'community') {
      const list = await habitRepository.findCommunity();
      return HabitEntity.filterByRole(list, role);
    }
    if (scope === 'course') {
      if (!courseId) return [];
      const list = await habitRepository.findByCourse(courseId);
      return HabitEntity.filterByRole(list, role);
    }
    if (scope === 'mine') {
      return habitRepository.findByOwner(userId);
    }
    // all: community + cursos do user + próprios
    const community = await habitRepository.findCommunity();
    const own = await habitRepository.findByOwner(userId);
    const userProgresses = await progressRepository.findByUser(userId);
    const trackIds = Array.from(new Set(userProgresses.map(p => p.track_id)));
    const courseHabitsArrays = await Promise.all(trackIds.map(id => habitRepository.findByCourse(id)));
    const courseHabits = courseHabitsArrays.flat();
    const merged = [...community, ...courseHabits, ...own];
    // Dedup por id
    const map = new Map<string, Habit>();
    for (const h of merged) map.set(h.id, h);
    return HabitEntity.filterByRole(Array.from(map.values()), role);
  }

  /**
   * % de dias completos do hábito dentro da janela `duration_days`.
   * Usado pelo unlock engine: aluno precisa cumprir `required_completion_percent`
   * antes da próxima aula liberar.
   */
  async getCompletionPercent(habitId: string, userId: string): Promise<number> {
    const habit = await habitRepository.get(habitId);
    if (!habit) return 0;
    const totalDays = habit.duration_days ?? 0;
    if (totalDays === 0) return 100; // permanente — sem janela, considera ok
    const logs = await habitLogRepository.findByUserAndHabit(userId, habitId);
    if (logs.length === 0) return 0;
    // Contar dias únicos dentro da janela desde criação do habit (ou primeiro log)
    const startDate = new Date(habit.created_at);
    const endDate = new Date(startDate.getTime() + totalDays * 86400000);
    const inWindow = new Set(
      logs
        .map(l => l.log_date)
        .filter(d => {
          const dt = new Date(d);
          return dt >= startDate && dt <= endDate;
        }),
    );
    return Math.round((inWindow.size / totalDays) * 100);
  }

  /** Verifica se gate do hábito está cumprido pra desbloquear próximo conteúdo. */
  async meetsCompletionGate(habitId: string, userId: string): Promise<boolean> {
    const habit = await habitRepository.get(habitId);
    if (!habit) return true;
    const required = habit.required_completion_percent ?? 0;
    if (required <= 0) return true;
    const actual = await this.getCompletionPercent(habitId, userId);
    return actual >= required;
  }
}

export const habitService = new HabitService();
