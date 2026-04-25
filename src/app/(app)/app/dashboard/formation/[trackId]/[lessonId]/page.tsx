'use client';

import { use } from 'react';
import { LessonHeader, LessonVideoSection, LessonTabs, LessonSidebar, useLessonPage } from '@/features/lesson';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface Props {
  params: Promise<{ trackId: string; lessonId: string }>;
}

export default function LessonPage({ params }: Props) {
  const { trackId, lessonId } = use(params);
  const user = useCurrentUser();
  const { data, loading, error, reload } = useLessonPage(trackId, lessonId, user?.id ?? null);

  if (!user) return <div className="p-6">Faça login pra acessar a aula.</div>;

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 p-6 space-y-4">
        <div className="h-16 bg-base-300 rounded-2xl animate-pulse" />
        <div className="h-96 bg-base-300 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="alert alert-error"><span>{error ?? 'Aula não encontrada.'}</span></div>
      </div>
    );
  }

  const { track, module, lesson, progress, unlockResult, prev, next } = data;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 space-y-4 md:space-y-6">
      <LessonHeader
        track={track}
        module={module}
        lesson={lesson}
        progress={progress}
        unlock={unlockResult}
      />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 min-w-0">
          <LessonVideoSection
            lesson={lesson}
            moduleId={module.id}
            trackId={track.id}
            userId={user.id}
          />

          <LessonTabs
            lesson={lesson}
            track={{ id: track.id, title: track.title }}
            module={{ id: module.id, title: module.title }}
            userId={user.id}
            userName={user.name || 'anônimo'}
            onProgress={reload}
          />
        </div>

        <LessonSidebar
          userId={user.id}
          trackId={track.id}
          moduleId={module.id}
          lessonId={lesson.id}
          prev={prev}
          next={next}
        />
      </div>
    </div>
  );
}
