import { CrosswordClue, CrosswordEntry, CrosswordPuzzle } from '@/domain/crossword/types';

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

interface PlacementCandidate {
  entry: CrosswordEntry;
  crossings: number;
}

export class CrosswordEntity {
  static normalize(s: string): string {
    return norm(s);
  }

  /**
   * Tenta encaixar as palavras auto-construindo o grid com cruzamentos onde possível.
   * - Primeira palavra: horizontal no centro.
   * - Demais: para cada letra compartilhada com palavras já colocadas, tenta posição
   *   perpendicular; escolhe a que gera mais cruzamentos. Se nenhuma couber, coloca
   *   paralela fora da região (grid cresce).
   */
  static generate(clues: CrosswordClue[], padding = 1): { grid: string[]; entries: CrosswordEntry[]; size: number } {
    const normalized = clues
      .map(c => ({ clue: c.clue, answer: norm(c.answer) }))
      .filter(c => c.answer.length >= 2);

    if (normalized.length === 0) {
      throw new Error('Nenhuma palavra válida.');
    }

    // Sort by length desc pra aumentar chance de cruzamentos
    normalized.sort((a, b) => b.answer.length - a.answer.length);

    // Grid dinâmico via Map<"r,c", letra>
    const cells = new Map<string, string>();
    const entries: CrosswordEntry[] = [];

    function key(r: number, c: number): string { return `${r},${c}`; }

    function canPlace(answer: string, row: number, col: number, dir: 'across' | 'down'): number | null {
      let crossings = 0;
      for (let i = 0; i < answer.length; i++) {
        const r = dir === 'across' ? row : row + i;
        const c = dir === 'across' ? col + i : col;
        const existing = cells.get(key(r, c));
        if (existing !== undefined) {
          if (existing !== answer[i]) return null;
          crossings++;
        } else {
          // Checar adjacências — não pode haver letras coladas em direção ortogonal
          if (dir === 'across') {
            if (cells.get(key(r - 1, c)) !== undefined) return null;
            if (cells.get(key(r + 1, c)) !== undefined) return null;
          } else {
            if (cells.get(key(r, c - 1)) !== undefined) return null;
            if (cells.get(key(r, c + 1)) !== undefined) return null;
          }
        }
      }
      // Letra antes e depois deve estar vazia (pra não grudar com outra palavra)
      if (dir === 'across') {
        if (cells.get(key(row, col - 1)) !== undefined) return null;
        if (cells.get(key(row, col + answer.length)) !== undefined) return null;
      } else {
        if (cells.get(key(row - 1, col)) !== undefined) return null;
        if (cells.get(key(row + answer.length, col)) !== undefined) return null;
      }
      return crossings;
    }

    function place(entry: Omit<CrosswordEntry, 'number'>, answer: string) {
      for (let i = 0; i < answer.length; i++) {
        const r = entry.direction === 'across' ? entry.row : entry.row + i;
        const c = entry.direction === 'across' ? entry.col + i : entry.col;
        cells.set(key(r, c), answer[i]);
      }
    }

    // Primeira palavra: horizontal em (0, 0)
    const first = normalized[0];
    place({ clue: first.clue, answer: first.answer, direction: 'across', row: 0, col: 0 }, first.answer);
    entries.push({ ...first, direction: 'across', row: 0, col: 0, number: 1 });

    // Demais: tenta posicionar cruzando com alguma letra já colocada
    for (let idx = 1; idx < normalized.length; idx++) {
      const { clue, answer } = normalized[idx];
      let best: PlacementCandidate | null = null;

      for (let i = 0; i < answer.length; i++) {
        const letter = answer[i];
        for (const [k, existingLetter] of cells.entries()) {
          if (existingLetter !== letter) continue;
          const [rStr, cStr] = k.split(',');
          const exR = Number(rStr);
          const exC = Number(cStr);

          // Tentar across
          {
            const row = exR;
            const col = exC - i;
            const crossings = canPlace(answer, row, col, 'across');
            if (crossings && crossings >= 1) {
              if (!best || crossings > best.crossings) {
                best = {
                  entry: { clue, answer, direction: 'across', row, col, number: 0 },
                  crossings,
                };
              }
            }
          }
          // Tentar down
          {
            const row = exR - i;
            const col = exC;
            const crossings = canPlace(answer, row, col, 'down');
            if (crossings && crossings >= 1) {
              if (!best || crossings > best.crossings) {
                best = {
                  entry: { clue, answer, direction: 'down', row, col, number: 0 },
                  crossings,
                };
              }
            }
          }
        }
      }

      if (!best) {
        // Fallback: coloca em linha nova, longe, horizontal
        const allRows = Array.from(cells.keys()).map(k => Number(k.split(',')[0]));
        const maxRow = allRows.length > 0 ? Math.max(...allRows) : 0;
        const fallbackRow = maxRow + 2;
        best = { entry: { clue, answer, direction: 'across', row: fallbackRow, col: 0, number: 0 }, crossings: 0 };
      }

      place(best.entry, answer);
      entries.push(best.entry);
    }

    // Normalizar: deslocar pra origem 0,0 e calcular tamanho
    const allR: number[] = [];
    const allC: number[] = [];
    for (const k of cells.keys()) {
      const [r, c] = k.split(',').map(Number);
      allR.push(r);
      allC.push(c);
    }
    const minR = Math.min(...allR);
    const minC = Math.min(...allC);
    const maxR = Math.max(...allR);
    const maxC = Math.max(...allC);
    const offsetR = -minR + padding;
    const offsetC = -minC + padding;
    const size = Math.max(maxR - minR, maxC - minC) + 1 + padding * 2;

    // Gerar grid como array de strings (' ' = bloco preto)
    const grid: string[] = Array.from({ length: size }, () => ' '.repeat(size));
    const gridArr: string[][] = grid.map(r => r.split(''));
    for (const [k, letter] of cells.entries()) {
      const [r, c] = k.split(',').map(Number);
      gridArr[r + offsetR][c + offsetC] = letter;
    }
    const finalGrid = gridArr.map(r => r.join(''));

    // Ajustar entries com offset + numerar
    const shifted = entries.map(e => ({ ...e, row: e.row + offsetR, col: e.col + offsetC }));

    // Numeração: ordenar por (row, col) e atribuir números progressivos
    // entries que começam na MESMA célula compartilham número
    const sorted = [...shifted].sort((a, b) => (a.row - b.row) || (a.col - b.col));
    let num = 0;
    let lastR = -1;
    let lastC = -1;
    const numberedMap = new Map<number, CrosswordEntry>();
    for (const e of sorted) {
      if (e.row !== lastR || e.col !== lastC) {
        num++;
        lastR = e.row;
        lastC = e.col;
      }
      const numbered: CrosswordEntry = { ...e, number: num };
      numberedMap.set(entries.findIndex(x => x.answer === e.answer && x.direction === e.direction && x.clue === e.clue), numbered);
    }
    const finalEntries: CrosswordEntry[] = entries.map((_, i) => numberedMap.get(i)!).filter(Boolean);

    return { grid: finalGrid, entries: finalEntries, size };
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
