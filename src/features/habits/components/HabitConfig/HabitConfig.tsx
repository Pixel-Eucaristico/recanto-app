'use client';

import { Plus, Trash2 } from 'lucide-react';
import { HabitForm } from './components/HabitForm';
import { useHabitConfig } from './hooks/useHabitConfig';

interface HabitConfigProps {
  userId: string;
}

export function HabitConfig({ userId }: HabitConfigProps) {
  const {
    habits, loading, error,
    editing, creating,
    form, saving,
    deleteTarget, setDeleteTarget,
    openCreate, openEdit, closeForm,
    patchForm, toggleRole,
    save, confirmRemove,
  } = useHabitConfig(userId);

  const showForm = creating || !!editing;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Hábitos cadastrados</h3>
        <button type="button" className="btn btn-primary btn-sm gap-1" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Novo hábito
        </button>
      </div>

      {loading && <div className="alert alert-info text-sm"><span>Carregando...</span></div>}
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {showForm && (
        <HabitForm
          isEditing={!!editing}
          form={form}
          saving={saving}
          onPatch={patchForm}
          onToggleRole={toggleRole}
          onSave={save}
          onClose={closeForm}
        />
      )}

      <ul className="space-y-2">
        {habits.map(h => (
          <li key={h.id} className="card bg-base-100 border border-base-300">
            <div className="card-body p-3 flex-row items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{h.title}</span>
                  <span className="badge badge-ghost badge-xs">{h.category}</span>
                  <span className="badge badge-ghost badge-xs">janela {(h.grace_days ?? 3) + 1}d</span>
                  {h.required_for_roles.length > 0 && (
                    <span className="badge badge-outline badge-xs">{h.required_for_roles.join(', ')}</span>
                  )}
                </div>
                {h.description && <p className="text-xs text-base-content/60 mt-1">{h.description}</p>}
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => openEdit(h)}>Editar</button>
              <button className="btn btn-ghost btn-xs text-error" onClick={() => setDeleteTarget(h)}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!loading && habits.length === 0 && !showForm && (
        <div className="text-center py-6 text-base-content/60 text-sm">Nenhum hábito. Crie o primeiro pra começar.</div>
      )}

      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Remover hábito</h3>
            <p className="text-sm text-base-content/70 mb-3">
              Remover <strong>{deleteTarget.title}</strong>? Logs existentes são preservados.
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
