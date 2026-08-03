'use client';

import { useEffect, useState } from 'react';
import { HeartHandshake, Settings } from 'lucide-react';
import { HabitChecklist, HabitConfig } from '@/features/habits';
import { useAccess } from '@/shared/hooks/useAccess';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import type { FormationTrack } from '@/domain/formation/types';

type Scope = 'all' | 'community' | 'course' | 'mine';

export default function HabitsPage() {
  const { user, can } = useAccess();
  const [tab, setTab] = useState<'my' | 'admin'>('my');
  const [scope, setScope] = useState<Scope>('all');
  const [courseId, setCourseId] = useState<string>('');
  const [userTracks, setUserTracks] = useState<FormationTrack[]>([]);

  // Carrega trilhas em que user tem progresso (pra dropdown de curso)
  useEffect(() => {
    if (!user) return;
    progressRepository.findByUser(user.id).then(async progresses => {
      const ids = Array.from(new Set(progresses.map(p => p.track_id)));
      const tracks = await Promise.all(ids.map(id => trackRepository.findById(id)));
      setUserTracks(tracks.filter((t): t is FormationTrack => t !== null));
    }).catch(() => {});
  }, [user?.id]);

  if (!user) return <div className="p-6">Faça login.</div>;

  const isAdmin = can('manage:habits');

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6 space-y-3 sm:space-y-4">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <HeartHandshake className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-base-content">Hábitos diários</h1>
            <p className="text-base-content/60 text-xs sm:text-sm">
              Regra dos 3 dias — registre seus hábitos espirituais. Hábitos que bloqueiam formação destravam ao serem registrados.
            </p>
          </div>
        </div>
      </header>

      {isAdmin && (
        <div className="tabs tabs-boxed bg-base-100 w-fit">
          <button className={`tab tab-sm ${tab === 'my' ? 'tab-active' : ''}`} onClick={() => setTab('my')}>Meus hábitos</button>
          <button className={`tab tab-sm ${tab === 'admin' ? 'tab-active' : ''}`} onClick={() => setTab('admin')}>
            <Settings className="w-3.5 h-3.5 mr-1" /> Gerenciar
          </button>
        </div>
      )}

      {tab === 'my' && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-3 sm:p-4 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <div role="tablist" className="tabs tabs-bordered">
              <button
                role="tab"
                className={`tab tab-sm ${scope === 'all' ? 'tab-active' : ''}`}
                onClick={() => setScope('all')}
              >Tudo</button>
              <button
                role="tab"
                className={`tab tab-sm ${scope === 'community' ? 'tab-active' : ''}`}
                onClick={() => setScope('community')}
              >Comunidade</button>
              <button
                role="tab"
                className={`tab tab-sm ${scope === 'course' ? 'tab-active' : ''}`}
                onClick={() => setScope('course')}
              >Curso</button>
              <button
                role="tab"
                className={`tab tab-sm ${scope === 'mine' ? 'tab-active' : ''}`}
                onClick={() => setScope('mine')}
              >Meus</button>
            </div>

            {scope === 'course' && (
              <select
                className="select select-bordered select-sm"
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
              >
                <option value="">— escolha um curso —</option>
                {userTracks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            )}
          </div>

          {scope === 'course' && !courseId ? (
            <div className="alert alert-info text-sm"><span>Escolha um curso pra ver os hábitos vinculados.</span></div>
          ) : (
            <HabitChecklist userId={user.id} role={user.role} scope={scope} courseId={courseId || undefined} />
          )}
        </div>
      )}

      {tab === 'admin' && isAdmin && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-3 sm:p-4">
          <HabitConfig userId={user.id} />
        </div>
      )}
    </div>
  );
}
