'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Send, RefreshCw } from 'lucide-react';
import type { WordSearchPuzzle } from '@/domain/word-search/types';
import { WordSearchEntity } from '@/domain/word-search/entities/WordSearch';
import { type Cell, lineCells } from './utils/wordSearchGridUtils';

interface WordSearchGridProps {
  puzzle: WordSearchPuzzle;
  found: string[];
  onFound: (word: string) => void;
  onSubmit: () => void;
  onRestart?: () => void;
  submitting?: boolean;
  result?: { persisted: boolean; score: number } | null;
}

export function WordSearchGrid({ puzzle, found, onFound, onSubmit, onRestart, submitting, result }: WordSearchGridProps) {
  const [startCell, setStartCell] = useState<Cell | null>(null);
  const [currentCell, setCurrentCell] = useState<Cell | null>(null);
  const [dragging, setDragging] = useState(false);
  const [foundCells, setFoundCells] = useState<Record<string, Cell[]>>({});

  const preview = useMemo<Cell[] | null>(() => {
    if (!startCell || !currentCell) return null;
    return lineCells(startCell, currentCell);
  }, [startCell, currentCell]);

  function isCellInPreview(row: number, col: number): boolean {
    return preview?.some(c => c.row === row && c.col === col) ?? false;
  }

  function isCellFound(row: number, col: number): boolean {
    return Object.values(foundCells).some(cells => cells.some(c => c.row === row && c.col === col));
  }

  function beginSelect(row: number, col: number) { setDragging(true); setStartCell({ row, col }); setCurrentCell({ row, col }); }
  function updateSelect(row: number, col: number) { if (!dragging) return; setCurrentCell({ row, col }); }

  function endSelect() {
    if (!dragging) return;
    setDragging(false);
    if (startCell && currentCell) {
      const cells = lineCells(startCell, currentCell);
      if (cells) {
        const match = WordSearchEntity.matchSelection(puzzle.placements, cells);
        if (match && !found.includes(match)) {
          onFound(match);
          setFoundCells(prev => ({ ...prev, [match]: cells }));
        }
      }
    }
    setStartCell(null); setCurrentCell(null);
  }

  function cellAtPoint(clientX: number, clientY: number): Cell | null {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const btn = el?.closest<HTMLElement>('[data-cell]');
    if (!btn) return null;
    const row = Number(btn.dataset.row);
    const col = Number(btn.dataset.col);
    if (Number.isNaN(row) || Number.isNaN(col)) return null;
    return { row, col };
  }

  function reset() { setStartCell(null); setCurrentCell(null); setDragging(false); setFoundCells({}); onRestart?.(); }

  const allFound = found.length === puzzle.words.length;

  if (result) {
    return (
      <div className="space-y-4">
        <div className={`card ${allFound ? 'bg-success/10 border-success' : 'bg-base-100 border-base-300'} border`}>
          <div className="card-body items-center text-center gap-2">
            <CheckCircle2 className={`w-12 h-12 ${allFound ? 'text-success' : 'text-base-content/50'}`} />
            <h2 className="text-2xl font-bold text-base-content">{allFound ? 'Parabéns!' : 'Resultado'}</h2>
            <p className="text-base-content/70">{found.length} de {puzzle.words.length} palavras ({result.score.toFixed(1)}%)</p>
            <p className="text-xs text-base-content/50">{result.persisted ? 'Primeira tentativa — registrada para o formador.' : 'Retake — score mostrado, não registrado.'}</p>
            {onRestart && <button className="btn btn-ghost btn-sm gap-1 mt-2" onClick={reset}><RefreshCw className="w-4 h-4" />Jogar de novo</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-base-content">{puzzle.title}</h3>
        <span className="badge badge-ghost">{found.length} / {puzzle.words.length}</span>
      </div>
      <p className="text-xs text-base-content/60">Arraste o mouse (ou o dedo) de uma letra até a outra para marcar a palavra.</p>

      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6 justify-center">
        <div className="flex justify-center lg:justify-start">
          <div
            className="grid gap-0.5 bg-base-300 p-1 rounded-lg select-none touch-none w-fit"
            style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
            onMouseUp={endSelect}
            onMouseLeave={endSelect}
            onTouchMove={e => { const t = e.touches[0]; if (!t) return; const c = cellAtPoint(t.clientX, t.clientY); if (c) updateSelect(c.row, c.col); }}
            onTouchEnd={endSelect}
          >
            {Array.from({ length: puzzle.size }).map((_, row) =>
              Array.from({ length: puzzle.size }).map((__, col) => {
                const letter = WordSearchEntity.cellAt(puzzle.grid, row, col);
                const inPreview = isCellInPreview(row, col);
                const inFound = isCellFound(row, col);
                const isStart = startCell && startCell.row === row && startCell.col === col;
                return (
                  <button
                    key={`${row}-${col}`}
                    type="button"
                    data-cell
                    data-row={row}
                    data-col={col}
                    onMouseDown={e => { e.preventDefault(); beginSelect(row, col); }}
                    onMouseEnter={() => updateSelect(row, col)}
                    onTouchStart={e => { e.preventDefault(); beginSelect(row, col); }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-sm flex items-center justify-center text-sm font-bold uppercase transition-colors ${
                      inFound ? 'bg-success text-success-content' : isStart ? 'bg-primary text-primary-content' : inPreview ? 'bg-primary/30 text-base-content' : 'bg-base-100 hover:bg-primary/10 text-base-content'
                    }`}
                  >
                    {letter}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 w-full lg:w-64 flex-shrink-0">
          <div className="card-body p-4 gap-2">
            <h4 className="text-sm font-semibold">Palavras</h4>
            <ul className="space-y-1">
              {puzzle.words.map((w, i) => {
                const normalized = WordSearchEntity.normalizeWord(w);
                const done = found.includes(normalized);
                const clue = puzzle.clues?.[i]?.trim();
                const label = clue && clue.length > 0 ? clue : w;
                return (
                  <li key={w} className={`text-sm flex items-start gap-1 ${done ? 'line-through text-success' : 'text-base-content'}`}>
                    {done && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onRestart && <button className="btn btn-ghost btn-sm gap-1" onClick={reset}><RefreshCw className="w-4 h-4" />Reiniciar</button>}
        <button className="btn btn-primary gap-1" onClick={onSubmit} disabled={submitting || !allFound}>
          <Send className="w-4 h-4" />
          {submitting ? 'Finalizando...' : allFound ? 'Finalizar' : `Faltam ${puzzle.words.length - found.length}`}
        </button>
      </div>
    </div>
  );
}
