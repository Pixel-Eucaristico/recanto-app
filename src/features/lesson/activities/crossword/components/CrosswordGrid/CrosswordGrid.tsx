'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Send, RefreshCw } from 'lucide-react';
import { CrosswordPuzzle, CrosswordEntry } from '@/domain/crossword/types';
import { CrosswordEntity } from '@/domain/crossword/entities/Crossword';

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  onSubmit: (correctEntries: number[]) => void;
  onRestart?: () => void;
  submitting?: boolean;
  result?: { persisted: boolean; score: number; correct: number; total: number } | null;
}

export function CrosswordGrid({ puzzle, onSubmit, onRestart, submitting, result }: CrosswordGridProps) {
  // userGrid: matriz mutável [row][col] com letras digitadas
  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    puzzle.grid.map(row => row.split('').map(c => (c === ' ' ? ' ' : ''))),
  );
  const [activeEntry, setActiveEntry] = useState<CrosswordEntry | null>(puzzle.entries[0] ?? null);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  function ck(r: number, c: number) { return `${r},${c}`; }

  function setCell(r: number, c: number, letter: string) {
    setUserGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = letter.toUpperCase();
      return next;
    });
  }

  // Mapa célula → entries que passam por ela
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

  // Mapa posição → número da entrada (só mostra numeração no primeiro cell)
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
      if (userGrid[r][c]) {
        setCell(r, c, '');
      } else if (activeEntry) {
        // move pra trás
        const prev = activeEntry.direction === 'across' ? { r, c: c - 1 } : { r: r - 1, c };
        const prevCell = userGrid[prev.r]?.[prev.c];
        if (prevCell !== undefined && prevCell !== ' ') {
          setCell(prev.r, prev.c, '');
          inputRefs.current.get(ck(prev.r, prev.c))?.focus();
        }
      }
      e.preventDefault();
      return;
    }
    if (key === 'ArrowRight') {
      const n = inputRefs.current.get(ck(r, c + 1));
      n?.focus();
      e.preventDefault();
    } else if (key === 'ArrowLeft') {
      const n = inputRefs.current.get(ck(r, c - 1));
      n?.focus();
      e.preventDefault();
    } else if (key === 'ArrowDown') {
      const n = inputRefs.current.get(ck(r + 1, c));
      n?.focus();
      e.preventDefault();
    } else if (key === 'ArrowUp') {
      const n = inputRefs.current.get(ck(r - 1, c));
      n?.focus();
      e.preventDefault();
    } else if (/^[a-zA-ZÀ-ÿ]$/.test(key)) {
      setCell(r, c, key);
      // avança na direção da entry ativa
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
    // Se já estiver ativo na mesma célula com direção, alterna direção se clicar de novo
    if (activeEntry && entries.some(e => e.number === activeEntry.number && e.direction === activeEntry.direction)) return;
    setActiveEntry(entries[0]);
  }

  const correctEntries = useMemo(() => {
    return puzzle.entries.filter(e => CrosswordEntity.isEntryCorrect(e, userGrid)).map(e => e.number);
  }, [puzzle.entries, userGrid]);

  const allCorrect = correctEntries.length === puzzle.entries.length;

  if (result) {
    return (
      <div className="card bg-success/10 border border-success">
        <div className="card-body items-center text-center gap-2">
          <CheckCircle2 className={`w-12 h-12 ${result.score === 100 ? 'text-success' : 'text-base-content/50'}`} />
          <h2 className="text-2xl font-bold text-base-content">
            {result.score === 100 ? 'Completou!' : 'Finalizado'}
          </h2>
          <p className="text-base-content/70">
            {result.correct} / {result.total} palavras corretas ({result.score.toFixed(1)}%)
          </p>
          <p className="text-xs text-base-content/50">
            {result.persisted ? 'Primeira tentativa — registrada.' : 'Retake — não registrado.'}
          </p>
          {onRestart && (
            <button className="btn btn-ghost btn-sm gap-1 mt-2" onClick={onRestart}>
              <RefreshCw className="w-4 h-4" />
              Jogar de novo
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-base-content">{puzzle.title}</h3>
        <span className="badge badge-ghost">
          {correctEntries.length} / {puzzle.entries.length}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        {/* Grid */}
        <div className="inline-block">
          <div
            className="grid gap-0.5 bg-base-300 p-1 rounded-lg"
            style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: puzzle.size }).map((_, r) =>
              Array.from({ length: puzzle.size }).map((__, c) => {
                const cell = puzzle.grid[r]?.[c] ?? ' ';
                if (cell === ' ') {
                  return <div key={`${r}-${c}`} className="w-8 h-8 sm:w-9 sm:h-9 bg-base-content/80 rounded-sm" />;
                }
                const number = cellNumber.get(ck(r, c));
                const entries = cellToEntries.get(ck(r, c)) ?? [];
                const isActive = activeEntry && entries.some(e => e.number === activeEntry.number && e.direction === activeEntry.direction);
                const inActiveEntry = activeEntry && entries.some(e => e === activeEntry);
                return (
                  <div key={`${r}-${c}`} className="relative w-8 h-8 sm:w-9 sm:h-9">
                    {number !== undefined && (
                      <span className="absolute top-0 left-0.5 text-[8px] text-base-content/50 pointer-events-none leading-none">
                        {number}
                      </span>
                    )}
                    <input
                      ref={el => {
                        if (el) inputRefs.current.set(ck(r, c), el);
                      }}
                      type="text"
                      maxLength={1}
                      value={userGrid[r][c] === ' ' ? '' : userGrid[r][c]}
                      onFocus={() => handleFocus(r, c)}
                      onKeyDown={e => handleKeyDown(e, r, c)}
                      onChange={() => { /* controlado via keydown */ }}
                      className={`w-full h-full rounded-sm text-center text-sm font-bold uppercase outline-none border ${
                        inActiveEntry ? 'bg-primary/20 border-primary' : 'bg-base-100 border-base-300'
                      } ${isActive ? 'ring-2 ring-primary' : ''} text-base-content`}
                    />
                  </div>
                );
              }),
            )}
          </div>
        </div>

        {/* Clues */}
        <div className="space-y-3">
          <CluesList
            direction="across"
            entries={puzzle.entries.filter(e => e.direction === 'across')}
            activeEntry={activeEntry}
            correctEntries={correctEntries}
            onPick={e => setActiveEntry(e)}
          />
          <CluesList
            direction="down"
            entries={puzzle.entries.filter(e => e.direction === 'down')}
            activeEntry={activeEntry}
            correctEntries={correctEntries}
            onPick={e => setActiveEntry(e)}
          />
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

function CluesList({
  direction,
  entries,
  activeEntry,
  correctEntries,
  onPick,
}: {
  direction: 'across' | 'down';
  entries: CrosswordEntry[];
  activeEntry: CrosswordEntry | null;
  correctEntries: number[];
  onPick: (e: CrosswordEntry) => void;
}) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 gap-2">
        <h4 className="text-sm font-semibold">{direction === 'across' ? 'Horizontais' : 'Verticais'}</h4>
        <ul className="space-y-1 text-sm">
          {entries.map(e => {
            const isActive = activeEntry?.number === e.number && activeEntry?.direction === e.direction;
            const isCorrect = correctEntries.includes(e.number) && correctEntries.filter(n => n === e.number).length > 0;
            return (
              <li key={`${e.number}-${e.direction}`}>
                <button
                  type="button"
                  onClick={() => onPick(e)}
                  className={`text-left w-full px-2 py-1 rounded ${
                    isActive ? 'bg-primary/10' : ''
                  } ${isCorrect ? 'text-success line-through' : 'text-base-content'} hover:bg-base-200`}
                >
                  <span className="font-bold mr-1">{e.number}.</span> {e.clue}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
