'use client';

import { useEffect, useState } from 'react';
import type { Habit, HabitCategory } from '@/domain/habits/types';
import type { Role } from '@/shared/types/role';
import { habitService } from '@/application/habits/HabitService';
import type { HabitFormState } from '../components/HabitForm';

const EMPTY_FORM: HabitFormState = {
  title: '',
  description: '',
  category: 'oracao' as HabitCategory,
  required_for_roles: [],
  order: 0,
  grace_days: 3,
};

export function useHabitConfig(userId: string) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<HabitFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  async function reload() {
    setLoading(true);
    try {
      setHabits(await habitService.listAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

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
      source: h.source,
      course_id: h.course_id,
      duration_days: h.duration_days,
      required_completion_percent: h.required_completion_percent,
    });
    setError(null);
  }

  function closeForm() { setCreating(false); setEditing(null); setError(null); }

  function patchForm(p: Partial<HabitFormState>) { setForm(f => ({ ...f, ...p })); }

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
        source: form.source,
        course_id: form.course_id || undefined,
        duration_days: form.duration_days,
        required_completion_percent: form.required_completion_percent,
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

  return {
    habits, loading, error,
    editing, creating,
    form, saving,
    deleteTarget, setDeleteTarget,
    openCreate, openEdit, closeForm,
    patchForm, toggleRole,
    save, confirmRemove,
  };
}
