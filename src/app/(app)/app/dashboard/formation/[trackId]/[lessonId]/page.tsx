'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, PlayCircle } from 'lucide-react';
import { LessonHeader, LessonVideoSection, LessonTabs, LessonSidebar, useLessonPage } from '@/features/lesson';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { UnlockRuleEngine } from '@/domain/formation/entities/UnlockRuleEngine';

interface Props {
  params: Promise<{ trackId: string; lessonId: string }>;
}

export default function LessonPage({ params }: Props) {
  const { trackId, lessonId } = use(params);
  const user = useCurrentUser();
  const { data, loading, error, refreshProgress } = useLessonPage(trackId, lessonId, user?.id ?? null);

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

  // Aula travada — exibe screen com motivo + voltar
  if (!unlockResult.isUnlocked) {
    return (
      <div className="min-h-screen bg-base-200 p-4 md:p-6 space-y-4">
        <Link
          href={`/app/dashboard/formation/${track.id}`}
          className="btn btn-ghost btn-sm gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar pra trilha
        </Link>

        <div className="card bg-base-100 border border-base-300 max-w-xl mx-auto">
          <div className="card-body items-center text-center gap-3 p-8">
            <div className="p-4 rounded-full bg-warning/20">
              <Lock className="w-10 h-10 text-warning" />
            </div>
            <h1 className="text-xl font-bold text-base-content">{lesson.title}</h1>
            <p className="text-sm text-base-content/70">Esta aula ainda não está disponível.</p>
            <ul className="text-sm space-y-1">
              {unlockResult.blockedBy.map(b => (
                <li key={b} className="text-warning">• {UnlockRuleEngine.blockerLabel(b)}</li>
              ))}
            </ul>
            {prev && (
              <Link
                href={`/app/dashboard/formation/${track.id}/${prev.lesson.id}`}
                className="btn btn-primary btn-sm mt-4"
              >
                Voltar à aula anterior
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

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

          {lesson.video_url && !progress?.video_completed_at ? (
            <div className="card bg-base-100 border-2 border-dashed border-warning/50">
              <div className="card-body items-center text-center gap-2 py-6">
                <div className="p-3 rounded-full bg-warning/20">
                  <PlayCircle className="w-8 h-8 text-warning" />
                </div>
                <h3 className="font-bold text-base-content">Conteúdo bloqueado</h3>
                <p className="text-sm text-base-content/70 max-w-md">
                  Termine de assistir o vídeo acima para liberar a apostila, atividades, caderno e demais recursos desta aula.
                </p>
              </div>
            </div>
          ) : (
            <LessonTabs
              lesson={lesson}
              track={{ id: track.id, title: track.title }}
              module={{ id: module.id, title: module.title }}
              userId={user.id}
              userName={user.name || 'anônimo'}
              onProgress={refreshProgress}
            />
          )}
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
