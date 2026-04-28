'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ClassifyQuestion, QuizQuestion } from '@/domain/quiz/types';
import { gid } from '../../utils/quizBuilderUtils';

interface ClassifyEditorProps {
  question: ClassifyQuestion;
  onChange: (patch: Partial<QuizQuestion>) => void;
}

export function ClassifyEditor({ question, onChange }: ClassifyEditorProps) {
  function setBuckets(buckets: ClassifyQuestion['buckets']) {
    onChange({ buckets } as Partial<QuizQuestion>);
  }
  function setCards(cards: ClassifyQuestion['cards']) {
    onChange({ cards } as Partial<QuizQuestion>);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-base-content/60 mb-2">Categorias</p>
        <div className="space-y-2">
          {question.buckets.map((b, i) => (
            <div key={b.id} className="flex items-center gap-2">
              <input
                className="input input-bordered input-sm flex-1"
                value={b.label}
                onChange={e => setBuckets(question.buckets.map((bb, idx) => (idx === i ? { ...bb, label: e.target.value } : bb)))}
                placeholder={`Categoria ${i + 1}`}
              />
              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={() => setBuckets(question.buckets.filter((_, idx) => idx !== i))}
                disabled={question.buckets.length <= 2}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button className="btn btn-ghost btn-xs gap-1" onClick={() => setBuckets([...question.buckets, { id: gid('b'), label: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Categoria
          </button>
        </div>
      </div>
      <div>
        <p className="text-xs text-base-content/60 mb-2">Cards (texto → categoria)</p>
        <div className="space-y-2">
          {question.cards.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2">
              <input
                className="input input-bordered input-sm flex-1"
                value={c.text}
                onChange={e => setCards(question.cards.map((cc, idx) => (idx === i ? { ...cc, text: e.target.value } : cc)))}
                placeholder={`Card ${i + 1}`}
              />
              <select
                className="select select-bordered select-sm"
                value={c.bucket_id}
                onChange={e => setCards(question.cards.map((cc, idx) => (idx === i ? { ...cc, bucket_id: e.target.value } : cc)))}
              >
                <option value="">— categoria —</option>
                {question.buckets.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={() => setCards(question.cards.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            className="btn btn-ghost btn-xs gap-1"
            onClick={() => setCards([...question.cards, { id: gid('c'), text: '', bucket_id: question.buckets[0]?.id ?? '' }])}
          >
            <Plus className="w-3.5 h-3.5" /> Card
          </button>
        </div>
      </div>
    </div>
  );
}
