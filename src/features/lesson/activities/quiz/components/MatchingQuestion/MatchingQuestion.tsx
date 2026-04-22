'use client';

import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { QuizEntity } from '@/domain/quiz/entities/Quiz';
import { MatchingQuestion as MatchingQ } from '@/domain/quiz/types';

interface MatchingPlayerProps {
  question: MatchingQ;
  /** { leftPairId: rightPairId } */
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  disabled?: boolean;
  feedback?: boolean;
}

/**
 * Interface click-to-match: clica um item da esquerda, depois um da direita → conectado.
 * Clica em um par já conectado para desfazer.
 */
export function MatchingPlayer({ question, value, onChange, disabled, feedback }: MatchingPlayerProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const shuffledRight = useMemo(() => QuizEntity.shuffle(question.pairs.map(p => ({ id: p.id, text: p.right }))), [question.pairs]);

  const rightToLeft = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [leftId, rightId] of Object.entries(value)) {
      map[rightId] = leftId;
    }
    return map;
  }, [value]);

  function pickLeft(leftId: string) {
    if (disabled) return;
    if (value[leftId]) {
      // já conectado — desconectar
      const next = { ...value };
      delete next[leftId];
      onChange(next);
      return;
    }
    setSelectedLeft(leftId);
  }

  function pickRight(rightId: string) {
    if (disabled || !selectedLeft) return;
    // remove qualquer conexão antiga do direito
    const next = { ...value };
    for (const [l, r] of Object.entries(next)) {
      if (r === rightId) delete next[l];
    }
    next[selectedLeft] = rightId;
    onChange(next);
    setSelectedLeft(null);
  }

  function isCorrect(leftId: string): boolean | null {
    if (!feedback) return null;
    const picked = value[leftId];
    return picked === leftId;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {question.pairs.map(p => {
          const connected = value[p.id];
          const correct = isCorrect(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => pickLeft(p.id)}
              disabled={disabled}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedLeft === p.id ? 'border-primary bg-primary/10' :
                correct === true ? 'border-success bg-success/10' :
                correct === false ? 'border-error bg-error/10' :
                connected ? 'border-base-content/40' : 'border-base-300 hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-base-content">{p.left}</span>
                {correct === true && <Check className="w-4 h-4 text-success" />}
                {correct === false && <X className="w-4 h-4 text-error" />}
              </div>
              {connected && (
                <div className="text-xs text-base-content/60 mt-1">
                  → {question.pairs.find(pp => pp.id === connected)?.right ?? '?'}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {shuffledRight.map(r => {
          const connectedFromLeft = rightToLeft[r.id];
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => pickRight(r.id)}
              disabled={disabled || !selectedLeft}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                connectedFromLeft
                  ? 'border-base-content/40 opacity-60'
                  : selectedLeft
                  ? 'border-primary/50 hover:bg-primary/10 cursor-pointer'
                  : 'border-base-300'
              }`}
            >
              <span className="text-sm text-base-content">{r.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
