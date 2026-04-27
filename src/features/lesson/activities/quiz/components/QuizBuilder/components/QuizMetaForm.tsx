'use client';

import { MarkdownField } from '@/shared/components/MarkdownField';
import { RichContent } from '@/shared/components/RichContent';
import { EditableCard } from '@/shared/components/EditableCard';

interface QuizMetaFormProps {
  title: string;
  description: string;
  passingScore: number;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onPassingScoreChange: (v: number) => void;
}

export function QuizMetaForm({
  title, description, passingScore,
  onTitleChange, onDescriptionChange, onPassingScoreChange,
}: QuizMetaFormProps) {
  return (
    <EditableCard
      badge={
        <>
          <span className="badge badge-secondary badge-sm">Quiz</span>
          {title.trim() && <span className="font-semibold text-sm truncate">{title}</span>}
          <span className="badge badge-outline badge-xs">≥ {passingScore}%</span>
        </>
      }
      preview={
        <div className="space-y-1">
          {!title.trim() && (
            <p className="text-sm italic text-base-content/40">(sem título — clique no lápis)</p>
          )}
          {description.trim() ? (
            <RichContent markdown={description} className="text-sm" />
          ) : (
            <p className="text-xs italic text-base-content/40">(sem descrição)</p>
          )}
        </div>
      }
      editor={
        <div className="space-y-3">
          <div>
            <span className="label-text text-xs mb-1 block">Título</span>
            <input
              className="input input-bordered input-sm w-full"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="Ex.: Avaliação — O despertar do sentido"
            />
          </div>
          <div>
            <span className="label-text text-xs mb-1 block">Descrição (Markdown + imagens + YouTube)</span>
            <MarkdownField
              value={description}
              onChange={onDescriptionChange}
              placeholder="Contexto / orientação..."
              height={160}
              preview="edit"
            />
          </div>
          <div>
            <span className="label-text text-xs mb-1 block">Pontuação mínima (%)</span>
            <input
              type="number"
              className="input input-bordered input-sm w-32"
              value={passingScore}
              min={0}
              max={100}
              onChange={e => onPassingScoreChange(Number(e.target.value))}
            />
          </div>
        </div>
      }
    />
  );
}
