'use client';

interface ChapterMetaFormProps {
  title: string;
  subtitle: string;
  order: number;
  isDirty: boolean;
  chapterLabel: string;
  orderLocked: boolean;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  onOrderChange: (v: number) => void;
  onBack: () => void;
}

export function ChapterMetaForm({
  title, subtitle, order, isDirty, chapterLabel, orderLocked,
  onTitleChange, onSubtitleChange, onOrderChange, onBack,
}: ChapterMetaFormProps) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold flex items-center gap-2">
            {chapterLabel}
            {isDirty && <span className="badge badge-warning badge-sm">Não salvo</span>}
          </h3>
          <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={onBack}>
            Voltar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Título do capítulo</span>
            <input
              className="input input-bordered input-sm"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Capítulo nº</span>
            <input
              type="number"
              className="input input-bordered input-sm"
              value={order}
              onChange={e => onOrderChange(Number(e.target.value) || 1)}
              min={1}
              disabled={orderLocked}
              title={orderLocked ? 'Ordem fixada após criação' : ''}
            />
          </label>
        </div>
        <label className="form-control">
          <span className="label-text text-xs mb-1">Subtítulo (opcional)</span>
          <input
            className="input input-bordered input-sm"
            value={subtitle}
            onChange={e => onSubtitleChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
