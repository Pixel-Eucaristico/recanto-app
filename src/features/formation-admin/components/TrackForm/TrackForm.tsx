'use client';

import { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import type { FormationTrack, TrackType } from '@/domain/formation/types';
import type { Role } from '@/shared/types/role';
import type { SaveTrackInput } from '@/application/formation/FormationAdminService';
import { RichTextEditor } from '@/shared/components/RichTextEditor';

const TRACK_TYPES: { value: TrackType; label: string; description: string }[] = [
  { value: 'pre-vocacional', label: 'Pré-vocacional', description: 'Conhecendo a vocação' },
  { value: 'vocacional', label: 'Vocacional', description: 'Aprofundamento vocacional' },
  { value: 'etapas', label: 'Etapas', description: 'Trilha em etapas progressivas' },
  { value: 'continua', label: 'Contínua', description: 'Formação permanente' },
];

const ROLES: { value: Role; label: string }[] = [
  { value: 'recantiano', label: 'Recantiano' },
  { value: 'missionario', label: 'Missionário' },
  { value: 'pai', label: 'Pai/Responsável' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'benfeitor', label: 'Benfeitor' },
];

interface TrackFormProps {
  track: FormationTrack | null;
  saving: boolean;
  onSave: (input: SaveTrackInput) => Promise<void>;
  onCancel: () => void;
}

export function TrackForm({ track, saving, onSave, onCancel }: TrackFormProps) {
  const [title, setTitle] = useState(track?.title ?? '');
  const [description, setDescription] = useState(track?.description ?? '');
  const [type, setType] = useState<TrackType>(track?.type ?? 'continua');
  const [order, setOrder] = useState(track?.order ?? 1);
  const [isPublished, setIsPublished] = useState(track?.is_published ?? false);
  const [requiredRoles, setRequiredRoles] = useState<Role[]>(track?.required_roles ?? []);
  const [thumbnailUrl, setThumbnailUrl] = useState(track?.thumbnail_url ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(track?.title ?? '');
    setDescription(track?.description ?? '');
    setType(track?.type ?? 'continua');
    setOrder(track?.order ?? 1);
    setIsPublished(track?.is_published ?? false);
    setRequiredRoles(track?.required_roles ?? []);
    setThumbnailUrl(track?.thumbnail_url ?? '');
  }, [track]);

  function toggleRole(role: Role) {
    setRequiredRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role],
    );
  }

  async function handleSubmit() {
    setError(null);
    if (!title.trim()) { setError('Título obrigatório.'); return; }
    try {
      await onSave({
        id: track?.id,
        title,
        description,
        type,
        order,
        is_published: isPublished,
        required_roles: requiredRoles,
        thumbnail_url: thumbnailUrl || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h2 className="text-base font-bold">{track ? 'Editar trilha' : 'Nova trilha'}</h2>
      </div>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Título *</span>
            <input
              className="input input-bordered input-sm"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Catequese — Etapa 1"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="label-text text-xs font-medium text-base-content/80">Descrição (markdown)</span>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Descreva a trilha, público-alvo, objetivos..."
              height={140}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="form-control">
              <span className="label-text text-xs mb-1">Tipo</span>
              <select
                className="select select-bordered select-sm"
                value={type}
                onChange={e => setType(e.target.value as TrackType)}
              >
                {TRACK_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label} — {t.description}</option>
                ))}
              </select>
            </label>

            <label className="form-control">
              <span className="label-text text-xs mb-1">Ordem</span>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={order}
                min={1}
                onChange={e => setOrder(Number(e.target.value) || 1)}
              />
            </label>
          </div>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Imagem de capa (URL)</span>
            <input
              type="url"
              className="input input-bordered input-sm"
              value={thumbnailUrl}
              placeholder="https://..."
              onChange={e => setThumbnailUrl(e.target.value)}
            />
          </label>

          <div>
            <span className="label-text text-xs mb-1 block">Quem pode acessar (vazio = todos)</span>
            <div className="flex flex-wrap gap-1">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={`badge badge-sm cursor-pointer ${requiredRoles.includes(r.value) ? 'badge-primary' : 'badge-outline'}`}
                  onClick={() => toggleRole(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
            />
            <span className="text-sm">Publicado (visível para alunos)</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button
          type="button"
          className="btn btn-primary btn-sm gap-1"
          onClick={handleSubmit}
          disabled={saving || !title.trim()}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar trilha'}
        </button>
      </div>
    </div>
  );
}
