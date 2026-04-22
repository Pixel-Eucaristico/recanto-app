import { habitRepository } from '@/infrastructure/habits/HabitRepository';
import { habitLogRepository } from '@/infrastructure/habits/HabitLogRepository';
import { Habit, HabitLog, HabitStreakInfo } from '@/domain/habits/types';
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
}

export const habitService = new HabitService();
