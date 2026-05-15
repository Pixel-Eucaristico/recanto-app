'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonWithProgress } from '@/domain/formation/types';
import { LessonChecklist } from '@/features/progress-checklist';
import { HabitChecklist } from '@/features/habits';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface LessonSidebarProps {
  userId: string;
  trackId: string;
  lessonId: string;
  moduleId: string;
  prev?: LessonWithProgress;
  next?: LessonWithProgress;
}

export function LessonSidebar({ userId, trackId, lessonId, moduleId, prev, next }: LessonSidebarProps) {
  const user = useCurrentUser();
  return (
    <aside className="space-y-3">
      <LessonChecklist
        userId={userId}
        lessonId={lessonId}
        moduleId={moduleId}
        trackId={trackId}
      />

      {/* Hábitos do curso vinculados — toggle direto sem ir pra /habits */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-3 gap-2">
          <h4 className="font-semibold text-xs uppercase tracking-wide text-base-content/60">Hábitos do curso</h4>
          <HabitChecklist
            userId={userId}
            role={user?.role ?? null}
            scope="course"
            courseId={trackId}
          />
        </div>
      </div>

      <div className="flex gap-2">
        {prev ? (
          <Link
            href={`/app/dashboard/formation/${trackId}/${prev.lesson.id}`}
            className="btn btn-ghost btn-sm flex-1 gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next && (
          <Link
            href={`/app/dashboard/formation/${trackId}/${next.lesson.id}`}
            className={`btn btn-sm flex-1 gap-1 ${next.unlockResult.isUnlocked ? 'btn-primary' : 'btn-ghost btn-disabled'}`}
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  );
}
