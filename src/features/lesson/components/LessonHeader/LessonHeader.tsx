'use client';

import Link from 'next/link';
import { ArrowLeft, Lock, Clock } from 'lucide-react';
import { FormationTrack, FormationModule, FormationLesson, LessonProgress, UnlockResult } from '@/domain/formation/types';
import { UnlockCountdown } from '@/features/lesson/video-player';

interface LessonHeaderProps {
  track: FormationTrack;
  module: FormationModule;
  lesson: FormationLesson;
  progress: LessonProgress | null;
  unlock: UnlockResult;
}

export function LessonHeader({ track, module, lesson, progress, unlock }: LessonHeaderProps) {
  const unlockLabel = !unlock.isUnlocked
    ? `Travada (${unlock.blockedBy.join(', ')})`
    : 'Disponível';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-base-content/50 flex-wrap">
        <Link
          href={`/app/dashboard/formation/${track.id}`}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {track.title}
        </Link>
        <span>/</span>
        <span>{module.title}</span>
        <span>/</span>
        <span className="text-base-content">{lesson.title}</span>
      </div>

      <header className="bg-base-100 border border-base-300 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-base-content">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-sm text-base-content/60 mt-1">{lesson.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge gap-1 ${unlock.isUnlocked ? 'badge-success' : 'badge-warning'}`}>
              <Lock className="w-3 h-3" />
              {unlockLabel}
            </span>
          </div>
        </div>

        {unlock.blockedBy.includes('time_lock') && progress?.video_completed_at && lesson.unlock_after_hours > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-base-content/60">
            <Clock className="w-4 h-4" />
            <span>Destrava em:</span>
            <UnlockCountdown
              startedAt={progress.video_completed_at}
              unlockAfterHours={lesson.unlock_after_hours}
            />
          </div>
        )}
      </header>
    </div>
  );
}
