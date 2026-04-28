'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { ModuleWithProgress } from '@/domain/formation/types';
import { LessonCard } from '../LessonCard';

interface ModuleAccordionProps {
  moduleWithProgress: ModuleWithProgress;
  trackId: string;
  defaultOpen?: boolean;
}

export function ModuleAccordion({ moduleWithProgress, trackId, defaultOpen = false }: ModuleAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { module, lessons, completedCount } = moduleWithProgress;
  const total = lessons.length;
  const allDone = completedCount === total && total > 0;

  return (
    <div className="border border-base-300 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 bg-base-200/60 hover:bg-base-200 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {allDone && <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />}
          <div>
            <h3 className="font-semibold text-base-content">{module.title}</h3>
            {module.description && (
              <p className="text-sm text-base-content/60 line-clamp-1">{module.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm text-base-content/60">{completedCount}/{total}</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-2 bg-base-100">
          {lessons.map((lp, idx) => (
            <LessonCard
              key={lp.lesson.id}
              lessonWithProgress={lp}
              trackId={trackId}
              index={idx}
            />
          ))}
          {lessons.length === 0 && (
            <p className="text-sm text-base-content/40 text-center py-4">Nenhuma aula neste módulo.</p>
          )}
        </div>
      )}
    </div>
  );
}
