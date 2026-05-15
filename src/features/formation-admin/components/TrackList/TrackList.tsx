'use client';

import Image from 'next/image';
import { BookOpen, Lock, Pencil, Trash2, Layers } from 'lucide-react';
import type { FormationTrack } from '@/domain/formation/types';

const TYPE_LABELS: Record<FormationTrack['type'], string> = {
  'pre-vocacional': 'Pré-vocacional',
  'vocacional': 'Vocacional',
  'etapas': 'Etapas',
  'continua': 'Contínua',
};

interface TrackListProps {
  tracks: FormationTrack[];
  onEdit: (t: FormationTrack) => void;
  onOpenModules: (t: FormationTrack) => void;
  onDelete: (t: FormationTrack) => void;
}

export function TrackList({ tracks, onEdit, onOpenModules, onDelete }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-base-content/60">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Nenhuma trilha ainda. Clique em &quot;Nova trilha&quot;.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {tracks.map(t => (
        <div key={t.id} className="card bg-base-100 border border-base-300 hover:border-primary transition-colors">
          {t.thumbnail_url && (
            <figure className="aspect-video bg-base-200 relative overflow-hidden rounded-t-2xl">
              <Image src={t.thumbnail_url} alt={t.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
            </figure>
          )}
          <div className="card-body p-3 gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap mb-1">
                  <span className="badge badge-outline badge-xs">{TYPE_LABELS[t.type]}</span>
                  <span className="badge badge-outline badge-xs">#{t.order}</span>
                  {!t.is_published && (
                    <span className="badge badge-warning badge-xs gap-1">
                      <Lock className="w-2.5 h-2.5" /> rascunho
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm">{t.title}</h3>
                {t.description && (
                  <p className="text-xs text-base-content/60 line-clamp-2 mt-1">{t.description}</p>
                )}
                <p className="text-[11px] text-base-content/40 mt-1">
                  {t.module_ids.length} {t.module_ids.length === 1 ? 'módulo' : 'módulos'}
                </p>
              </div>
            </div>

            <div className="flex gap-1 mt-1">
              <button
                type="button"
                className="btn btn-primary btn-sm flex-1 gap-1"
                onClick={() => onOpenModules(t)}
              >
                <Layers className="w-3.5 h-3.5" /> Módulos
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(t)} title="Editar">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => onDelete(t)} title="Remover">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
