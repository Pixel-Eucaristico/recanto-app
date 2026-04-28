'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import type { BookReference, CitationStyle, ReferenceType } from '@/domain/library/types';
import { CitationFormatter } from '@/domain/library/entities/CitationFormatter';

const STYLE_LABELS: Record<CitationStyle, string> = {
  abnt: 'ABNT NBR 6023:2018',
  apa: 'APA 7ª Edição',
  chicago: 'Chicago 17ª Edição',
};

const TYPE_LABELS: Record<ReferenceType, string> = {
  book: 'Livro',
  article: 'Artigo',
  website: 'Site / Recurso online',
  chapter_in_book: 'Capítulo de livro',
  thesis: 'Dissertação / Tese',
};

function emptyRef(): BookReference {
  return {
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: 'book',
    authors: [''],
    title: '',
  };
}

interface BibliographyEditorProps {
  references: BookReference[];
  citationStyle: CitationStyle;
  onChange: (refs: BookReference[], style: CitationStyle) => void;
}

export function BibliographyEditor({ references, citationStyle, onChange }: BibliographyEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookReference | null>(null);

  function startNew() {
    const r = emptyRef();
    setDraft(r);
    setEditingId(r.id);
  }

  function startEdit(ref: BookReference) {
    setDraft({ ...ref });
    setEditingId(ref.id);
  }

  function cancelEdit() {
    setDraft(null);
    setEditingId(null);
  }

  function saveRef() {
    if (!draft) return;
    const exists = references.some(r => r.id === draft.id);
    const updated = exists
      ? references.map(r => r.id === draft.id ? draft : r)
      : [...references, draft];
    onChange(updated, citationStyle);
    cancelEdit();
  }

  function deleteRef(id: string) {
    onChange(references.filter(r => r.id !== id), citationStyle);
  }

  function updateDraft(patch: Partial<BookReference>) {
    setDraft(prev => prev ? { ...prev, ...patch } : prev);
  }

  function updateAuthor(i: number, value: string) {
    if (!draft) return;
    const authors = [...draft.authors];
    authors[i] = value;
    updateDraft({ authors });
  }

  function addAuthor() {
    if (!draft) return;
    updateDraft({ authors: [...draft.authors, ''] });
  }

  function removeAuthor(i: number) {
    if (!draft) return;
    updateDraft({ authors: draft.authors.filter((_, idx) => idx !== i) });
  }

  // Sort alphabetically by first author
  const sorted = [...references].sort((a, b) =>
    (a.authors[0] ?? '').localeCompare(b.authors[0] ?? ''),
  );

  return (
    <div className="space-y-4">
      {/* Citation style selector */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <h4 className="font-semibold text-sm">Norma de citação</h4>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(STYLE_LABELS) as CitationStyle[]).map(s => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm ${citationStyle === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => onChange(references, s)}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-xs text-base-content/60">{STYLE_LABELS[citationStyle]}</p>
        </div>
      </div>

      {/* Reference list */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map(ref => (
            <div key={ref.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-3 gap-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="badge badge-outline badge-xs mb-1">{TYPE_LABELS[ref.type]}</span>
                    <p className="text-xs text-base-content/80 font-mono leading-relaxed">
                      {CitationFormatter.format(ref, citationStyle)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => editingId === ref.id ? cancelEdit() : startEdit(ref)}
                    >
                      {editingId === ref.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => deleteRef(ref.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {editingId === ref.id && draft && (
                  <RefForm
                    draft={draft}
                    onUpdate={updateDraft}
                    onAuthorChange={updateAuthor}
                    onAddAuthor={addAuthor}
                    onRemoveAuthor={removeAuthor}
                    onSave={saveRef}
                    onCancel={cancelEdit}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New reference form */}
      {editingId && !references.some(r => r.id === editingId) && draft ? (
        <div className="card bg-base-100 border border-primary">
          <div className="card-body p-4 gap-3">
            <h4 className="font-semibold text-sm">Nova referência</h4>
            <RefForm
              draft={draft}
              onUpdate={updateDraft}
              onAuthorChange={updateAuthor}
              onAddAuthor={addAuthor}
              onRemoveAuthor={removeAuthor}
              onSave={saveRef}
              onCancel={cancelEdit}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-outline btn-sm gap-1 w-full"
          onClick={startNew}
        >
          <Plus className="w-4 h-4" /> Adicionar referência
        </button>
      )}
    </div>
  );
}

// ─── Reference form (shared for new + edit) ────────────────────────────────

interface RefFormProps {
  draft: BookReference;
  onUpdate: (patch: Partial<BookReference>) => void;
  onAuthorChange: (i: number, v: string) => void;
  onAddAuthor: () => void;
  onRemoveAuthor: (i: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

function RefForm({ draft, onUpdate, onAuthorChange, onAddAuthor, onRemoveAuthor, onSave, onCancel }: RefFormProps) {
  const showJournal = draft.type === 'article' || draft.type === 'chapter_in_book';
  const showPublisher = draft.type !== 'website';

  return (
    <div className="space-y-3 border-t border-base-300 pt-3">
      {/* Type */}
      <label className="form-control">
        <span className="label-text text-xs mb-1">Tipo</span>
        <select
          className="select select-bordered select-sm"
          value={draft.type}
          onChange={e => onUpdate({ type: e.target.value as ReferenceType })}
        >
          {(Object.keys(TYPE_LABELS) as ReferenceType[]).map(t => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </label>

      {/* Authors */}
      <div>
        <span className="label-text text-xs mb-1 block">Autores (SOBRENOME, Nome para ABNT)</span>
        <div className="space-y-1">
          {draft.authors.map((a, i) => (
            <div key={i} className="flex gap-1">
              <input
                className="input input-bordered input-sm flex-1"
                value={a}
                placeholder={i === 0 ? 'SILVA, João' : 'SOUZA, Maria (opcional)'}
                onChange={e => onAuthorChange(i, e.target.value)}
              />
              {draft.authors.length > 1 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRemoveAuthor(i)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={onAddAuthor}>
            <Plus className="w-3 h-3" /> Adicionar autor
          </button>
        </div>
      </div>

      {/* Title / Subtitle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="form-control">
          <span className="label-text text-xs mb-1">Título *</span>
          <input
            className="input input-bordered input-sm"
            value={draft.title}
            onChange={e => onUpdate({ title: e.target.value })}
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs mb-1">Subtítulo</span>
          <input
            className="input input-bordered input-sm"
            value={draft.subtitle ?? ''}
            onChange={e => onUpdate({ subtitle: e.target.value || undefined })}
          />
        </label>
      </div>

      {/* Journal (for articles/chapters) */}
      {showJournal && (
        <label className="form-control">
          <span className="label-text text-xs mb-1">
            {draft.type === 'article' ? 'Periódico / Revista' : 'Livro que contém o capítulo'}
          </span>
          <input
            className="input input-bordered input-sm"
            value={draft.journal ?? ''}
            onChange={e => onUpdate({ journal: e.target.value || undefined })}
          />
        </label>
      )}

      {/* Publisher / City / Year / Edition */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {showPublisher && (
          <label className="form-control col-span-2">
            <span className="label-text text-xs mb-1">Editora / Instituição</span>
            <input
              className="input input-bordered input-sm"
              value={draft.publisher ?? ''}
              onChange={e => onUpdate({ publisher: e.target.value || undefined })}
            />
          </label>
        )}
        <label className="form-control">
          <span className="label-text text-xs mb-1">Cidade</span>
          <input
            className="input input-bordered input-sm"
            value={draft.city ?? ''}
            onChange={e => onUpdate({ city: e.target.value || undefined })}
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs mb-1">Ano</span>
          <input
            type="number"
            className="input input-bordered input-sm"
            value={draft.year ?? ''}
            onChange={e => onUpdate({ year: Number(e.target.value) || undefined })}
            min={1000}
            max={2099}
          />
        </label>
      </div>

      {/* Volume / Issue / Pages / Edition */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {draft.type === 'article' && (
          <>
            <label className="form-control">
              <span className="label-text text-xs mb-1">Volume</span>
              <input className="input input-bordered input-sm" value={draft.volume ?? ''} onChange={e => onUpdate({ volume: e.target.value || undefined })} />
            </label>
            <label className="form-control">
              <span className="label-text text-xs mb-1">Número</span>
              <input className="input input-bordered input-sm" value={draft.issue ?? ''} onChange={e => onUpdate({ issue: e.target.value || undefined })} />
            </label>
          </>
        )}
        <label className="form-control">
          <span className="label-text text-xs mb-1">Páginas</span>
          <input
            className="input input-bordered input-sm"
            value={draft.pages ?? ''}
            placeholder="ex: 45-67"
            onChange={e => onUpdate({ pages: e.target.value || undefined })}
          />
        </label>
        {draft.type === 'book' && (
          <label className="form-control">
            <span className="label-text text-xs mb-1">Edição</span>
            <input className="input input-bordered input-sm" value={draft.edition ?? ''} placeholder="ex: 3" onChange={e => onUpdate({ edition: e.target.value || undefined })} />
          </label>
        )}
      </div>

      {/* URL / DOI / ISBN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <label className="form-control">
          <span className="label-text text-xs mb-1">URL</span>
          <input className="input input-bordered input-sm" type="url" value={draft.url ?? ''} onChange={e => onUpdate({ url: e.target.value || undefined })} />
        </label>
        <label className="form-control">
          <span className="label-text text-xs mb-1">DOI</span>
          <input className="input input-bordered input-sm" value={draft.doi ?? ''} onChange={e => onUpdate({ doi: e.target.value || undefined })} />
        </label>
        <label className="form-control">
          <span className="label-text text-xs mb-1">ISBN</span>
          <input className="input input-bordered input-sm" value={draft.isbn ?? ''} onChange={e => onUpdate({ isbn: e.target.value || undefined })} />
        </label>
      </div>

      {draft.type === 'website' && (
        <label className="form-control">
          <span className="label-text text-xs mb-1">Data de acesso</span>
          <input
            type="date"
            className="input input-bordered input-sm"
            value={draft.access_date ?? ''}
            onChange={e => onUpdate({ access_date: e.target.value || undefined })}
          />
        </label>
      )}

      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onSave}
          disabled={!draft.title.trim() || draft.authors.every(a => !a.trim())}
        >
          Salvar referência
        </button>
      </div>
    </div>
  );
}
