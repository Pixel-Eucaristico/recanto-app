'use client';

import { FormationTrack } from '@/domain/formation/types';
import { Role } from '@/shared/types/role';
import { TrackCard } from '../TrackCard';
import { BookOpen } from 'lucide-react';

interface TracksListProps {
  tracks: FormationTrack[];
  progressMap: Map<string, { completed: number; total: number }>;
  userRole: Role;
  loading?: boolean;
}

export function TracksList({ tracks, progressMap, userRole, loading }: TracksListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card bg-base-100 shadow-lg border border-base-300 h-64 animate-pulse">
            <div className="card-body gap-3">
              <div className="h-4 bg-base-300 rounded w-1/3" />
              <div className="h-6 bg-base-300 rounded w-2/3" />
              <div className="h-4 bg-base-300 rounded w-full" />
              <div className="h-4 bg-base-300 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-base-content/40">
        <BookOpen className="w-16 h-16" />
        <p className="text-lg">Nenhuma trilha disponível para seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tracks.map(track => {
        const prog = progressMap.get(track.id) ?? { completed: 0, total: 0 };
        return (
          <TrackCard
            key={track.id}
            track={track}
            completedLessons={prog.completed}
            totalLessons={prog.total}
            userRole={userRole}
          />
        );
      })}
    </div>
  );
}
