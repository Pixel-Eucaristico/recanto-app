'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import type { FormationModule } from '@/domain/formation/types';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { ImagePicker } from '@/shared/components/ImagePicker';

interface ModuleFormProps {
  module: FormationModule | null;
  trackId: string;
  defaultOrder: number;
  saving: boolean;
  onSave: (input: { id?: string; track_id: string; title: string; description: string; order: number; thumbnail_url?: string }) => Promise<void>;
  onClose: () => void;
}

export function ModuleForm({ module, trackId, defaultOrder, saving, onSave, onClose }: ModuleFormProps) {
  const [title, setTitle] = useState(module?.title ?? '');
  const [description, setDescription] = useState(module?.description ?? '');
  const [order, setOrder] = useState(module?.order ?? defaultOrder);
  const [thumbnailUrl, setThumbnailUrl] = useState(module?.thumbnail_url ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(module?.title ?? '');
    setDescription(module?.description ?? '');
    setOrder(module?.order ?? defaultOrder);
    setThumbnailUrl(module?.thumbnail_url ?? '');
  }, [module, defaultOrder]);

  async function handleSubmit() {
    setError(null);
    if (!title.trim()) { setError('Título obrigatório.'); return; }
    try {
      await onSave({
        id: module?.id,
        track_id: trackId,
        title,
        description,
        order,
        thumbnail_url: thumbnailUrl || undefined,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">{module ? 'Editar módulo' : 'Novo módulo'}</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
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
              placeholder="Ex: Introdução à oração"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="label-text text-xs font-medium text-base-content/80">Descrição (markdown)</span>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Descreva o módulo..."
              height={140}
            />
          </div>

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

          <div>
            <span className="label-text text-xs font-medium block mb-1">Imagem do módulo</span>
            <ImagePicker
              folder="formation/module-covers"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
            />
          </div>
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary btn-sm gap-1" onClick={handleSubmit} disabled={saving || !title.trim()}>
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
