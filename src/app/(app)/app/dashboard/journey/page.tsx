'use client';

import { Sparkles } from 'lucide-react';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import {
  JourneyHero, ContinueCard, TracksInProgress, BookShelf,
  RecentAnnotations, CreatorView, useJourneyData,
} from '@/features/journey';

export default function JourneyPage() {
  const user = useCurrentUser();
  const journey = useJourneyData(user?.id);

  if (!user) return <div className="p-6">Faça login pra ver sua jornada.</div>;

  const isCreator = user.role === 'admin'
    || user.features.includes('manage:formation')
    || user.features.includes('*');

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
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
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 items-center text-center gap-2">
              <span className="loading loading-spinner loading-md text-primary" />
              <p className="text-sm text-base-content/60">Carregando sua jornada...</p>
            </div>
          </div>
        ) : (
          <>
            {journey.lastActivity && <ContinueCard lastActivity={journey.lastActivity} />}

            {!journey.lastActivity && (
              <div className="card bg-base-100 border border-dashed border-base-300">
                <div className="card-body p-6 items-center text-center gap-2">
                  <Sparkles className="w-10 h-10 text-primary/40" />
                  <p className="text-sm font-medium">Sua jornada está esperando</p>
                  <p className="text-xs text-base-content/60 max-w-xs">
                    Comece uma trilha de formação ou abra um livro pra ver seu progresso aqui.
                  </p>
                </div>
              </div>
            )}

            <TracksInProgress tracks={journey.tracksInProgress} />

            <BookShelf books={journey.books} />

            <RecentAnnotations userId={user.id} />

            {isCreator && <CreatorView />}
          </>
        )}
      </div>
    </div>
  );
}
