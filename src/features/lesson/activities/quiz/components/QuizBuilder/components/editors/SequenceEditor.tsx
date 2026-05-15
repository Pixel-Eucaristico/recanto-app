'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { SequenceQuestion, QuizQuestion } from '@/domain/quiz/types';
import { gid } from '../../utils/quizBuilderUtils';

interface SequenceEditorProps {
  question: SequenceQuestion;
  onChange: (patch: Partial<QuizQuestion>) => void;
}

export function SequenceEditor({ question, onChange }: SequenceEditorProps) {
  function setItems(items: SequenceQuestion['items']) {
    onChange({ items } as Partial<QuizQuestion>);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-base-content/60">Itens na ORDEM correta (o player embaralha para o aluno).</p>
      {question.items.map((it, i) => (
        <div key={it.id} className="flex items-center gap-2">
          <span className="badge badge-ghost">{i + 1}</span>
          <input
            className="input input-bordered input-sm flex-1"
            value={it.text}
            onChange={e => setItems(question.items.map((ii, idx) => (idx === i ? { ...ii, text: e.target.value } : ii)))}
            placeholder={`Item ${i + 1}`}
          />
          <button
            className="btn btn-ghost btn-xs text-error"
            onClick={() => setItems(question.items.filter((_, idx) => idx !== i))}
            disabled={question.items.length <= 2}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        className="btn btn-ghost btn-xs gap-1"
        onClick={() => setItems([...question.items, { id: gid('i'), text: '' }])}
      >
        <Plus className="w-3.5 h-3.5" /> Adicionar item
      </button>
    </div>
  );
}
