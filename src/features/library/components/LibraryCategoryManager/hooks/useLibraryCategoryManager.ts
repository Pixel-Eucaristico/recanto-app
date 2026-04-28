'use client';

import { useEffect, useState } from 'react';
import type { BookCategory } from '@/domain/library/types';
import { libraryService } from '@/application/library/LibraryService';
import { slugify } from '../utils/slugify';

interface FormState {
  name: string;
  slug: string;
  description: string;
  order: number;
}

export function useLibraryCategoryManager() {
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BookCategory | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', slug: '', description: '', order: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BookCategory | null>(null);

  async function reload() {
    setLoading(true);
    try {
      setCategories(await libraryService.listCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  function openCreate() {
    setForm({ name: '', slug: '', description: '', order: categories.length });
    setEditing(null);
    setCreating(true);
    setError(null);
  }

  function openEdit(c: BookCategory) {
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', order: c.order });
    setEditing(c);
    setCreating(false);
    setError(null);
  }

  function closeForm() { setCreating(false); setEditing(null); setError(null); }

  function patchForm(p: Partial<FormState>) { setForm(f => ({ ...f, ...p })); }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await libraryService.saveCategory({
        id: editing?.id,
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || undefined,
        order: Number(form.order) || 0,
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
      await libraryService.deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return {
    categories, loading, error,
    creating, editing,
    form, saving,
    deleteTarget, setDeleteTarget,
    openCreate, openEdit, closeForm,
    patchForm, save, confirmRemove,
    slugify,
  };
}
