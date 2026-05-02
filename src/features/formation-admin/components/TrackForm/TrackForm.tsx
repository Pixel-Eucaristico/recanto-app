'use client';

import { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import type { FormationTrack, TrackType, FormationTrackType } from '@/domain/formation/types';
import type { Role } from '@/shared/types/role';
import type { SaveTrackInput } from '@/application/formation/FormationAdminService';
import { formationAdminService } from '@/application/formation/FormationAdminService';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { ImagePicker } from '@/shared/components/ImagePicker';
import { userService } from '@/services/firebase';
import type { FirebaseUser } from '@/types/firebase-entities';

const ROLES: { value: Role; label: string }[] = [
  { value: 'recantiano', label: 'Recantiano' },
  { value: 'missionario', label: 'Missionário' },
  { value: 'pai', label: 'Pai/Responsável' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'benfeitor', label: 'Benfeitor' },
];

interface TrackFormProps {
  track: FormationTrack | null;
  /** Lista de outras trilhas pra picker de pré-requisitos. */
  allTracks: FormationTrack[];
  saving: boolean;
  onSave: (input: SaveTrackInput) => Promise<void>;
  onCancel: () => void;
}

export function TrackForm({ track, allTracks, saving, onSave, onCancel }: TrackFormProps) {
  const [title, setTitle] = useState(track?.title ?? '');
  const [description, setDescription] = useState(track?.description ?? '');
  const [type, setType] = useState<TrackType>(track?.type ?? '');
  const [order, setOrder] = useState(track?.order ?? 1);
  const [isPublished, setIsPublished] = useState(track?.is_published ?? false);
  const [requiredRoles, setRequiredRoles] = useState<Role[]>(track?.required_roles ?? []);
  const [thumbnailUrl, setThumbnailUrl] = useState(track?.thumbnail_url ?? '');
  const [requiresTrackIds, setRequiresTrackIds] = useState<string[]>(track?.requires_track_ids ?? []);
  const [requiresApproval, setRequiresApproval] = useState(track?.requires_formator_approval ?? false);
  const [formatorIds, setFormatorIds] = useState<string[]>(track?.formator_ids ?? []);
  const [lessonVisibility, setLessonVisibility] = useState<FormationTrack['lesson_visibility']>(track?.lesson_visibility ?? 'all');
  const [trackTypes, setTrackTypes] = useState<FormationTrackType[]>([]);
  const [eligibleFormators, setEligibleFormators] = useState<FirebaseUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Depende de track?.id (ID estável) — evita reset ao re-render do pai
  useEffect(() => {
    setTitle(track?.title ?? '');
    setDescription(track?.description ?? '');
    setType(track?.type ?? '');
    setOrder(track?.order ?? 1);
    setIsPublished(track?.is_published ?? false);
    setRequiredRoles(track?.required_roles ?? []);
    setThumbnailUrl(track?.thumbnail_url ?? '');
    setRequiresTrackIds(track?.requires_track_ids ?? []);
    setRequiresApproval(track?.requires_formator_approval ?? false);
    setFormatorIds(track?.formator_ids ?? []);
    setLessonVisibility(track?.lesson_visibility ?? 'all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id]);

  useEffect(() => {
    formationAdminService.listTrackTypes().then(setTrackTypes).catch(() => setTrackTypes([]));
    // Carrega missionários + admins (candidatos a formador)
    Promise.all([
      userService.getUsersByRole('missionario'),
      userService.getUsersByRole('admin'),
    ]).then(([missio, admins]) => {
      const merged = [...missio, ...admins].filter((u, i, arr) => arr.findIndex(x => x.id === u.id) === i);
      setEligibleFormators(merged);
    }).catch(() => setEligibleFormators([]));
  }, []);

  function toggleRole(role: Role) {
    setRequiredRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role],
    );
  }

  function toggleRequiredTrack(id: string) {
    setRequiresTrackIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id],
    );
  }

  function toggleFormator(id: string) {
    setFormatorIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
        requires_track_ids: requiresTrackIds.length ? requiresTrackIds : undefined,
        requires_formator_approval: requiresApproval || undefined,
        formator_ids: formatorIds.length ? formatorIds : undefined,
        lesson_visibility: lessonVisibility !== 'all' ? lessonVisibility : undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  // Outras trilhas pro picker de pré-requisito (exclui a própria)
  const candidateTracks = allTracks.filter(t => t.id !== track?.id);

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
                <option value="">— escolha um tipo —</option>
                {trackTypes.map(t => (
                  <option key={t.id} value={t.slug}>{t.label}{t.description ? ` — ${t.description}` : ''}</option>
                ))}
              </select>
              {trackTypes.length === 0 && (
                <span className="text-[11px] text-warning mt-1">
                  Nenhum tipo cadastrado. Crie em &quot;Gerenciar tipos de trilha&quot;.
                </span>
              )}
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

          <div>
            <span className="label-text text-xs font-medium block mb-1">Imagem de capa</span>
            <ImagePicker
              folder="formation/track-covers"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
            />
          </div>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Visibilidade das aulas (pro aluno)</span>
            <select
              className="select select-bordered select-sm"
              value={lessonVisibility ?? 'all'}
              onChange={e => setLessonVisibility(e.target.value as FormationTrack['lesson_visibility'])}
            >
              <option value="all">Todas as aulas (default)</option>
              <option value="current_only">Só a aula atual</option>
              <option value="current_and_next">Atual + próxima</option>
            </select>
            <span className="text-[11px] text-base-content/50 mt-1">Admin sempre vê tudo.</span>
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

          {/* Pré-requisitos */}
          {candidateTracks.length > 0 && (
            <div>
              <span className="label-text text-xs font-medium block mb-1">
                Pré-requisitos (concluir antes de liberar esta)
              </span>
              <div className="flex flex-wrap gap-1">
                {candidateTracks.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`badge badge-sm cursor-pointer ${requiresTrackIds.includes(t.id) ? 'badge-secondary' : 'badge-outline'}`}
                    onClick={() => toggleRequiredTrack(t.id)}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="cursor-pointer flex items-start gap-2 p-2 rounded hover:bg-base-200">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-secondary mt-0.5"
              checked={requiresApproval}
              onChange={e => setRequiresApproval(e.target.checked)}
            />
            <div className="flex-1">
              <span className="text-sm font-medium">Exigir aprovação do formador</span>
              <p className="text-xs text-base-content/60 mt-0.5">
                Aluno só vê esta trilha após cumprir pré-requisitos E ser aprovado manualmente.
              </p>
            </div>
          </label>

          {/* Formadores responsáveis */}
          {eligibleFormators.length > 0 && (
            <div>
              <span className="label-text text-xs font-medium block mb-1">
                Formadores responsáveis (podem ver progresso dos alunos)
              </span>
              <div className="flex flex-wrap gap-1">
                {eligibleFormators.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    className={`badge badge-sm cursor-pointer ${formatorIds.includes(u.id) ? 'badge-accent' : 'badge-outline'}`}
                    onClick={() => toggleFormator(u.id)}
                  >
                    {u.name || u.email}
                  </button>
                ))}
              </div>
              {formatorIds.length === 0 && (
                <p className="text-[11px] text-base-content/50 mt-1">
                  Sem formador atribuído — apenas admins veem o progresso dos alunos.
                </p>
              )}
            </div>
          )}

          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
            />
            <span className="text-sm">Publicada (visível para alunos)</span>
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
