'use client';

import Link from 'next/link';
import { Lock, PlayCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { LessonWithProgress } from '@/domain/formation/types';
import { Lesson } from '@/domain/formation/entities/Lesson';
import { UnlockRuleEngine } from '@/domain/formation/entities/UnlockRuleEngine';

interface LessonCardProps {
  lessonWithProgress: LessonWithProgress;
  trackId: string;
  index: number;
}

const STATUS_ICONS = {
  completed: <CheckCircle2 className="w-5 h-5 text-success" />,
  in_progress: <PlayCircle className="w-5 h-5 text-primary" />,
  unlocked: <PlayCircle className="w-5 h-5 text-primary" />,
  locked: <Lock className="w-5 h-5 text-base-content/30" />,
};

export function LessonCard({ lessonWithProgress, trackId, index }: LessonCardProps) {
  const { lesson, progress, unlockResult } = lessonWithProgress;
  const status = progress?.status ?? 'locked';
  const isLocked = !unlockResult.isUnlocked && status !== 'completed';
  const href = `/app/dashboard/formation/${trackId}/${lesson.id}`;

  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
      status === 'completed'
        ? 'border-success/30 bg-success/5'
        : isLocked
          ? 'border-base-300 bg-base-200/40 opacity-70'
          : 'border-primary/30 bg-base-100 hover:bg-primary/5'
    }`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-sm font-medium text-base-content/60">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {STATUS_ICONS[status]}
          <span className={`font-medium text-sm truncate ${isLocked ? 'text-base-content/40' : 'text-base-content'}`}>
            {lesson.title}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-base-content/40 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Lesson.durationLabel(lesson.video_duration_seconds)}
          </span>
          {isLocked && unlockResult.blockedBy[0] && (
            <span className="text-xs text-warning">
              {UnlockRuleEngine.blockerLabel(unlockResult.blockedBy[0])}
            </span>
          )}
          {status === 'in_progress' && progress && (
            <span className="text-xs text-primary">
              {progress.video_watch_percent}% assistido
            </span>
          )}
        </div>
      </div>

      {!isLocked && (
        <Link href={href} className="btn btn-ghost btn-xs btn-circle">
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
