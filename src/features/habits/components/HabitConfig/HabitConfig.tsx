'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { habitService } from '@/application/habits/HabitService';
import { Habit, HabitCategory } from '@/domain/habits/types';
import { Role } from '@/shared/types/role';

const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'oracao', label: 'Oração' },
  { value: 'estudo', label: 'Estudo' },
  { value: 'caridade', label: 'Caridade' },
  { value: 'disciplina', label: 'Disciplina' },
  { value: 'outro', label: 'Outro' },
];

const ALL_ROLES: Role[] = ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor'];

interface HabitConfigProps {
  userId: string;
}

interface FormState {
  title: string;
  description: string;
  category: HabitCategory;
  required_for_roles: Role[];
  order: number;
  grace_days: number;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  category: 'oracao',
  required_for_roles: [],
  order: 0,
  grace_days: 3,
};

export function HabitConfig({ userId }: HabitConfigProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const list = await habitService.listAll();
      setHabits(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, order: habits.length });
    setCreating(true);
    setError(null);
  }

  function openEdit(h: Habit) {
    setEditing(h);
    setCreating(false);
    setForm({
      title: h.title,
      description: h.description ?? '',
      category: h.category,
      required_for_roles: h.required_for_roles ?? [],
      order: h.order,
      grace_days: h.grace_days ?? 3,
    });
    setError(null);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setError(null);
  }

  function toggleRole(r: Role) {
    setForm(f => ({
      ...f,
      required_for_roles: f.required_for_roles.includes(r)
        ? f.required_for_roles.filter(x => x !== r)
        : [...f.required_for_roles, r],
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await habitService.saveHabit({
        id: editing?.id,
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        required_for_roles: form.required_for_roles,
        order: Number(form.order) || 0,
        grace_days: Number(form.grace_days),
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
      await habitService.deleteHabit(deleteTarget.id);
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
        <h3 className="text-sm font-semibold">Hábitos cadastrados</h3>
        <button type="button" className="btn btn-primary btn-sm gap-1" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Novo hábito
        </button>
      </div>

      {loading && <div className="alert alert-info text-sm"><span>Carregando...</span></div>}
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {showForm && (
        <div className="card bg-base-100 border border-primary">
          <div className="card-body gap-2 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{editing ? 'Editar hábito' : 'Novo hábito'}</h4>
              <button type="button" className="btn btn-ghost btn-xs" onClick={closeForm}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="form-control">
              <span className="label-text text-xs mb-1">Título</span>
              <input
                className="input input-bordered input-sm"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex.: Santo Terço"
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

            <div className="grid grid-cols-2 gap-2">
              <label className="form-control">
                <span className="label-text text-xs mb-1">Categoria</span>
                <select
                  className="select select-bordered select-sm"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as HabitCategory }))}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>

              <label className="form-control">
                <span className="label-text text-xs mb-1">Ordem</span>
                <input
                  type="number"
                  className="input input-bordered input-sm"
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                />
              </label>
            </div>

            <div className="form-control">
              <span className="label-text text-xs mb-1">Obrigatório para:</span>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map(r => (
                  <label key={r} className="label cursor-pointer gap-1 py-0">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={form.required_for_roles.includes(r)}
                      onChange={() => toggleRole(r)}
                    />
                    <span className="label-text text-xs">{r}</span>
                  </label>
                ))}
              </div>
              <span className="text-xs text-base-content/50 mt-1">
                Deixe vazio pra que o hábito apareça pra todos.
              </span>
            </div>

            <label className="form-control max-w-xs">
              <span className="label-text text-xs mb-1">
                Janela retroativa (dias)
              </span>
              <input
                type="number"
                min={0}
                max={30}
                className="input input-bordered input-sm"
                value={form.grace_days}
                onChange={e => setForm(f => ({ ...f, grace_days: Number(e.target.value) }))}
              />
              <span className="text-[10px] text-base-content/50 mt-1">
                Quantos dias atrás o usuário pode registrar caso esqueça. Default 3.
              </span>
            </label>

            <div className="flex justify-end gap-2 mt-2">
              <button className="btn btn-ghost btn-sm" onClick={closeForm}>Cancelar</button>
              <button className="btn btn-primary btn-sm gap-1" onClick={save} disabled={saving || form.title.trim().length === 0}>
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
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
        <div className="text-center py-6 text-base-content/60 text-sm">
          Nenhum hábito. Crie o primeiro pra começar.
        </div>
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
