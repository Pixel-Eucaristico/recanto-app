'use client';

import { Save, X } from 'lucide-react';
import type { HabitCategory, HabitSource } from '@/domain/habits/types';
import type { Role } from '@/shared/types/role';

const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'oracao', label: 'Oração' },
  { value: 'estudo', label: 'Estudo' },
  { value: 'caridade', label: 'Caridade' },
  { value: 'disciplina', label: 'Disciplina' },
  { value: 'outro', label: 'Outro' },
];

const ALL_ROLES: Role[] = ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor'];

export interface HabitFormState {
  title: string;
  description: string;
  category: HabitCategory;
  required_for_roles: Role[];
  order: number;
  grace_days: number;
  source?: HabitSource;
  course_id?: string;
  duration_days?: number;
  required_completion_percent?: number;
}

interface HabitFormProps {
  isEditing: boolean;
  form: HabitFormState;
  saving: boolean;
  onPatch: (p: Partial<HabitFormState>) => void;
  onToggleRole: (r: Role) => void;
  onSave: () => void;
  onClose: () => void;
}

export function HabitForm({ isEditing, form, saving, onPatch, onToggleRole, onSave, onClose }: HabitFormProps) {
  return (
    <div className="card bg-base-100 border border-primary">
      <div className="card-body gap-2 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">{isEditing ? 'Editar hábito' : 'Novo hábito'}</h4>
          <button type="button" className="btn btn-ghost btn-xs" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        <label className="form-control">
          <span className="label-text text-xs mb-1">Título</span>
          <input className="input input-bordered input-sm" value={form.title} onChange={e => onPatch({ title: e.target.value })} placeholder="Ex.: Santo Terço" />
        </label>

        <label className="form-control">
          <span className="label-text text-xs mb-1">Descrição (opcional)</span>
          <input className="input input-bordered input-sm" value={form.description} onChange={e => onPatch({ description: e.target.value })} />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Categoria</span>
            <select className="select select-bordered select-sm" value={form.category} onChange={e => onPatch({ category: e.target.value as HabitCategory })}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Ordem</span>
            <input type="number" className="input input-bordered input-sm" value={form.order} onChange={e => onPatch({ order: Number(e.target.value) })} />
          </label>
        </div>

        <div className="form-control">
          <span className="label-text text-xs mb-1">Obrigatório para:</span>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map(r => (
              <label key={r} className="label cursor-pointer gap-1 py-0">
                <input type="checkbox" className="checkbox checkbox-xs" checked={form.required_for_roles.includes(r)} onChange={() => onToggleRole(r)} />
                <span className="label-text text-xs">{r}</span>
              </label>
            ))}
          </div>
          <span className="text-xs text-base-content/50 mt-1">Deixe vazio pra que o hábito apareça pra todos.</span>
        </div>

        <label className="form-control max-w-xs">
          <span className="label-text text-xs mb-1">Janela retroativa (dias)</span>
          <input type="number" min={0} max={30} className="input input-bordered input-sm" value={form.grace_days} onChange={e => onPatch({ grace_days: Number(e.target.value) })} />
          <span className="text-[10px] text-base-content/50 mt-1">Quantos dias atrás o usuário pode registrar. Default 3.</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Origem</span>
            <select
              className="select select-bordered select-sm"
              value={form.source ?? 'community'}
              onChange={e => onPatch({ source: e.target.value as HabitSource })}
            >
              <option value="community">Comunidade (permanente)</option>
              <option value="course">Curso (temporário)</option>
              <option value="user">Pessoal</option>
            </select>
          </label>

          {form.source === 'course' && (
            <label className="form-control">
              <span className="label-text text-xs mb-1">ID da trilha (curso)</span>
              <input
                className="input input-bordered input-sm"
                value={form.course_id ?? ''}
                onChange={e => onPatch({ course_id: e.target.value })}
                placeholder="track_id"
              />
            </label>
          )}

          <label className="form-control">
            <span className="label-text text-xs mb-1">Duração (dias) — vazio = permanente</span>
            <input
              type="number"
              min={0}
              className="input input-bordered input-sm"
              value={form.duration_days ?? ''}
              onChange={e => onPatch({ duration_days: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="ex: 7"
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Gate % conclusão (libera próxima aula)</span>
            <input
              type="number"
              min={0}
              max={100}
              className="input input-bordered input-sm"
              value={form.required_completion_percent ?? ''}
              onChange={e => onPatch({ required_completion_percent: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="ex: 80"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm gap-1" onClick={onSave} disabled={saving || form.title.trim().length === 0}>
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
