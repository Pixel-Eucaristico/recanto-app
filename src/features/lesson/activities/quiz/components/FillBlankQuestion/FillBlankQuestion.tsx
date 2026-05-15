'use client';

import { useMemo } from 'react';
import { FillBlankQuestion as FillBlankQ, FillBlankSlot } from '@/domain/quiz/types';
import { FillBlankEntity } from '@/domain/quiz/entities/questionTypes/FillBlank';

interface FillBlankPlayerProps {
  question: FillBlankQ;
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  feedback?: { correctBlanks: FillBlankSlot[]; isCorrect: boolean };
}

export function FillBlankPlayer({ question, value, onChange, disabled = false, feedback }: FillBlankPlayerProps) {
  const tokens = useMemo(() => FillBlankEntity.tokenize(question.template), [question.template]);

  function updateBlank(i: number, v: string) {
    const next = [...value];
    next[i] = v;
    onChange(next);
  }

  let blankIndex = -1;

  return (
    <div className="text-base text-base-content leading-relaxed space-y-2">
      <div className="flex flex-wrap items-baseline gap-1">
        {tokens.map((tok, idx) => {
          if (tok.kind === 'text') {
            return (
              <span key={`t-${idx}`} className="whitespace-pre-wrap">
                {tok.content}
              </span>
            );
          }
          blankIndex += 1;
          const i = blankIndex;
          const isCorrect = feedback
            ? (feedback.correctBlanks[i]?.accepted ?? []).some(
                a => a.trim().toLowerCase() === (value[i] ?? '').trim().toLowerCase(),
              )
            : false;
          return (
            <input
              key={`b-${idx}`}
              type="text"
              className={`input input-bordered input-sm inline-block min-w-32 ${
                feedback ? (isCorrect ? 'border-success text-success' : 'border-error text-error') : ''
              }`}
              value={value[i] ?? ''}
              onChange={e => updateBlank(i, e.target.value)}
              disabled={disabled}
            />
          );
        })}
      </div>
      {feedback && (
        <p className="text-xs text-base-content/60 mt-2">
          Respostas esperadas:{' '}
          {question.blanks.map((slot, i) => (
            <span key={i} className="badge badge-outline badge-sm mr-1">
              {slot.accepted.filter(a => a.trim().length > 0).join(' / ') || '—'}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
