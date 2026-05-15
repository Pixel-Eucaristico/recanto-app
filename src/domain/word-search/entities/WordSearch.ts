import { WordDirection, WordPlacement } from '@/domain/word-search/types';

const DIRECTIONS: Array<{ kind: WordDirection; dr: number; dc: number }> = [
  { kind: 'horizontal', dr: 0, dc: 1 },
  { kind: 'horizontal-reverse', dr: 0, dc: -1 },
  { kind: 'vertical', dr: 1, dc: 0 },
  { kind: 'vertical-reverse', dr: -1, dc: 0 },
  { kind: 'diagonal-down', dr: 1, dc: 1 },
  { kind: 'diagonal-down-reverse', dr: 1, dc: -1 },
  { kind: 'diagonal-up', dr: -1, dc: 1 },
  { kind: 'diagonal-up-reverse', dr: -1, dc: -1 },
];

function norm(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacríticos
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

function randomLetter(): string {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export class WordSearchEntity {
  static normalizeWord(word: string): string {
    return norm(word);
  }

  static minGridSize(words: string[]): number {
    const longest = Math.max(0, ...words.map(w => norm(w).length));
    return Math.max(longest + 2, 10);
  }

  /**
   * Gera grid NxN com as palavras posicionadas em direções aleatórias.
   * Tenta múltiplas vezes por palavra; se não couber, lança erro.
   */
  static generate(words: string[], size: number): { grid: string[]; placements: WordPlacement[] } {
    const normalized = words.map(norm).filter(w => w.length >= 2);
    const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
    const placements: WordPlacement[] = [];

    // Palavras mais longas primeiro (mais difíceis de encaixar)
    const sorted = [...normalized].sort((a, b) => b.length - a.length);

    for (const word of sorted) {
      let placed = false;
      const maxAttempts = 200;
      const dirs = shuffle(DIRECTIONS);

      for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
        const dir = dirs[attempt % dirs.length];
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        // Checar limites
        const endRow = row + dir.dr * (word.length - 1);
        const endCol = col + dir.dc * (word.length - 1);
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

        // Checar colisão
        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.dr * i;
          const c = col + dir.dc * i;
          const existing = grid[r][c];
          if (existing !== null && existing !== word[i]) { fits = false; break; }
        }
        if (!fits) continue;

        // Colocar
        for (let i = 0; i < word.length; i++) {
          grid[row + dir.dr * i][col + dir.dc * i] = word[i];
        }
        placements.push({ word, row, col, direction: dir.kind });
        placed = true;
      }

      if (!placed) {
        throw new Error(`Não foi possível encaixar "${word}" no grid ${size}×${size}. Aumente o tamanho.`);
      }
    }

    // Preencher células vazias + retornar como array de strings (linha por linha)
    const finalGrid: string[] = grid.map(row => row.map(cell => cell ?? randomLetter()).join(''));
    return { grid: finalGrid, placements };
  }

  /** Helper: pega letra na posição (row, col) do grid. */
  static cellAt(grid: string[], row: number, col: number): string {
    return grid[row]?.[col] ?? '';
  }

  /**
   * Verifica se uma seleção do grid (array de células) corresponde a alguma palavra colocada.
   * Retorna a palavra encontrada (normalizada) ou null.
   */
  static matchSelection(
    placements: WordPlacement[],
    cells: Array<{ row: number; col: number }>,
  ): string | null {
    if (cells.length < 2) return null;
    for (const p of placements) {
      if (p.word.length !== cells.length) continue;
      // Verifica se os cells percorrem exatamente p.row/p.col + direction * i (ou reverso)
      const dir = DIRECTIONS.find(d => d.kind === p.direction)!;
      const forwardMatch = cells.every((cell, i) =>
        cell.row === p.row + dir.dr * i && cell.col === p.col + dir.dc * i,
      );
      const reverseMatch = cells.every((cell, i) =>
        cell.row === p.row + dir.dr * (p.word.length - 1 - i) &&
        cell.col === p.col + dir.dc * (p.word.length - 1 - i),
      );
      if (forwardMatch || reverseMatch) return p.word;
    }
    return null;
  }
}
