'use client';

import { Plus, Trash2, Save, X } from 'lucide-react';
import { useLibraryCategoryManager } from './hooks/useLibraryCategoryManager';

interface LibraryCategoryManagerProps {
  onClose: () => void;
}

export function LibraryCategoryManager({ onClose }: LibraryCategoryManagerProps) {
  const {
    categories, loading, error,
    creating, editing,
    form, saving,
    deleteTarget, setDeleteTarget,
    openCreate, openEdit, closeForm,
    patchForm, save, confirmRemove,
    slugify,
  } = useLibraryCategoryManager();

  const showForm = creating || !!editing;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Categorias da biblioteca</h3>
        <div className="flex gap-2">
          <button type="button" className="btn btn-primary btn-sm gap-1" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Nova
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Voltar</button>
        </div>
      </div>

      {loading && <div className="alert alert-info text-sm"><span>Carregando...</span></div>}
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {showForm && (
        <div className="card bg-base-100 border border-primary">
          <div className="card-body p-4 gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{editing ? 'Editar' : 'Nova'} categoria</h4>
              <button type="button" className="btn btn-ghost btn-xs" onClick={closeForm}><X className="w-4 h-4" /></button>
            </div>
            <label className="form-control">
              <span className="label-text text-xs mb-1">Nome</span>
              <input className="input input-bordered input-sm" value={form.name} onChange={e => patchForm({ name: e.target.value })} />
            </label>
            <label className="form-control">
              <span className="label-text text-xs mb-1">Slug (vazio gera automático)</span>
              <input className="input input-bordered input-sm" value={form.slug} onChange={e => patchForm({ slug: e.target.value })} placeholder={slugify(form.name)} />
            </label>
            <label className="form-control">
              <span className="label-text text-xs mb-1">Descrição</span>
              <input className="input input-bordered input-sm" value={form.description} onChange={e => patchForm({ description: e.target.value })} />
            </label>
            <label className="form-control max-w-xs">
              <span className="label-text text-xs mb-1">Ordem</span>
              <input type="number" className="input input-bordered input-sm" value={form.order} onChange={e => patchForm({ order: Number(e.target.value) })} />
            </label>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost btn-sm" onClick={closeForm}>Cancelar</button>
              <button className="btn btn-primary btn-sm gap-1" onClick={save} disabled={saving || form.name.trim().length === 0}>
                <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {categories.map(c => (
          <li key={c.id} className="card bg-base-100 border border-base-300">
            <div className="card-body p-3 flex-row items-center gap-2">
              <div className="flex-1">
                <span className="text-sm font-semibold">{c.name}</span>
                <span className="badge badge-ghost badge-xs ml-2">{c.slug}</span>
                {c.description && <p className="text-xs text-base-content/60 mt-1">{c.description}</p>}
              </div>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => openEdit(c)}>Editar</button>
              <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => setDeleteTarget(c)}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!loading && categories.length === 0 && !showForm && (
        <p className="text-center text-sm text-base-content/60">Nenhuma categoria. Crie a primeira.</p>
      )}

      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Remover categoria</h3>
            <p className="text-sm text-base-content/70 mb-3">Remover <strong>{deleteTarget.name}</strong>? Livros não são afetados.</p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn btn-error btn-sm" onClick={confirmRemove}>Remover</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)} />
        </div>
      )}
    </div>
  );
}
