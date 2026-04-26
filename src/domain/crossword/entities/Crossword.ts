import type { CrosswordClue, CrosswordEntry, CrosswordPuzzle } from '@/domain/crossword/types';
import { generateCrossword } from './crosswordGenerator';

export class CrosswordEntity {
  static normalize(s: string): string {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
  }

  static generate(clues: CrosswordClue[], padding = 1): { grid: string[]; entries: CrosswordEntry[]; size: number } {
    return generateCrossword(clues, padding);
  }

  /** Verifica se uma entry foi respondida corretamente dado as letras digitadas. */
  static isEntryCorrect(entry: CrosswordEntry, userGrid: string[][]): boolean {
    for (let i = 0; i < entry.answer.length; i++) {
      const r = entry.direction === 'across' ? entry.row : entry.row + i;
      const c = entry.direction === 'across' ? entry.col + i : entry.col;
      const userLetter = (userGrid[r]?.[c] ?? '').toUpperCase();
      if (userLetter !== entry.answer[i]) return false;
    }
    return true;
  }
}
