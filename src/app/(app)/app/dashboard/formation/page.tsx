'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { GraduationCap, Settings } from 'lucide-react';
import { useFormationTracks } from '@/features/formation/hooks/useFormationTracks';
import { TracksList } from '@/features/formation/components/TracksList';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

export default function FormationPage() {
  const user = useCurrentUser();
  const { tracks, loading, error } = useFormationTracks();

  const progressMap = useMemo(() => new Map<string, { completed: number; total: number }>(), []);

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Erro ao carregar trilhas: {error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-8">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-base-content">Trilhas de Formação</h1>
              <p className="text-base-content/60 text-sm">
                Jornada de formação integral — metanoia através do conhecimento e da prática
              </p>
            </div>
          </div>
          {user && (user.role === 'admin' || user.features.includes('manage:formation') || user.features.includes('*')) && (
            <Link href="/app/dashboard/admin/formation" className="btn btn-primary btn-sm gap-1">
              <Settings className="w-4 h-4" /> Gerenciar
            </Link>
          )}
        </div>
      </header>

      <TracksList
        tracks={tracks}
        progressMap={progressMap}
        userRole={user?.role ?? null}
        loading={loading}
      />
    </div>
  );
}
