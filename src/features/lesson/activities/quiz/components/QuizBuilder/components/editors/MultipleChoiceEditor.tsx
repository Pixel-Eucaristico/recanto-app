'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { MultipleChoiceQuestion, QuizOption, QuizQuestion } from '@/domain/quiz/types';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { blankOption } from '../../utils/quizBuilderUtils';

interface MultipleChoiceEditorProps {
  question: MultipleChoiceQuestion;
  onChange: (patch: Partial<QuizQuestion>) => void;
  locked?: boolean;
}

export function MultipleChoiceEditor({ question, onChange, locked }: MultipleChoiceEditorProps) {
  function setOptions(options: QuizOption[]) {
    onChange({ options } as Partial<QuizQuestion>);
  }

  if (locked) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-base-content/60">Marque qual das alternativas é a correta:</p>
        {question.options.map((opt, oIdx) => (
          <label
            key={opt.id}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
              opt.is_correct ? 'border-success bg-success/10' : 'border-base-300 hover:border-success/50'
            }`}
          >
            <input
              type="radio"
              className="radio radio-success radio-sm"
              checked={opt.is_correct}
              onChange={() => setOptions(question.options.map((o, i) => ({ ...o, is_correct: i === oIdx })))}
            />
            <span className="font-medium text-base-content">{opt.text}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {question.options.map((opt, oIdx) => (
        <div key={opt.id} className="flex items-start gap-2">
          <input
            type="radio"
            className="radio radio-success radio-sm mt-3"
            checked={opt.is_correct}
            onChange={() => setOptions(question.options.map((o, i) => ({ ...o, is_correct: i === oIdx })))}
          />
          <div className="flex-1">
            <MarkdownField
              value={opt.text}
              onChange={v => setOptions(question.options.map((o, i) => (i === oIdx ? { ...o, text: v } : o)))}
              placeholder={`Opção ${oIdx + 1} (Markdown)`}
              height={90}
              preview="edit"
            />
          </div>
          <button
            className="btn btn-ghost btn-xs text-error mt-3"
            onClick={() => setOptions(question.options.filter((_, i) => i !== oIdx))}
            disabled={question.options.length <= 2}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button className="btn btn-ghost btn-xs gap-1" onClick={() => setOptions([...question.options, blankOption()])}>
        <Plus className="w-3.5 h-3.5" /> Adicionar opção
      </button>
    </div>
  );
}
