'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Send, RefreshCw, X } from 'lucide-react';
import type { CrosswordPuzzle, CrosswordEntry } from '@/domain/crossword/types';
import { CrosswordEntity } from '@/domain/crossword/entities/Crossword';
import { CluesList } from './components/CluesList';

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  onSubmit: (correctEntries: number[]) => void;
  onRestart?: () => void;
  submitting?: boolean;
  result?: { persisted: boolean; score: number; correct: number; total: number } | null;
}

export function CrosswordGrid({ puzzle, onSubmit, onRestart, submitting, result }: CrosswordGridProps) {
  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    puzzle.grid.map(row => row.split('').map(c => (c === ' ' ? ' ' : ''))),
  );
  const [activeEntry, setActiveEntry] = useState<CrosswordEntry | null>(puzzle.entries[0] ?? null);
  const [clueOpen, setClueOpen] = useState(true);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => { setClueOpen(true); }, [activeEntry?.number, activeEntry?.direction]);

  function ck(r: number, c: number) { return `${r},${c}`; }

  function setCell(r: number, c: number, letter: string) {
    setUserGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = letter.toUpperCase();
      return next;
    });
  }

  const cellToEntries = useMemo(() => {
    const map = new Map<string, CrosswordEntry[]>();
    for (const e of puzzle.entries) {
      for (let i = 0; i < e.answer.length; i++) {
        const r = e.direction === 'across' ? e.row : e.row + i;
        const c = e.direction === 'across' ? e.col + i : e.col;
        const k = ck(r, c);
        const arr = map.get(k) ?? [];
        arr.push(e);
        map.set(k, arr);
      }
    }
    return map;
  }, [puzzle.entries]);

  const cellNumber = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of puzzle.entries) {
      const k = ck(e.row, e.col);
      if (!map.has(k)) map.set(k, e.number);
    }
    return map;
  }, [puzzle.entries]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) {
    const key = e.key;
    if (key === 'Backspace') {
      if (userGrid[r][c]) { setCell(r, c, ''); } else if (activeEntry) {
        const prev = activeEntry.direction === 'across' ? { r, c: c - 1 } : { r: r - 1, c };
        const prevCell = userGrid[prev.r]?.[prev.c];
        if (prevCell !== undefined && prevCell !== ' ') {
          setCell(prev.r, prev.c, '');
          inputRefs.current.get(ck(prev.r, prev.c))?.focus();
        }
      }
      e.preventDefault(); return;
    }
    if (key === 'ArrowRight') { inputRefs.current.get(ck(r, c + 1))?.focus(); e.preventDefault(); }
    else if (key === 'ArrowLeft') { inputRefs.current.get(ck(r, c - 1))?.focus(); e.preventDefault(); }
    else if (key === 'ArrowDown') { inputRefs.current.get(ck(r + 1, c))?.focus(); e.preventDefault(); }
    else if (key === 'ArrowUp') { inputRefs.current.get(ck(r - 1, c))?.focus(); e.preventDefault(); }
    else if (/^[a-zA-ZÀ-ÿ]$/.test(key)) {
      setCell(r, c, key);
      if (activeEntry) {
        const nr = activeEntry.direction === 'across' ? r : r + 1;
        const nc = activeEntry.direction === 'across' ? c + 1 : c;
        inputRefs.current.get(ck(nr, nc))?.focus();
      }
      e.preventDefault();
    }
  }

  function handleFocus(r: number, c: number) {
    const entries = cellToEntries.get(ck(r, c)) ?? [];
    if (entries.length === 0) return;
    if (activeEntry && entries.some(e => e.number === activeEntry.number && e.direction === activeEntry.direction)) return;
    setActiveEntry(entries[0]);
  }

  const correctEntries = useMemo(() => {
    return puzzle.entries.filter(e => CrosswordEntity.isEntryCorrect(e, userGrid)).map(e => e.number);
  }, [puzzle.entries, userGrid]);

  const bounds = useMemo(() => {
    let maxR = 0, maxC = 0;
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if ((puzzle.grid[r]?.[c] ?? ' ') !== ' ') { if (r > maxR) maxR = r; if (c > maxC) maxC = c; }
      }
    }
    return { rows: maxR + 1, cols: maxC + 1 };
  }, [puzzle.grid, puzzle.size]);

  const allCorrect = correctEntries.length === puzzle.entries.length;

  if (result) {
    return (
      <div className="card bg-success/10 border border-success">
        <div className="card-body items-center text-center gap-2">
          <CheckCircle2 className={`w-12 h-12 ${result.score === 100 ? 'text-success' : 'text-base-content/50'}`} />
          <h2 className="text-2xl font-bold text-base-content">{result.score === 100 ? 'Completou!' : 'Finalizado'}</h2>
          <p className="text-base-content/70">{result.correct} / {result.total} palavras corretas ({result.score.toFixed(1)}%)</p>
          <p className="text-xs text-base-content/50">{result.persisted ? 'Primeira tentativa — registrada.' : 'Retake — não registrado.'}</p>
          {onRestart && <button className="btn btn-ghost btn-sm gap-1 mt-2" onClick={onRestart}><RefreshCw className="w-4 h-4" />Jogar de novo</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-base-content">{puzzle.title}</h3>
        <span className="badge badge-ghost">{correctEntries.length} / {puzzle.entries.length}</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex-1 min-w-0 flex justify-center">
          <div className="relative w-full" style={{ maxWidth: `${bounds.cols * 2.4}rem` }}>
            {activeEntry && (() => {
              const len = activeEntry.answer.length;
              const r = activeEntry.row;
              const c = activeEntry.col;
              const isAcross = activeEntry.direction === 'across';
              const isCorrect = correctEntries.includes(activeEntry.number);
              let allFilled = true;
              for (let i = 0; i < len; i++) {
                const rr = isAcross ? r : r + i;
                const cc = isAcross ? c + i : c;
                const v = userGrid[rr]?.[cc];
                if (!v || v === ' ') { allFilled = false; break; }
              }
              const isWrong = allFilled && !isCorrect;
              const status: 'correct' | 'wrong' | 'neutral' = isCorrect ? 'correct' : isWrong ? 'wrong' : 'neutral';
              const borderCls = status === 'correct' ? 'border-success' : status === 'wrong' ? 'border-error' : 'border-primary';
              const badgeCls = status === 'correct' ? 'badge-success' : status === 'wrong' ? 'badge-error' : 'badge-primary';
              const btnCls = status === 'correct' ? 'btn-success' : status === 'wrong' ? 'btn-error' : 'btn-primary';
              const placeAbove = isAcross ? r > Math.floor(bounds.rows / 3) : false;
              const placeBelow = isAcross && !placeAbove;
              const placeRight = !isAcross && (c + 1 < bounds.cols);
              const placeLeft = !isAcross && !placeRight;

              const cellW = 100 / bounds.cols;
              const cellH = 100 / bounds.rows;
              let top: string, left: string, transform: string;

              if (isAcross) {
                left = `${(c + len / 2) * cellW}%`;
                if (placeAbove) {
                  top = `${r * cellH}%`;
                  transform = 'translate(-50%, calc(-100% - 6px))';
                } else {
                  top = `${(r + 1) * cellH}%`;
                  transform = 'translate(-50%, 6px)';
                }
              } else {
                top = `${(r + len / 2) * cellH}%`;
                if (placeRight) {
                  left = `${(c + 1) * cellW}%`;
                  transform = 'translate(6px, -50%)';
                } else {
                  left = `${c * cellW}%`;
                  transform = 'translate(calc(-100% - 6px), -50%)';
                }
              }

              return clueOpen ? (
                <div
                  className={`absolute z-20 w-[min(220px,80vw)] rounded-lg bg-base-100 border-2 shadow-xl p-2 pr-7 text-xs ${borderCls}`}
                  style={{ top, left, transform }}
                >
                  <button
                    type="button"
                    onClick={() => setClueOpen(false)}
                    className="absolute top-0.5 right-0.5 btn btn-ghost btn-xs btn-circle"
                    aria-label="Fechar dica"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex items-baseline gap-1 flex-wrap mb-0.5">
                    <span className={`badge badge-xs font-bold ${badgeCls}`}>{activeEntry.number}</span>
                    <span className="text-[10px] text-base-content/60">
                      {isAcross ? 'horiz.' : 'vert.'} · {len} letras
                    </span>
                    {status === 'correct' && <span className="text-[10px] text-success font-semibold">✓ correta</span>}
                    {status === 'wrong' && <span className="text-[10px] text-error font-semibold">✗ revise</span>}
                  </div>
                  <p className="text-base-content leading-snug">{activeEntry.clue}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setClueOpen(true)}
                  className={`absolute z-20 btn btn-xs btn-circle shadow ${btnCls}`}
                  style={{ top, left, transform }}
                  aria-label="Mostrar dica"
                  title={activeEntry.clue}
                >
                  ?
                </button>
              );
            })()}
            <div className="grid gap-px bg-base-content/40 p-px rounded-md w-full" style={{ gridTemplateColumns: `repeat(${bounds.cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: bounds.rows }).map((_, r) =>
              Array.from({ length: bounds.cols }).map((__, c) => {
                const cell = puzzle.grid[r]?.[c] ?? ' ';
                if (cell === ' ') return <div key={`${r}-${c}`} className="aspect-square bg-base-content/80" />;
                const number = cellNumber.get(ck(r, c));
                const entries = cellToEntries.get(ck(r, c)) ?? [];
                const isActive = activeEntry && entries.some(e => e.number === activeEntry.number && e.direction === activeEntry.direction);
                const inActiveEntry = activeEntry && entries.some(e => e === activeEntry);
                return (
                  <div key={`${r}-${c}`} className="relative aspect-square">
                    {number !== undefined && <span className="absolute top-0 left-0.5 text-[9px] md:text-[10px] font-semibold text-base-content/60 pointer-events-none leading-none z-10">{number}</span>}
                    <input
                      ref={el => { if (el) inputRefs.current.set(ck(r, c), el); }}
                      type="text" maxLength={1}
                      value={userGrid[r][c] === ' ' ? '' : userGrid[r][c]}
                      onFocus={() => handleFocus(r, c)}
                      onKeyDown={e => handleKeyDown(e, r, c)}
                      onChange={() => {}}
                      className={`w-full h-full text-center font-bold uppercase outline-none text-[clamp(0.7rem,2.4vw,1.125rem)] text-base-content ${
                        inActiveEntry ? 'bg-primary/25' : 'bg-base-100'
                      } ${isActive ? 'ring-2 ring-primary ring-inset' : ''}`}
                    />
                  </div>
                );
              }),
            )}
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-3">
          <CluesList direction="across" entries={puzzle.entries.filter(e => e.direction === 'across')} activeEntry={activeEntry} correctEntries={correctEntries} onPick={e => setActiveEntry(e)} />
          <CluesList direction="down" entries={puzzle.entries.filter(e => e.direction === 'down')} activeEntry={activeEntry} correctEntries={correctEntries} onPick={e => setActiveEntry(e)} />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary gap-1" onClick={() => onSubmit(correctEntries)} disabled={submitting || !allCorrect}>
          <Send className="w-4 h-4" />
          {submitting ? 'Finalizando...' : allCorrect ? 'Finalizar' : `Faltam ${puzzle.entries.length - correctEntries.length}`}
        </button>
      </div>
    </div>
  );
}
