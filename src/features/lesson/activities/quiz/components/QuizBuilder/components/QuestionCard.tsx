'use client';

import type { QuizQuestion, QuestionKind } from '@/domain/quiz/types';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { RichContent } from '@/shared/components/RichContent';
import { EditableCard } from '@/shared/components/EditableCard';
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
    <EditableCard
      canRemove={totalCount > 1}
      onRemove={onRemove}
      dragHandle
      badge={
        <>
          <span className="badge badge-primary badge-sm">Pergunta {index + 1}</span>
          <span className="badge badge-outline badge-xs">
            {KIND_LABELS[question.kind ?? 'multiple_choice']}
          </span>
        </>
      }
      preview={
        question.text?.trim() ? (
          <div className="text-sm">
            <RichContent markdown={question.text} className="text-sm" />
          </div>
        ) : (
          <p className="text-sm italic text-base-content/40">(sem enunciado — clique no lápis)</p>
        )
      }
      editor={
        <div className="space-y-3">
          <div>
            <span className="label-text text-xs mb-1 block">Tipo</span>
            <select
              className="select select-bordered select-sm w-full"
              value={question.kind ?? 'multiple_choice'}
              onChange={e => onChangeKind(e.target.value as QuestionKind)}
            >
              {(Object.keys(KIND_LABELS) as QuestionKind[]).map(k => (
                <option key={k} value={k}>{KIND_LABELS[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="label-text text-xs mb-1 block">Enunciado</span>
            <MarkdownField
              value={question.text}
              onChange={v => onUpdate({ text: v })}
              placeholder="Enunciado..."
              height={120}
              preview="edit"
            />
          </div>
          <KindEditor question={question} onChange={onUpdate} />
          <div>
            <span className="label-text text-xs mb-1 block">Explicação (opcional)</span>
            <MarkdownField
              value={question.explanation ?? ''}
              onChange={v => onUpdate({ explanation: v })}
              placeholder="Por que essa é a resposta correta?"
              height={100}
              preview="edit"
            />
          </div>
        </div>
      }
    />
  );
}
