'use client';

import type { BookSectionKind } from '@/domain/library/types';

const SECTION_KINDS: { value: BookSectionKind; label: string; group: string }[] = [
  // Front matter
  { value: 'preface',      label: 'Prefácio',          group: 'Pré-textual' },
  { value: 'introduction', label: 'Introdução',         group: 'Pré-textual' },
  { value: 'credits',      label: 'Créditos / Folha de Rosto', group: 'Pré-textual' },
  // Body matter
  { value: 'chapter',     label: 'Capítulo',           group: 'Conteúdo' },
  // Back matter
  { value: 'appendix',    label: 'Apêndice',           group: 'Pós-textual' },
  { value: 'notes',       label: 'Notas de Estudo',    group: 'Pós-textual' },
  { value: 'glossary',    label: 'Glossário',          group: 'Pós-textual' },
  { value: 'bibliography',label: 'Bibliografia',       group: 'Pós-textual' },
  { value: 'about',       label: 'Sobre o Projeto',    group: 'Pós-textual' },
];

const GROUPS = ['Pré-textual', 'Conteúdo', 'Pós-textual'];

interface ChapterMetaFormProps {
  title: string;
  subtitle: string;
  order: number;
  kind: BookSectionKind;
  isDirty: boolean;
  chapterLabel: string;
  orderLocked: boolean;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  onOrderChange: (v: number) => void;
  onKindChange: (v: BookSectionKind) => void;
  onBack: () => void;
}

export function ChapterMetaForm({
  title, subtitle, order, kind, isDirty, chapterLabel, orderLocked,
  onTitleChange, onSubtitleChange, onOrderChange, onKindChange, onBack,
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

        {/* Tipo de seção */}
        <label className="form-control">
          <span className="label-text text-xs mb-1">Tipo de seção</span>
          <select
            className="select select-bordered select-sm"
            value={kind}
            onChange={e => onKindChange(e.target.value as BookSectionKind)}
          >
            {GROUPS.map(group => (
              <optgroup key={group} label={group}>
                {SECTION_KINDS.filter(k => k.group === group).map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Título da seção</span>
            <input
              className="input input-bordered input-sm"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Ordem nº</span>
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
