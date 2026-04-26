'use client';

import { MarkdownField } from '@/shared/components/MarkdownField';

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
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3">
        <label className="form-control">
          <span className="label-text text-xs mb-1">Título</span>
          <input
            className="input input-bordered input-sm"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="Ex.: Avaliação — O despertar do sentido"
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs mb-1">Descrição (Markdown + imagens + YouTube)</span>
          <MarkdownField
            value={description}
            onChange={onDescriptionChange}
            placeholder="Contexto / orientação..."
            height={160}
            preview="live"
          />
        </label>
        <label className="form-control max-w-xs">
          <span className="label-text text-xs mb-1">Pontuação mínima (%)</span>
          <input
            type="number"
            className="input input-bordered input-sm"
            value={passingScore}
            min={0}
            max={100}
            onChange={e => onPassingScoreChange(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
