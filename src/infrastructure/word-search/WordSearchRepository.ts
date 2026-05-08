import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { WordSearchPuzzle, WordSearchResult } from '@/domain/word-search/types';

export interface IWordSearchRepository {
  findById(id: string): Promise<WordSearchPuzzle | null>;
  findByLesson(lessonId: string): Promise<WordSearchPuzzle | null>;
  create(data: Omit<WordSearchPuzzle, 'id'>): Promise<WordSearchPuzzle>;
  update(id: string, data: Partial<Omit<WordSearchPuzzle, 'id'>>): Promise<WordSearchPuzzle | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseWordSearchRepository
  extends BaseRepository<WordSearchPuzzle>
  implements IWordSearchRepository
{
  constructor() {
    super('word_searches');
  }

  async findById(id: string): Promise<WordSearchPuzzle | null> {
    return this.get(id);
  }

  async findByLesson(lessonId: string): Promise<WordSearchPuzzle | null> {
    const results = await this.queryByFilters([{ field: 'lesson_id', operator: '==', value: lessonId }]);
    return results[0] ?? null;
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export interface IWordSearchResultRepository {
  findByUserAndPuzzle(userId: string, puzzleId: string): Promise<WordSearchResult[]>;
  create(data: Omit<WordSearchResult, 'id'>): Promise<WordSearchResult>;
}

export class FirebaseWordSearchResultRepository
  extends BaseRepository<WordSearchResult>
  implements IWordSearchResultRepository
{
  constructor() {
    super('word_search_results');
  }

  async findByUserAndPuzzle(userId: string, puzzleId: string): Promise<WordSearchResult[]> {
    const all = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'puzzle_id', operator: '==', value: puzzleId },
    ]);
    return all.sort((a, b) => b.completed_at.localeCompare(a.completed_at));
  }
}

export const wordSearchRepository = new FirebaseWordSearchRepository();
export const wordSearchResultRepository = new FirebaseWordSearchResultRepository();
