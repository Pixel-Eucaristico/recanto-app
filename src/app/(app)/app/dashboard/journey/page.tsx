'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { studentWritingsService } from '@/application/formation/StudentWritingsService';
import { useAccess } from '@/shared/hooks/useAccess';
import { LoadingCard } from '@/shared/components/LoadingCard';
import { EmptyState } from '@/shared/components/EmptyState';
import {
  JourneyHero, ContinueCard, TracksInProgress, BookShelf,
  RecentAnnotations, CreatorView, QuickAccess, ForumActivity, ActivityHistory,
  useJourneyData,
} from '@/features/journey';

export default function JourneyPage() {
  const { user, isAdmin, isFormatorLike, can } = useAccess();
  const journey = useJourneyData(user?.id);
  const [pendingReviews, setPendingReviews] = useState(0);

  const viewerId = user?.id;
  useEffect(() => {
    if (!viewerId || !isFormatorLike) { setPendingReviews(0); return; }
    let cancelled = false;
    studentWritingsService.countPendingReviews(viewerId, isAdmin)
      .then(n => { if (!cancelled) setPendingReviews(n); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [viewerId, isFormatorLike, isAdmin]);

  if (!user) return <div className="p-6">Faça login pra ver sua jornada.</div>;

  // Acompanhar aluno é `review:formation`; `manage:formation` é editar curso.
  const isCreator = isFormatorLike;
  const canHabits = can('log:habits');
  const canNotebook = can('complete:formation');
  const canChallenges = can('manage:challenges') || isAdmin || user.role === 'recantiano';

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6">
      <div className="max-w-3xl lg:max-w-5xl mx-auto space-y-3 sm:space-y-4">
        {journey.error && (
          <div className="alert alert-error text-sm"><span>{journey.error}</span></div>
        )}

        <JourneyHero
          userName={user.name ?? user.id}
          streakDays={journey.streakDays}
          lessonsCompleted={journey.totalLessonsCompleted}
          booksRead={journey.totalBooksRead}
        />

        {journey.loading ? (
          <LoadingCard label="Carregando sua jornada..." />
        ) : (
          <>
            {/* ── Nível 1: retomar. O que o aluno vem fazer aqui. ───────────── */}
            {journey.lastActivity && <ContinueCard lastActivity={journey.lastActivity} />}

            {!journey.lastActivity && (
              <EmptyState
                icon={<Sparkles className="w-10 h-10" />}
                title="Sua jornada está esperando"
                description="Comece uma trilha de formação ou abra um livro pra ver seu progresso aqui."
              />
            )}

            <QuickAccess canHabits={canHabits} canNotebook={canNotebook} canChallenges={canChallenges} />

            {isCreator && <CreatorView pendingReviews={pendingReviews} />}

            {/* ── Nível 2: progresso. Onde estou nos cursos. ────────────────── */}
            <TracksInProgress tracks={journey.tracksInProgress} />

            {/* Duas colunas no desktop: antes era coluna única de 768px com ~670px
                vazios de cada lado em 1440px. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 items-start">
              <div className="space-y-3 sm:space-y-4">
                <BookShelf books={journey.books} />
                <ActivityHistory data={journey} />
              </div>

              {/* ── Nível 3: explorar. Secundário, fora do caminho principal. ── */}
              <div className="space-y-3 sm:space-y-4">
                <ForumActivity userId={user.id} />
                <RecentAnnotations userId={user.id} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
