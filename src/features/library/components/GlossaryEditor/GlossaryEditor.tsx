'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { BookGlossaryTerm } from '@/domain/library/types';
import { RichTextEditor } from '@/shared/components/RichTextEditor';

function termId(term: string): string {
  // Stable, slug-based ID for cross-linking from text
  const slug = term.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `gt_${slug || Date.now().toString(36)}`;
}

interface GlossaryEditorProps {
  terms: BookGlossaryTerm[];
  onChange: (terms: BookGlossaryTerm[]) => void;
}

export function GlossaryEditor({ terms, onChange }: GlossaryEditorProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookGlossaryTerm | null>(null);

  function startNew() {
    const t: BookGlossaryTerm = { id: '', term: '', definition: '' };
    setDraft(t);
    setEditingId('new');
  }

  function startEdit(term: BookGlossaryTerm) {
    setDraft({ ...term });
    setEditingId(term.id);
  }

  function cancelEdit() {
    setDraft(null);
    setEditingId(null);
  }

  function saveTerm() {
    if (!draft || !draft.term.trim() || !draft.definition.trim()) return;

    const id = draft.id || termId(draft.term);
    const finalTerm: BookGlossaryTerm = { ...draft, id };

    const exists = terms.some(t => t.id === id);
    const updated = exists
      ? terms.map(t => t.id === id ? finalTerm : t)
      : [...terms, finalTerm];

    // Sort alphabetically by term
    const sorted = [...updated].sort((a, b) =>
      a.term.localeCompare(b.term, 'pt-BR', { sensitivity: 'base' }),
    );
    onChange(sorted);
    cancelEdit();
  }

  function deleteTerm(id: string) {
    onChange(terms.filter(t => t.id !== id));
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return terms;
    const q = search.toLowerCase();
    return terms.filter(t =>
      t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q),
    );
  }, [terms, search]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
        <input
          className="input input-bordered input-sm w-full pl-9"
          placeholder="Buscar termo ou definição..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Term count */}
      <p className="text-xs text-base-content/60">
        {terms.length} {terms.length === 1 ? 'termo' : 'termos'} no glossário
      </p>

      {/* Term list */}
      <div className="space-y-2">
        {filtered.map(term => (
          <div key={term.id} className="card bg-base-100 border border-base-300">
            <div className="card-body p-3 gap-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-sm">{term.term}</h5>
                  <p className="text-xs text-base-content/70 mt-1 line-clamp-3 whitespace-pre-wrap">
                    {term.definition}
                  </p>
                  <code className="text-[10px] text-base-content/40">#{term.id}</code>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => editingId === term.id ? cancelEdit() : startEdit(term)}
                  >
                    {editingId === term.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => deleteTerm(term.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {editingId === term.id && draft && (
                <TermForm
                  draft={draft}
                  allTerms={terms}
                  onChange={setDraft}
                  onSave={saveTerm}
                  onCancel={cancelEdit}
                />
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && terms.length > 0 && (
          <p className="text-center py-6 text-sm text-base-content/60">
            Nenhum termo encontrado para &quot;{search}&quot;.
          </p>
        )}
      </div>

      {/* New term form */}
      {editingId === 'new' && draft ? (
        <div className="card bg-base-100 border border-primary">
          <div className="card-body p-4 gap-3">
            <h4 className="font-semibold text-sm">Novo termo</h4>
            <TermForm
              draft={draft}
              allTerms={terms}
              onChange={setDraft}
              onSave={saveTerm}
              onCancel={cancelEdit}
            />
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-outline btn-sm gap-1 w-full" onClick={startNew}>
          <Plus className="w-4 h-4" /> Adicionar termo
        </button>
      )}
    </div>
  );
}

interface TermFormProps {
  draft: BookGlossaryTerm;
  allTerms: BookGlossaryTerm[];
  onChange: (t: BookGlossaryTerm) => void;
  onSave: () => void;
  onCancel: () => void;
}

function TermForm({ draft, allTerms, onChange, onSave, onCancel }: TermFormProps) {
  const otherTerms = allTerms.filter(t => t.id !== draft.id);

  return (
    <div className="space-y-2 border-t border-base-300 pt-3">
      <label className="form-control">
        <span className="label-text text-xs mb-1">Termo *</span>
        <input
          className="input input-bordered input-sm"
          value={draft.term}
          placeholder="ex: comensurável"
          onChange={e => onChange({ ...draft, term: e.target.value })}
        />
      </label>

      <div>
        <span className="label-text text-xs mb-1 block">Definição *</span>
        <RichTextEditor
          value={draft.definition}
          onChange={v => onChange({ ...draft, definition: v })}
          placeholder="Definição clara do termo (use a barra de ferramentas para formatar)."
          height={160}
        />
      </div>

      {otherTerms.length > 0 && (
        <label className="form-control">
          <span className="label-text text-xs mb-1">Termos relacionados (opcional)</span>
          <div className="flex flex-wrap gap-1">
            {otherTerms.map(t => {
              const selected = draft.related_terms?.includes(t.id) ?? false;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`badge badge-sm cursor-pointer ${selected ? 'badge-primary' : 'badge-outline'}`}
                  onClick={() => {
                    const cur = draft.related_terms ?? [];
                    const next = selected ? cur.filter(id => id !== t.id) : [...cur, t.id];
                    onChange({ ...draft, related_terms: next.length ? next : undefined });
                  }}
                >
                  {t.term}
                </button>
              );
            })}
          </div>
        </label>
      )}

      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onSave}
          disabled={!draft.term.trim() || !draft.definition.trim()}
        >
          Salvar termo
        </button>
      </div>
    </div>
  );
}
