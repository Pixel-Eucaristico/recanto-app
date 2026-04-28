'use client';

import type { MultipleChoiceQuestion } from '@/domain/quiz/types';
import { RichContent } from '@/shared/components/RichContent';

interface MultipleChoicePlayerProps {
  question: MultipleChoiceQuestion;
  selected: string;
  revealed: boolean;
  onChange: (optionId: string) => void;
}

export function MultipleChoicePlayer({ question, selected, revealed, onChange }: MultipleChoicePlayerProps) {
  const correct = question.options.find(o => o.is_correct);

  return (
    <div className="space-y-2">
      {question.options.map(opt => {
        const picked = selected === opt.id;
        let cls = 'border-base-300 hover:border-primary/50';
        if (revealed) {
          if (opt.id === correct?.id) cls = 'border-success bg-success/10';
          else if (opt.id === selected) cls = 'border-error bg-error/10';
          else cls = 'border-base-300 opacity-60';
        } else if (picked) {
          cls = 'border-primary bg-primary/10';
        }
        return (
          <label
            key={opt.id}
            className={`flex items-start gap-2 p-3 rounded-lg border ${revealed ? 'cursor-default' : 'cursor-pointer'} ${cls}`}
          >
            <input
              type="radio"
              className="radio radio-primary radio-sm mt-0.5"
              name={`q-${question.id}`}
              checked={picked}
              disabled={revealed}
              onChange={() => onChange(opt.id)}
            />
            <div className="flex-1"><RichContent markdown={opt.text} /></div>
          </label>
        );
      })}
    </div>
  );
}
