import type { CrosswordClue, CrosswordEntry } from '@/domain/crossword/types';

function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
}

interface PlacementCandidate {
  entry: CrosswordEntry;
  crossings: number;
}

/**
 * Gera grid de palavras cruzadas a partir das dicas.
 * Primeira palavra: horizontal em (0,0).
 * Demais: posicionadas perpendicular a palavras existentes, priorizando mais cruzamentos.
 * Fallback: linha nova paralela se nenhum cruzamento for possível.
 */
export function generateCrossword(
  clues: CrosswordClue[],
  padding = 1,
): { grid: string[]; entries: CrosswordEntry[]; size: number } {
  const normalized = clues.map(c => ({ clue: c.clue, answer: norm(c.answer) })).filter(c => c.answer.length >= 2);
  if (normalized.length === 0) throw new Error('Nenhuma palavra válida.');
  normalized.sort((a, b) => b.answer.length - a.answer.length);

  const cells = new Map<string, string>();
  const entries: CrosswordEntry[] = [];
  const key = (r: number, c: number) => `${r},${c}`;

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
        if (dir === 'across') {
          if (cells.get(key(r - 1, c)) !== undefined) return null;
          if (cells.get(key(r + 1, c)) !== undefined) return null;
        } else {
          if (cells.get(key(r, c - 1)) !== undefined) return null;
          if (cells.get(key(r, c + 1)) !== undefined) return null;
        }
      }
    }
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

  const first = normalized[0];
  place({ clue: first.clue, answer: first.answer, direction: 'across', row: 0, col: 0 }, first.answer);
  entries.push({ ...first, direction: 'across', row: 0, col: 0, number: 1 });

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

        const tryAcross = canPlace(answer, exR, exC - i, 'across');
        if (tryAcross && tryAcross >= 1 && (!best || tryAcross > best.crossings)) {
          best = { entry: { clue, answer, direction: 'across', row: exR, col: exC - i, number: 0 }, crossings: tryAcross };
        }
        const tryDown = canPlace(answer, exR - i, exC, 'down');
        if (tryDown && tryDown >= 1 && (!best || tryDown > best.crossings)) {
          best = { entry: { clue, answer, direction: 'down', row: exR - i, col: exC, number: 0 }, crossings: tryDown };
        }
      }
    }

    if (!best) {
      const allRows = Array.from(cells.keys()).map(k => Number(k.split(',')[0]));
      const maxRow = allRows.length > 0 ? Math.max(...allRows) : 0;
      best = { entry: { clue, answer, direction: 'across', row: maxRow + 2, col: 0, number: 0 }, crossings: 0 };
    }

    place(best.entry, answer);
    entries.push(best.entry);
  }

  const allR = Array.from(cells.keys()).map(k => Number(k.split(',')[0]));
  const allC = Array.from(cells.keys()).map(k => Number(k.split(',')[1]));
  const minR = Math.min(...allR), minC = Math.min(...allC);
  const maxR = Math.max(...allR), maxC = Math.max(...allC);
  const offsetR = -minR + padding, offsetC = -minC + padding;
  const size = Math.max(maxR - minR, maxC - minC) + 1 + padding * 2;

  const gridArr: string[][] = Array.from({ length: size }, () => Array(size).fill(' '));
  for (const [k, letter] of cells.entries()) {
    const [r, c] = k.split(',').map(Number);
    gridArr[r + offsetR][c + offsetC] = letter;
  }

  const shifted = entries.map(e => ({ ...e, row: e.row + offsetR, col: e.col + offsetC }));
  const sorted = [...shifted].sort((a, b) => (a.row - b.row) || (a.col - b.col));
  let num = 0, lastR = -1, lastC = -1;
  const numberedMap = new Map<number, CrosswordEntry>();
  for (const e of sorted) {
    if (e.row !== lastR || e.col !== lastC) { num++; lastR = e.row; lastC = e.col; }
    numberedMap.set(entries.findIndex(x => x.answer === e.answer && x.direction === e.direction && x.clue === e.clue), { ...e, number: num });
  }

  return {
    grid: gridArr.map(r => r.join('')),
    entries: entries.map((_, i) => numberedMap.get(i)!).filter(Boolean),
    size,
  };
}
