'use client';

import { Check, X } from 'lucide-react';
import { ClassifyQuestion as ClassifyQ } from '@/domain/quiz/types';

interface ClassifyPlayerProps {
  question: ClassifyQ;
  /** { cardId: bucketId } */
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  disabled?: boolean;
  feedback?: boolean;
}

/**
 * Para MVP acessível: cada card tem botões por bucket (select). Dnd real virá em Feature 8.
 */
export function ClassifyPlayer({ question, value, onChange, disabled, feedback }: ClassifyPlayerProps) {
  function assign(cardId: string, bucketId: string) {
    if (disabled) return;
    onChange({ ...value, [cardId]: bucketId });
  }

  function isCorrect(cardId: string): boolean | null {
    if (!feedback) return null;
    const card = question.cards.find(c => c.id === cardId);
    if (!card) return null;
    return value[cardId] === card.bucket_id;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs text-base-content/60">
        Categorias:
        {question.buckets.map(b => (
          <span key={b.id} className="badge badge-outline">{b.label}</span>
        ))}
      </div>

      <div className="space-y-2">
        {question.cards.map(card => {
          const picked = value[card.id];
          const correct = isCorrect(card.id);
          return (
            <div
              key={card.id}
              className={`p-3 rounded-lg border ${
                correct === true ? 'border-success bg-success/10' :
                correct === false ? 'border-error bg-error/10' :
                'border-base-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm text-base-content">{card.text}</span>
                {correct === true && <Check className="w-4 h-4 text-success" />}
                {correct === false && <X className="w-4 h-4 text-error" />}
              </div>
              <div className="flex flex-wrap gap-1">
                {question.buckets.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    className={`btn btn-xs ${picked === b.id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => assign(card.id, b.id)}
                    disabled={disabled}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
