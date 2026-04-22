import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { Habit } from '@/domain/habits/types';

export class HabitRepository extends BaseRepository<Habit> {
  constructor() {
    super('habits');
  }

  async listAll(): Promise<Habit[]> {
    const list = await this.list();
    return [...list].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }
}

export const habitRepository = new HabitRepository();
