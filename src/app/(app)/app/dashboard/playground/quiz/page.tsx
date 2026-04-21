'use client';

import { useState } from 'react';
import { Award } from 'lucide-react';
import { QuizPlayer, QuizResult, QuizBuilder, useQuiz } from '@/features/quiz';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

const DEMO_LESSON_ID = 'playground-lesson-quiz';

export default function QuizPlaygroundPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<'play' | 'build'>('play');
  const { shuffled, loading, error, submitting, result, submit, restart } = useQuiz({ lessonId: DEMO_LESSON_ID });

  if (!user) return <div className="p-6">Faça login para testar.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground: Quiz</h1>
            <p className="text-base-content/60 text-sm">
              Feature 4. Perguntas e opções randomizadas a cada carregamento. Criar primeiro no builder, depois responder no player.
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
          <QuizBuilder
            lessonId={DEMO_LESSON_ID}
            createdBy={user.id}
            initial={shuffled?.quiz ?? null}
            onSaved={() => restart()}
          />
        </div>
      )}

      {tab === 'play' && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
          {loading && <div className="alert alert-info"><span>Carregando quiz...</span></div>}
          {error && <div className="alert alert-error"><span>{error}</span></div>}
          {!loading && !shuffled && (
            <div className="text-center py-10 text-base-content/60">
              Nenhum quiz salvo. Vá em <strong>Builder (admin)</strong>, cadastre perguntas e salve.
            </div>
          )}

          {shuffled && !result && (
            <QuizPlayer shuffled={shuffled} submitting={submitting} onSubmit={submit} />
          )}

          {shuffled && result && (
            <QuizResult shuffled={shuffled} result={result.scoreDetail} onRestart={restart} />
          )}
        </div>
      )}
    </div>
  );
}
