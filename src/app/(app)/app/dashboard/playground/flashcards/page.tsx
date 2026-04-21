'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';
import {
  FlashcardDeckPlayer,
  FlashcardDeckBuilder,
  useFlashcardDeck,
} from '@/features/flashcards';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

const DEMO_LESSON_ID = 'playground-lesson-flashcards';

export default function FlashcardsPlaygroundPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<'play' | 'build'>('play');
  const { deck, loading, error, submitting, result, submit, restart } = useFlashcardDeck({
    lessonId: DEMO_LESSON_ID,
  });

  if (!user) return <div className="p-6">Faça login para testar.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground: Flashcards</h1>
            <p className="text-base-content/60 text-sm">
              Feature 6. Cards frente/verso com flip 3D. Criar no builder, depois estudar no player.
            </p>
          </div>
        </div>
      </header>

      <div className="tabs tabs-boxed bg-base-100 w-fit">
        <button className={`tab ${tab === 'play' ? 'tab-active' : ''}`} onClick={() => setTab('play')}>Player</button>
        <button className={`tab ${tab === 'build' ? 'tab-active' : ''}`} onClick={() => setTab('build')}>Builder (admin)</button>
      </div>

      {tab === 'build' && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
          <FlashcardDeckBuilder
            lessonId={DEMO_LESSON_ID}
            createdBy={user.id}
            initial={deck}
            onSaved={() => restart()}
          />
        </div>
      )}

      {tab === 'play' && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
          {loading && <div className="alert alert-info"><span>Carregando deck...</span></div>}
          {error && <div className="alert alert-error"><span>{error}</span></div>}
          {!loading && !deck && (
            <div className="text-center py-10 text-base-content/60">
              Nenhum deck. Vá no <strong>Builder</strong>, adicione cards e salve.
            </div>
          )}
          {deck && (
            <FlashcardDeckPlayer
              deck={deck}
              submitting={submitting}
              result={result}
              onSubmit={submit}
              onRestart={restart}
            />
          )}
        </div>
      )}
    </div>
  );
}
