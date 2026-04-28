import {
  crosswordRepository,
  crosswordResultRepository,
  ICrosswordRepository,
  ICrosswordResultRepository,
} from '@/infrastructure/crossword/CrosswordRepository';
import { CrosswordEntity } from '@/domain/crossword/entities/Crossword';
import { CrosswordPuzzle, CrosswordResult, CrosswordClue } from '@/domain/crossword/types';

export interface SaveCrosswordInput {
  id?: string;
  lesson_id: string;
  title: string;
  description?: string;
  clues: CrosswordClue[];
  created_at?: string;
  created_by: string;
}

export interface SubmitCrosswordInput {
  userId: string;
  puzzleId: string;
  correctEntries: number[];
  totalEntries: number;
}

export class CrosswordService {
  constructor(
    private readonly puzzleRepo: ICrosswordRepository = crosswordRepository,
    private readonly resultRepo: ICrosswordResultRepository = crosswordResultRepository,
  ) {}

  async getByLesson(lessonId: string): Promise<CrosswordPuzzle | null> {
    return this.puzzleRepo.findByLesson(lessonId);
  }

  async getById(id: string): Promise<CrosswordPuzzle | null> {
    return this.puzzleRepo.findById(id);
  }

  async save(input: SaveCrosswordInput): Promise<CrosswordPuzzle> {
    if (!input.title?.trim() || input.title.trim().length < 3) {
      throw new Error('Título com no mínimo 3 caracteres.');
    }
    if (!input.clues || input.clues.length < 2) {
      throw new Error('Precisa de ao menos 2 pares clue+answer.');
    }
    const { grid, entries, size } = CrosswordEntity.generate(input.clues);
    const payload: Omit<CrosswordPuzzle, 'id'> = {
      lesson_id: input.lesson_id,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      size,
      grid,
      entries,
      created_at: input.created_at ?? new Date().toISOString(),
      created_by: input.created_by,
    };
    if (input.id) {
      const updated = await this.puzzleRepo.update(input.id, payload);
      if (!updated) throw new Error('Falha ao atualizar.');
      return updated;
    }
    return this.puzzleRepo.create(payload);
  }

  async submitResult(input: SubmitCrosswordInput): Promise<{ result: CrosswordResult; persisted: boolean }> {
    const existing = await this.resultRepo.findByUserAndPuzzle(input.userId, input.puzzleId);
    const score = input.totalEntries > 0
      ? Math.round((input.correctEntries.length / input.totalEntries) * 10000) / 100
      : 0;
    if (existing.length > 0) {
      return { result: existing[0], persisted: false };
    }
    const puzzle = await this.puzzleRepo.findById(input.puzzleId);
    if (!puzzle) throw new Error('Crossword não encontrado.');
    const result = await this.resultRepo.create({
      user_id: input.userId,
      puzzle_id: input.puzzleId,
      lesson_id: puzzle.lesson_id,
      correct_entries: input.correctEntries,
      score,
      completed_at: new Date().toISOString(),
    });
    return { result, persisted: true };
  }

  async remove(id: string): Promise<void> {
    return this.puzzleRepo.remove(id);
  }
}

export const crosswordService = new CrosswordService();
