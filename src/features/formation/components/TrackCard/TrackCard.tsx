'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Lock, ChevronRight } from 'lucide-react';
import { FormationTrack } from '@/domain/formation/types';
import { Track, TRACK_TYPE_LABELS } from '@/domain/formation/entities/Track';
import { Role } from '@/shared/types/role';
import { AgeRatingBadge } from '@/shared/components/AgeRatingBadge';

interface TrackCardProps {
  track: FormationTrack;
  completedLessons: number;
  totalLessons: number;
  userRole: Role;
}

export function TrackCard({ track, completedLessons, totalLessons, userRole }: TrackCardProps) {
  const accessible = Track.isAccessibleByRole(track, userRole);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const gallery = track.gallery_images ?? [];
  const hasGallery = gallery.length >= 2;

  return (
    <div className={`card bg-base-100 shadow-lg border border-base-300 transition-all hover:shadow-xl ${!accessible ? 'opacity-60' : ''}`}>
      {hasGallery ? (
        <div className="relative">
          <figure className="hover-gallery h-40 w-full overflow-hidden rounded-t-2xl">
            {gallery.slice(0, 10).map((src, i) => (
              <img key={`${src}-${i}`} src={src} alt={`${track.title} ${i + 1}`} className="object-cover w-full h-full" />
            ))}
          </figure>
          {!accessible && (
            <div className="absolute inset-0 bg-base-300/70 flex items-center justify-center rounded-t-2xl pointer-events-none">
              <Lock className="text-base-content/60 w-8 h-8" />
            </div>
          )}
        </div>
      ) : track.thumbnail_url ? (
        <figure className="relative h-40 overflow-hidden rounded-t-2xl">
          <Image src={track.thumbnail_url} alt={track.title} fill className="object-cover" />
          {!accessible && (
            <div className="absolute inset-0 bg-base-300/70 flex items-center justify-center">
              <Lock className="text-base-content/60 w-8 h-8" />
            </div>
          )}
        </figure>
      ) : null}

      <div className="card-body gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-outline badge-sm">
            {TRACK_TYPE_LABELS[track.type]}
          </span>
          <AgeRatingBadge rating={track.age_rating ?? 'L'} size="sm" />
          {!accessible && <span className="badge badge-error badge-sm">Bloqueado</span>}
        </div>

        <h2 className="card-title text-base-content text-lg">{track.title}</h2>
        <p className="text-base-content/60 text-sm line-clamp-2">{track.description}</p>

        {totalLessons > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs text-base-content/60">
              <span>{completedLessons} de {totalLessons} aulas</span>
              <span>{progressPercent}%</span>
            </div>
            <progress className="progress progress-primary w-full" value={progressPercent} max={100} />
          </div>
        )}

        <div className="card-actions justify-end mt-2">
          {accessible ? (
            <Link href={`/app/dashboard/formation/${track.id}`} className="btn btn-primary btn-sm gap-1">
              {progressPercent > 0 ? 'Continuar' : 'Iniciar'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="btn btn-disabled btn-sm">Nível necessário</span>
          )}
        </div>
      </div>
    </div>
  );
}
