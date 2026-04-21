'use client';

import { useMemo } from 'react';
import { FillBlankQuestion as FillBlankQ, FillBlankSlot } from '@/domain/quiz/types';

interface FillBlankPlayerProps {
  question: FillBlankQ;
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  feedback?: { correctBlanks: FillBlankSlot[]; isCorrect: boolean };
}

export function FillBlankPlayer({ question, value, onChange, disabled = false, feedback }: FillBlankPlayerProps) {
  // Split template by __ placeholders — preserve segments + blank positions.
  const segments = useMemo(() => question.template.split(/__+/g), [question.template]);

  function updateBlank(i: number, v: string) {
    const next = [...value];
    next[i] = v;
    onChange(next);
  }

  return (
    <div className="text-base text-base-content leading-relaxed space-y-2">
      <div className="flex flex-wrap items-baseline gap-1">
        {segments.map((seg, i) => (
          <span key={`seg-${i}`} className="inline-flex items-baseline gap-1">
            <span className="whitespace-pre-wrap">{seg}</span>
            {i < segments.length - 1 && (
              <input
                type="text"
                className={`input input-bordered input-sm inline-block min-w-32 ${
                  feedback
                    ? (feedback.correctBlanks[i]?.accepted ?? []).some(
                        a => a.trim().toLowerCase() === (value[i] ?? '').trim().toLowerCase(),
                      )
                      ? 'border-success text-success'
                      : 'border-error text-error'
                    : ''
                }`}
                value={value[i] ?? ''}
                onChange={e => updateBlank(i, e.target.value)}
                disabled={disabled}
              />
            )}
          </span>
        ))}
      </div>
      {feedback && (
        <p className="text-xs text-base-content/60 mt-2">
          Respostas esperadas:{' '}
          {question.blanks.map((slot, i) => (
            <span key={i} className="badge badge-outline badge-sm mr-1">
              {slot.accepted.join(' / ')}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
