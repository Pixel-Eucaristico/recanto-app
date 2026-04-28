import {
  wordSearchRepository,
  wordSearchResultRepository,
  IWordSearchRepository,
  IWordSearchResultRepository,
} from '@/infrastructure/word-search/WordSearchRepository';
import { WordSearchEntity } from '@/domain/word-search/entities/WordSearch';
import { WordSearchPuzzle, WordSearchResult } from '@/domain/word-search/types';

export interface SaveResultInput {
  userId: string;
  puzzleId: string;
  found: string[];
}

export interface SaveResultOutput {
  result: WordSearchResult;
  persisted: boolean;
}

export class WordSearchService {
  constructor(
    private readonly puzzleRepo: IWordSearchRepository = wordSearchRepository,
    private readonly resultRepo: IWordSearchResultRepository = wordSearchResultRepository,
  ) {}

  async getByLesson(lessonId: string): Promise<WordSearchPuzzle | null> {
    return this.puzzleRepo.findByLesson(lessonId);
  }

  async getById(id: string): Promise<WordSearchPuzzle | null> {
    return this.puzzleRepo.findById(id);
  }

  /**
   * 1ª conclusão persiste; retakes não.
   */
  async submitResult(input: SaveResultInput): Promise<SaveResultOutput> {
    const puzzle = await this.puzzleRepo.findById(input.puzzleId);
    if (!puzzle) throw new Error('Caça-palavras não encontrado.');

    const existing = await this.resultRepo.findByUserAndPuzzle(input.userId, input.puzzleId);
    const total = puzzle.words.length;
    const score = total > 0 ? Math.round((input.found.length / total) * 10000) / 100 : 0;

    if (existing.length > 0) {
      return {
        result: existing[0],
        persisted: false,
      };
    }

    const result = await this.resultRepo.create({
      user_id: input.userId,
      puzzle_id: input.puzzleId,
      lesson_id: puzzle.lesson_id,
      found: input.found,
      score,
      completed_at: new Date().toISOString(),
    });
    return { result, persisted: true };
  }

  async hasCompleted(userId: string, puzzleId: string): Promise<boolean> {
    const existing = await this.resultRepo.findByUserAndPuzzle(userId, puzzleId);
    return existing.length > 0;
  }

  async save(
    puzzle: WordSearchPuzzle | (Omit<WordSearchPuzzle, 'id' | 'grid' | 'placements'> & {
      id?: string;
      grid?: string[];
      placements?: WordSearchPuzzle['placements'];
    }),
  ): Promise<WordSearchPuzzle> {
    if (!puzzle.title?.trim() || puzzle.title.trim().length < 3) throw new Error('Título com no mínimo 3 caracteres.');
    if (!puzzle.words || puzzle.words.length < 2) throw new Error('Precisa de ao menos 2 palavras.');
    if (!puzzle.size || puzzle.size < 8 || puzzle.size > 20) throw new Error('Tamanho do grid entre 8 e 20.');

    // Sempre (re)gera grid ao salvar — garante consistência entre palavras e placements.
    const { grid, placements } = WordSearchEntity.generate(puzzle.words, puzzle.size);

    const payload = {
      ...puzzle,
      grid,
      placements,
    } as WordSearchPuzzle;

    if ('id' in puzzle && puzzle.id) {
      const { id, ...rest } = payload;
      const updated = await this.puzzleRepo.update(id, rest);
      if (!updated) throw new Error('Falha ao atualizar.');
      return updated;
    }
    return this.puzzleRepo.create(payload as Omit<WordSearchPuzzle, 'id'>);
  }

  async remove(id: string): Promise<void> {
    return this.puzzleRepo.remove(id);
  }
}

export const wordSearchService = new WordSearchService();
