import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { Habit, HabitSource } from '@/domain/habits/types';

function sortHabits(list: Habit[]): Habit[] {
  return [...list].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export class HabitRepository extends BaseRepository<Habit> {
  constructor() {
    super('habits');
  }

  async listAll(): Promise<Habit[]> {
    return sortHabits(await this.list());
  }

  /** Hábitos da comunidade (permanentes, source = 'community' OU sem source = legado). */
  async findCommunity(): Promise<Habit[]> {
    const all = await this.list();
    return sortHabits(all.filter(h => !h.source || h.source === 'community'));
  }

  /** Hábitos inseridos por uma trilha específica. */
  async findByCourse(courseId: string): Promise<Habit[]> {
    return sortHabits(await this.queryByFilters([
      { field: 'course_id', operator: '==', value: courseId },
    ]));
  }

  /** Hábitos inseridos por uma aula específica. */
  async findByLesson(lessonId: string): Promise<Habit[]> {
    return sortHabits(await this.queryByFilters([
      { field: 'lesson_id', operator: '==', value: lessonId },
    ]));
  }

  /** Hábitos pessoais de um usuário (source='user' + owner). */
  async findByOwner(userId: string): Promise<Habit[]> {
    return sortHabits(await this.queryByFilters([
      { field: 'owner_user_id', operator: '==', value: userId },
    ]));
  }

  /** Hábitos por source. */
  async findBySource(source: HabitSource): Promise<Habit[]> {
    return sortHabits(await this.queryByFilters([
      { field: 'source', operator: '==', value: source },
    ]));
  }
}

export const habitRepository = new HabitRepository();
