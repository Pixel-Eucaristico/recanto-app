'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { communityService } from '@/application/community/CommunityService';
import { CommunityCategory } from '@/domain/community/types';
import { useCategories } from '@/features/community/hooks/useCategories';

interface CategoryManagerProps {
  userId: string;
}

export function CategoryManager({ userId }: CategoryManagerProps) {
  const { categories, loading, reload } = useCategories();
  const [editing, setEditing] = useState<CommunityCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', order: 0 });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommunityCategory | null>(null);

  function openCreate() {
    setForm({ name: '', description: '', order: categories.length });
    setEditing(null);
    setCreating(true);
    setError(null);
  }

  function openEdit(c: CommunityCategory) {
    setForm({ name: c.name, description: c.description ?? '', order: c.order });
    setEditing(c);
    setCreating(false);
    setError(null);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setError(null);
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      await communityService.saveCategory({
        id: editing?.id,
        name: form.name,
        description: form.description || undefined,
        order: Number(form.order) || 0,
        created_by: userId,
      });
      closeForm();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function confirmRemove() {
    if (!deleteTarget) return;
    try {
      await communityService.deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const showForm = creating || !!editing;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Categorias do fórum</h3>
        <button type="button" className="btn btn-primary btn-sm gap-1" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Nova categoria
        </button>
      </div>

      {loading && <div className="alert alert-info text-sm"><span>Carregando...</span></div>}

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {showForm && (
        <div className="card bg-base-100 border border-primary">
          <div className="card-body gap-2 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{editing ? 'Editar categoria' : 'Nova categoria'}</h4>
              <button type="button" className="btn btn-ghost btn-xs" onClick={closeForm}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="form-control">
              <span className="label-text text-xs mb-1">Nome</span>
              <input
                className="input input-bordered input-sm"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex.: Dúvidas, Testemunhos, Enquetes"
              />
            </label>
            <label className="form-control">
              <span className="label-text text-xs mb-1">Descrição (opcional)</span>
              <input
                className="input input-bordered input-sm"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </label>
            <label className="form-control max-w-xs">
              <span className="label-text text-xs mb-1">Ordem de exibição</span>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={form.order}
                onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost btn-sm" onClick={closeForm}>Cancelar</button>
              <button
                className="btn btn-primary btn-sm gap-1"
                onClick={save}
                disabled={saving || form.name.trim().length === 0}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar'}
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{c.name}</span>
                  <span className="badge badge-ghost badge-xs">{c.slug}</span>
                  {c.course_track_id && <span className="badge badge-info badge-xs">curso</span>}
                </div>
                {c.description && <p className="text-xs text-base-content/60">{c.description}</p>}
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => openEdit(c)}>Editar</button>
              <button className="btn btn-ghost btn-xs text-error" onClick={() => setDeleteTarget(c)}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!loading && categories.length === 0 && !showForm && (
        <div className="text-center py-6 text-base-content/60 text-sm">
          Nenhuma categoria. Crie a primeira pra organizar o fórum.
        </div>
      )}

      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Remover categoria</h3>
            <p className="text-sm text-base-content/70 mb-3">
              Remover <strong>{deleteTarget.name}</strong>? Posts existentes ficarão sem categoria até que você atribua outra.
            </p>
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
