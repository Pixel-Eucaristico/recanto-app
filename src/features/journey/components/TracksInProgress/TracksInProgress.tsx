'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, ArrowRight } from 'lucide-react';
import type { TrackProgressSummary } from '../../hooks/useJourneyData';

interface TracksInProgressProps {
  tracks: TrackProgressSummary[];
}

export function TracksInProgress({ tracks }: TracksInProgressProps) {
  if (tracks.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
          <GraduationCap className="w-4 h-4 text-primary" /> Cursos em andamento
        </h2>
        <Link href="/app/dashboard/formation" className="link link-hover text-xs">
          Ver todos
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-thin">
        {tracks.map(t => (
          <Link
            key={t.track.id}
            href={`/app/dashboard/formation/${t.track.id}`}
            className="snap-start shrink-0 w-56 sm:w-64 card bg-base-100 border border-base-300 hover:border-primary"
          >
            {t.track.thumbnail_url ? (
              <figure className="aspect-video relative overflow-hidden rounded-t-2xl bg-base-200">
                <Image src={t.track.thumbnail_url} alt={t.track.title} fill className="object-cover" sizes="256px" />
              </figure>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center rounded-t-2xl">
                <GraduationCap className="w-10 h-10 text-primary/60" />
              </div>
            )}
            <div className="card-body p-3 gap-1">
              <h3 className="font-semibold text-sm line-clamp-2">{t.track.title}</h3>
              <div className="flex items-center justify-between text-xs text-base-content/60">
                <span>{t.completedCount} de {t.totalLessons}</span>
                <span className="font-semibold text-primary">{t.percent}%</span>
              </div>
              <progress className="progress progress-primary w-full h-1" value={t.percent} max={100} />
              <div className="flex items-center justify-end text-xs text-primary mt-1">
                Continuar <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
