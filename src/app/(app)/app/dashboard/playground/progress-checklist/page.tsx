'use client';

import { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { LessonChecklist, TrackChecklist } from '@/features/progress-checklist';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

export default function ProgressChecklistPlaygroundPage() {
  const user = useCurrentUser();
  const [trackId, setTrackId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  if (!user) return <div className="p-6">Faça login para testar.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <ListChecks className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground: Checklist de progresso</h1>
            <p className="text-base-content/60 text-sm">
              Widget que agrega <code>LessonProgress</code> + <code>FormationLesson</code> — mostra requisitos ativos e % de conclusão.
            </p>
          </div>
        </div>
      </header>

      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold">IDs de teste</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Track ID</span>
            <input
              className="input input-bordered input-sm"
              value={trackId}
              onChange={e => setTrackId(e.target.value)}
              placeholder="ex.: pre-vocacional"
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Module ID</span>
            <input
              className="input input-bordered input-sm"
              value={moduleId}
              onChange={e => setModuleId(e.target.value)}
              placeholder="ex.: modulo-1"
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Lesson ID</span>
            <input
              className="input input-bordered input-sm"
              value={lessonId}
              onChange={e => setLessonId(e.target.value)}
              placeholder="ex.: aula-1"
            />
          </label>
        </div>
        <label className="label cursor-pointer justify-start gap-2 max-w-xs">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={showOptional}
            onChange={e => setShowOptional(e.target.checked)}
          />
          <span className="label-text text-xs">Mostrar itens opcionais</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Checklist de aula</h2>
          {lessonId && moduleId && trackId ? (
            <LessonChecklist
              userId={user.id}
              lessonId={lessonId}
              moduleId={moduleId}
              trackId={trackId}
              showOptional={showOptional}
            />
          ) : (
            <p className="text-sm text-base-content/60">Preencha os IDs acima.</p>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Checklist de trilha</h2>
          {trackId ? (
            <TrackChecklist userId={user.id} trackId={trackId} />
          ) : (
            <p className="text-sm text-base-content/60">Preencha o Track ID acima.</p>
          )}
        </div>
      </div>
    </div>
  );
}
