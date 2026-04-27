'use client';

import { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import type { BookReference, CitationStyle } from '@/domain/library/types';
import { CitationFormatter } from '@/domain/library/entities/CitationFormatter';
import { BibliographyEditor } from '@/features/library/components/BibliographyEditor';

interface CitationPickerModalProps {
  references: BookReference[];
  citationStyle: CitationStyle;
  onClose: () => void;
  /** Called when user picks a reference. The text is the in-text citation. */
  onPick: (citation: string) => void;
  /** Called when user adds new reference inline (saves to bibliography chapter). */
  onAddReference?: (refs: BookReference[]) => Promise<void>;
}

export function CitationPickerModal({
  references, citationStyle, onClose, onPick, onAddReference,
}: CitationPickerModalProps) {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [draftRefs, setDraftRefs] = useState<BookReference[]>(references);
  const [savingNew, setSavingNew] = useState(false);

  function inText(ref: BookReference): string {
    if (citationStyle === 'abnt') return CitationFormatter.inTextAbnt(ref);
    if (citationStyle === 'apa') return CitationFormatter.inTextApa(ref);
    return CitationFormatter.inTextApa(ref); // Chicago author-date is similar to APA
  }

  function pickRef(ref: BookReference) {
    onPick(inText(ref));
    onClose();
  }

  async function persistNewRefs(refs: BookReference[]) {
    setDraftRefs(refs);
    if (!onAddReference) return;
    setSavingNew(true);
    try {
      await onAddReference(refs);
    } finally {
      setSavingNew(false);
    }
  }

  const filtered = draftRefs.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.title.toLowerCase().includes(q)
      || r.authors.some(a => a.toLowerCase().includes(q))
      || (r.year ? String(r.year).includes(q) : false);
  });

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">Citar referência</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {!showAddForm ? (
          <>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                className="input input-bordered input-sm w-full pl-9"
                placeholder="Buscar por autor, título ou ano..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Reference list */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {filtered.length === 0 ? (
                <p className="text-center py-6 text-sm text-base-content/60">
                  {draftRefs.length === 0
                    ? 'Nenhuma referência cadastrada na bibliografia ainda.'
                    : `Nenhuma referência encontrada para "${search}".`}
                </p>
              ) : (
                filtered.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    className="card bg-base-100 border border-base-300 hover:border-primary cursor-pointer text-left w-full"
                    onClick={() => pickRef(r)}
                  >
                    <div className="card-body p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-base-content/80 leading-relaxed">
                            {CitationFormatter.format(r, citationStyle)}
                          </p>
                          <p className="text-xs text-primary mt-2">
                            <span className="badge badge-primary badge-xs mr-1">inserir</span>
                            {inText(r)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Add new */}
            <div className="modal-action mt-3">
              {onAddReference && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm gap-1"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-4 h-4" /> Adicionar nova referência
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto min-h-0">
              <BibliographyEditor
                references={draftRefs}
                citationStyle={citationStyle}
                onChange={(refs, _style) => persistNewRefs(refs)}
              />
            </div>
            <div className="modal-action mt-3">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddForm(false)}
                disabled={savingNew}
              >
                {savingNew ? 'Salvando...' : 'Voltar à seleção'}
              </button>
            </div>
          </>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
