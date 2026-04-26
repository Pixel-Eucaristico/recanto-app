'use client';

import { GripVertical, Trash2 } from 'lucide-react';
import type { QuizQuestion, QuestionKind } from '@/domain/quiz/types';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { KIND_LABELS } from '../utils/quizBuilderUtils';
import { KindEditor } from './KindEditor';

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  totalCount: number;
  onUpdate: (patch: Partial<QuizQuestion>) => void;
  onRemove: () => void;
  onChangeKind: (kind: QuestionKind) => void;
}

export function QuestionCard({ question, index, totalCount, onUpdate, onRemove, onChangeKind }: QuestionCardProps) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3">
        <div className="flex items-start gap-2">
          <GripVertical className="w-5 h-5 text-base-content/30 mt-1" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-primary badge-sm">Pergunta {index + 1}</span>
              <select
                className="select select-bordered select-xs"
                value={question.kind ?? 'multiple_choice'}
                onChange={e => onChangeKind(e.target.value as QuestionKind)}
              >
                {(Object.keys(KIND_LABELS) as QuestionKind[]).map(k => (
                  <option key={k} value={k}>{KIND_LABELS[k]}</option>
                ))}
              </select>
              <button
                className="btn btn-ghost btn-xs text-error ml-auto"
                onClick={onRemove}
                disabled={totalCount <= 1}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <MarkdownField
              value={question.text}
              onChange={v => onUpdate({ text: v })}
              placeholder="Enunciado... (Markdown + YouTube/imagens)"
              height={120}
              preview="live"
            />

            <KindEditor question={question} onChange={onUpdate} />

            <label className="form-control">
              <span className="label-text text-xs mb-1">Explicação (Markdown, opcional)</span>
              <MarkdownField
                value={question.explanation ?? ''}
                onChange={v => onUpdate({ explanation: v })}
                placeholder="Por que essa é a resposta correta?"
                height={100}
                preview="live"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
