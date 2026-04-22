import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { CrosswordPuzzle, CrosswordResult } from '@/domain/crossword/types';

export interface ICrosswordRepository {
  findById(id: string): Promise<CrosswordPuzzle | null>;
  findByLesson(lessonId: string): Promise<CrosswordPuzzle | null>;
  create(data: Omit<CrosswordPuzzle, 'id'>): Promise<CrosswordPuzzle>;
  update(id: string, data: Partial<Omit<CrosswordPuzzle, 'id'>>): Promise<CrosswordPuzzle | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseCrosswordRepository
  extends BaseRepository<CrosswordPuzzle>
  implements ICrosswordRepository
{
  constructor() {
    super('crosswords');
  }

  async findById(id: string): Promise<CrosswordPuzzle | null> {
    return this.get(id);
  }

  async findByLesson(lessonId: string): Promise<CrosswordPuzzle | null> {
    const results = await this.queryByFilters([{ field: 'lesson_id', operator: '==', value: lessonId }]);
    return results[0] ?? null;
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export interface ICrosswordResultRepository {
  findByUserAndPuzzle(userId: string, puzzleId: string): Promise<CrosswordResult[]>;
  create(data: Omit<CrosswordResult, 'id'>): Promise<CrosswordResult>;
}

export class FirebaseCrosswordResultRepository
  extends BaseRepository<CrosswordResult>
  implements ICrosswordResultRepository
{
  constructor() {
    super('crossword_results');
  }

  async findByUserAndPuzzle(userId: string, puzzleId: string): Promise<CrosswordResult[]> {
    return this.queryByFilters(
      [
        { field: 'user_id', operator: '==', value: userId },
        { field: 'puzzle_id', operator: '==', value: puzzleId },
      ],
      { orderByField: 'completed_at', direction: 'desc' },
    );
  }
}

export const crosswordRepository = new FirebaseCrosswordRepository();
export const crosswordResultRepository = new FirebaseCrosswordResultRepository();
