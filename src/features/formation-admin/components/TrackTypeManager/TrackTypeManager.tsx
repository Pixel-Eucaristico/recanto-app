'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Save, X } from 'lucide-react';
import type { FormationTrackType } from '@/domain/formation/types';
import { useTrackTypesAdmin } from '../../hooks/useTrackTypesAdmin';

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function TrackTypeManager() {
  const { types, loading, saving, error, save, remove } = useTrackTypesAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FormationTrackType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormationTrackType | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Tag className="w-4 h-4" /> Tipos de trilha
        </h3>
        <button
          type="button"
          className="btn btn-primary btn-sm gap-1"
          onClick={() => { setEditing(null); setFormOpen(true); }}
        >
          <Plus className="w-4 h-4" /> Novo tipo
        </button>
      </div>

      <p className="text-xs text-base-content/60">
        Categorias que classificam trilhas (ex: Pré-vocacional, Vocacional). Usadas no select do form da trilha.
      </p>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {loading ? (
        <div className="alert alert-info text-sm"><span>Carregando tipos...</span></div>
      ) : types.length === 0 ? (
        <div className="text-center py-6 text-sm text-base-content/60 border border-dashed border-base-300 rounded-xl">
          Nenhum tipo cadastrado. Clique em &quot;Novo tipo&quot; pra criar o primeiro.
        </div>
      ) : (
        <ul className="space-y-2">
          {types.map(t => (
            <li key={t.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-3 gap-1 flex-row items-center flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-outline badge-xs">#{t.order}</span>
                    <span className="font-semibold text-sm">{t.label}</span>
                    <code className="text-[10px] text-base-content/50">{t.slug}</code>
                  </div>
                  {t.description && (
                    <p className="text-xs text-base-content/60 mt-0.5">{t.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => { setEditing(t); setFormOpen(true); }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => setDeleteTarget(t)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <TrackTypeFormModal
          trackType={editing}
          defaultOrder={types.length + 1}
          saving={saving}
          onSave={async input => {
            await save(input);
            setFormOpen(false);
            setEditing(null);
          }}
          onClose={() => { setFormOpen(false); setEditing(null); }}
        />
      )}

      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-base mb-2">Remover tipo</h3>
            <p className="text-sm text-base-content/70">
              Remover <strong>{deleteTarget.label}</strong>? Trilhas que usam esse tipo ficarão sem categoria.
            </p>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={async () => { await remove(deleteTarget.id); setDeleteTarget(null); }}
              >
                Remover
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)} />
        </div>
      )}
    </div>
  );
}

// ─── Form modal ────────────────────────────────────────────────────────────

interface TrackTypeFormModalProps {
  trackType: FormationTrackType | null;
  defaultOrder: number;
  saving: boolean;
  onSave: (input: { id?: string; slug: string; label: string; description?: string; order: number }) => Promise<void>;
  onClose: () => void;
}

function TrackTypeFormModal({ trackType, defaultOrder, saving, onSave, onClose }: TrackTypeFormModalProps) {
  const [label, setLabel] = useState(trackType?.label ?? '');
  const [slug, setSlug] = useState(trackType?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!!trackType);
  const [description, setDescription] = useState(trackType?.description ?? '');
  const [order, setOrder] = useState(trackType?.order ?? defaultOrder);
  const [err, setErr] = useState<string | null>(null);

  // Auto-slug enquanto user não edita slug manualmente
  function onLabelChange(v: string) {
    setLabel(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleSubmit() {
    setErr(null);
    if (!label.trim()) { setErr('Nome obrigatório.'); return; }
    if (!slug.trim()) { setErr('Slug obrigatório.'); return; }
    try {
      await onSave({
        id: trackType?.id,
        label: label.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        order,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">{trackType ? 'Editar tipo' : 'Novo tipo de trilha'}</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {err && <div className="alert alert-error text-sm mb-2"><span>{err}</span></div>}

        <div className="space-y-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Nome (exibido) *</span>
            <input
              className="input input-bordered input-sm"
              value={label}
              onChange={e => onLabelChange(e.target.value)}
              placeholder="Ex: Pré-vocacional"
              autoFocus
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Slug (identificador interno) *</span>
            <input
              className="input input-bordered input-sm font-mono text-sm"
              value={slug}
              onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
              placeholder="ex: pre-vocacional"
            />
            <span className="text-[11px] text-base-content/50 mt-1">
              Auto-gerado do nome. Só letras minúsculas, números e hífen.
            </span>
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Descrição (opcional)</span>
            <input
              className="input input-bordered input-sm"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Conhecendo a vocação"
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Ordem</span>
            <input
              type="number"
              className="input input-bordered input-sm w-24"
              value={order}
              min={1}
              onChange={e => setOrder(Number(e.target.value) || 1)}
            />
          </label>
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>Cancelar</button>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1"
            onClick={handleSubmit}
            disabled={saving || !label.trim()}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
