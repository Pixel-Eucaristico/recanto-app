'use client';

import { useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import { CrosswordGrid, CrosswordBuilder, useCrossword } from '@/features/lesson/activities/crossword';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

const DEMO_LESSON_ID = 'playground-lesson-crossword';

export default function CrosswordPlaygroundPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<'play' | 'build'>('play');
  const { puzzle, loading, error, submit, submitting, result, reload } = useCrossword({ lessonId: DEMO_LESSON_ID });

  if (!user) return <div className="p-6">Faça login para testar.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Grid3x3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground: Palavras cruzadas</h1>
            <p className="text-base-content/60 text-sm">
              Feature nova. Admin digita pergunta + resposta; grid é auto-montado cruzando letras quando possível.
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
          <CrosswordBuilder
            lessonId={DEMO_LESSON_ID}
            createdBy={user.id}
            initial={puzzle}
            onSaved={() => reload()}
          />
        </div>
      )}

      {tab === 'play' && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
          {loading && <div className="alert alert-info"><span>Carregando...</span></div>}
          {error && <div className="alert alert-error"><span>{error}</span></div>}
          {!loading && !puzzle && (
            <div className="text-center py-10 text-base-content/60">
              Nenhuma palavra cruzada. Vá no <strong>Builder</strong>, adicione pergunta+resposta e salve.
            </div>
          )}
          {puzzle && (
            <CrosswordGrid
              puzzle={puzzle}
              onSubmit={submit}
              submitting={submitting}
              result={result}
              onRestart={reload}
            />
          )}
        </div>
      )}
    </div>
  );
}
