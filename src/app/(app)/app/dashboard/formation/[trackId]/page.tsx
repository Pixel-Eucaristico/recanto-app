'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useFormationTrack } from '@/features/formation/hooks/useFormationTrack';
import { ModuleAccordion } from '@/features/formation/components/ModuleAccordion';
import { Track } from '@/domain/formation/entities/Track';

interface Props {
  params: Promise<{ trackId: string }>;
}

export default function TrackPage({ params }: Props) {
  const { trackId } = use(params);
  const { data, loading, error } = useFormationTrack(trackId);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-base-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>{error ?? 'Trilha não encontrada.'}</span>
        </div>
      </div>
    );
  }

  const { track, modules, completedLessons, totalLessons } = data;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-base-content/50">
        <Link href="/app/dashboard/formation" className="flex items-center gap-1 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Trilhas
        </Link>
        <span>/</span>
        <span className="text-base-content">{track.title}</span>
      </div>

      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <GraduationCap className="w-7 h-7 text-primary flex-shrink-0" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-base-content">{track.title}</h1>
              <span className="badge badge-outline">{Track.typeLabel(track.type)}</span>
            </div>
            <p className="text-base-content/60 text-sm mt-1">{track.description}</p>
          </div>
        </div>

        {totalLessons > 0 && (
          <div className="space-y-1 max-w-md">
            <div className="flex justify-between text-xs text-base-content/60">
              <span>{completedLessons} de {totalLessons} aulas concluídas</span>
              <span>{progressPercent}%</span>
            </div>
            <progress className="progress progress-primary w-full" value={progressPercent} max={100} />
          </div>
        )}
      </header>

      <div className="space-y-3">
        {modules.map((mp, idx) => (
          <ModuleAccordion
            key={mp.module.id}
            moduleWithProgress={mp}
            trackId={trackId}
            defaultOpen={idx === 0}
          />
        ))}

        {modules.length === 0 && (
          <div className="text-center py-16 text-base-content/40">
            <p>Nenhum módulo disponível nesta trilha.</p>
          </div>
        )}
      </div>
    </div>
  );
}
