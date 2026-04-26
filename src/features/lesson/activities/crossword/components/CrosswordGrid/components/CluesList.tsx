'use client';

import type { CrosswordEntry } from '@/domain/crossword/types';

interface CluesListProps {
  direction: 'across' | 'down';
  entries: CrosswordEntry[];
  activeEntry: CrosswordEntry | null;
  correctEntries: number[];
  onPick: (e: CrosswordEntry) => void;
}

export function CluesList({ direction, entries, activeEntry, correctEntries, onPick }: CluesListProps) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 gap-2">
        <h4 className="text-sm font-semibold">{direction === 'across' ? 'Horizontais' : 'Verticais'}</h4>
        <ul className="space-y-1 text-sm">
          {entries.map(e => {
            const isActive = activeEntry?.number === e.number && activeEntry?.direction === e.direction;
            const isCorrect = correctEntries.includes(e.number);
            return (
              <li key={`${e.number}-${e.direction}`}>
                <button
                  type="button"
                  onClick={() => onPick(e)}
                  className={`text-left w-full px-2 py-1 rounded ${isActive ? 'bg-primary/10' : ''} ${
                    isCorrect ? 'text-success line-through' : 'text-base-content'
                  } hover:bg-base-200`}
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
