'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { MatchingQuestion, QuizQuestion } from '@/domain/quiz/types';
import { gid } from '../../utils/quizBuilderUtils';

interface MatchingEditorProps {
  question: MatchingQuestion;
  onChange: (patch: Partial<QuizQuestion>) => void;
}

export function MatchingEditor({ question, onChange }: MatchingEditorProps) {
  function setPairs(pairs: MatchingQuestion['pairs']) {
    onChange({ pairs } as Partial<QuizQuestion>);
  }

  return (
    <div className="space-y-2">
      {question.pairs.map((p, i) => (
        <div key={p.id} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
          <input
            className="input input-bordered input-sm"
            value={p.left}
            onChange={e => setPairs(question.pairs.map((pp, idx) => (idx === i ? { ...pp, left: e.target.value } : pp)))}
            placeholder="Coluna A"
          />
          <span className="text-base-content/40">↔</span>
          <input
            className="input input-bordered input-sm"
            value={p.right}
            onChange={e => setPairs(question.pairs.map((pp, idx) => (idx === i ? { ...pp, right: e.target.value } : pp)))}
            placeholder="Coluna B"
          />
          <button
            className="btn btn-ghost btn-xs text-error"
            onClick={() => setPairs(question.pairs.filter((_, idx) => idx !== i))}
            disabled={question.pairs.length <= 2}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        className="btn btn-ghost btn-xs gap-1"
        onClick={() => setPairs([...question.pairs, { id: gid('p'), left: '', right: '' }])}
      >
        <Plus className="w-3.5 h-3.5" /> Adicionar par
      </button>
    </div>
  );
}
