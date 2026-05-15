'use client';

import { Layers, Pencil, Trash2, BookOpen, Plus } from 'lucide-react';
import type { FormationModule } from '@/domain/formation/types';

interface ModuleListProps {
  modules: FormationModule[];
  onCreate: () => void;
  onEdit: (m: FormationModule) => void;
  onOpenLessons: (m: FormationModule) => void;
  onDelete: (m: FormationModule) => void;
}

export function ModuleList({ modules, onCreate, onEdit, onOpenLessons, onDelete }: ModuleListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Layers className="w-4 h-4" /> Módulos
        </h3>
        <button type="button" className="btn btn-primary btn-sm gap-1" onClick={onCreate}>
          <Plus className="w-4 h-4" /> Novo módulo
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-8 text-sm text-base-content/60">
          Nenhum módulo. Clique em &quot;Novo módulo&quot;.
        </div>
      ) : (
        <ul className="space-y-2">
          {modules.map(m => (
            <li key={m.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-3 gap-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="badge badge-outline badge-xs">#{m.order}</span>
                    </div>
                    <h4 className="font-semibold text-sm">{m.title}</h4>
                    {m.description && (
                      <p className="text-xs text-base-content/60 line-clamp-2 mt-0.5">{m.description}</p>
                    )}
                    <p className="text-[11px] text-base-content/40 mt-1">
                      {m.lesson_ids.length} {m.lesson_ids.length === 1 ? 'aula' : 'aulas'}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" className="btn btn-primary btn-xs gap-1" onClick={() => onOpenLessons(m)}>
                      <BookOpen className="w-3.5 h-3.5" /> Aulas
                    </button>
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => onEdit(m)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => onDelete(m)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
