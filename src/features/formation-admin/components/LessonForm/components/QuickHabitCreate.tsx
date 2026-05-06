'use client';

import { useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import type { Habit, HabitCategory } from '@/domain/habits/types';
import { habitService } from '@/application/habits/HabitService';

interface QuickHabitCreateProps {
  /** Track ID pai (curso). Hábito criado fica vinculado a este curso. */
  trackId: string | null;
  /** Lesson ID atual (opcional — só presente se aula já foi salva). */
  lessonId?: string;
  createdBy: string;
  onClose: () => void;
  onCreated: (habit: Habit) => void;
}

const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'oracao', label: 'Oração' },
  { value: 'estudo', label: 'Estudo' },
  { value: 'caridade', label: 'Caridade' },
  { value: 'disciplina', label: 'Disciplina' },
  { value: 'outro', label: 'Outro' },
];

export function QuickHabitCreate({ trackId, lessonId, createdBy, onClose, onCreated }: QuickHabitCreateProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('oracao');
  const [permanent, setPermanent] = useState(true);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [requiredPercent, setRequiredPercent] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) { setError('Título obrigatório.'); return; }
    if (!trackId) { setError('Trilha não resolvida — salve a aula primeiro.'); return; }
    setSaving(true);
    setError(null);
    try {
      const created = await habitService.saveHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        required_for_roles: [],
        order: 0,
        source: 'course',
        course_id: trackId,
        lesson_id: lessonId,
        duration_days: permanent ? undefined : durationDays,
        required_completion_percent: requiredPercent > 0 ? requiredPercent : undefined,
        created_by: createdBy,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar hábito.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base">Criar hábito vinculado</h3>
          <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="alert alert-error text-sm mb-2"><span>{error}</span></div>}

        <div className="space-y-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Título *</span>
            <input
              className="input input-bordered input-sm"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex.: Rezar Salmo 23 diariamente"
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Descrição (opcional)</span>
            <input
              className="input input-bordered input-sm"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="form-control">
              <span className="label-text text-xs mb-1">Categoria</span>
              <select
                className="select select-bordered select-sm"
                value={category}
                onChange={e => setCategory(e.target.value as HabitCategory)}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>

            <label className="form-control">
              <span className="label-text text-xs mb-1">% gate (0 = sem)</span>
              <input
                type="number"
                min={0}
                max={100}
                className="input input-bordered input-sm"
                value={requiredPercent}
                onChange={e => setRequiredPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                placeholder="ex: 80"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="form-control">
              <span className="label-text text-xs mb-1">Tipo</span>
              <div className="join w-full">
                <button
                  type="button"
                  className={`btn btn-sm join-item flex-1 ${permanent ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                  onClick={() => setPermanent(true)}
                >
                  Permanente
                </button>
                <button
                  type="button"
                  className={`btn btn-sm join-item flex-1 ${!permanent ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                  onClick={() => setPermanent(false)}
                >
                  Temporário
                </button>
              </div>
            </div>

            <label className={`form-control ${permanent ? 'opacity-40 pointer-events-none' : ''}`}>
              <span className="label-text text-xs mb-1">Duração (dias)</span>
              <input
                type="number"
                min={1}
                className="input input-bordered input-sm"
                value={permanent ? '' : durationDays}
                onChange={e => setDurationDays(Number(e.target.value) || 1)}
                disabled={permanent}
                placeholder="ex: 7"
              />
            </label>
          </div>

          <p className="text-[11px] text-base-content/60 leading-snug">
            <strong>% gate</strong>: bloqueia próxima aula até aluno cumprir o hábito X% dos dias.
            <strong> Permanente</strong> aparece sempre. <strong>Temporário</strong> roda por N dias após início.
          </p>
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1"
            onClick={handleSave}
            disabled={saving || !title.trim() || !trackId}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Criar e vincular'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
