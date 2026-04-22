'use client';

import { useState } from 'react';
import { GitBranch } from 'lucide-react';
import {
  CaseStudyPlayer,
  CaseStudySummary,
  CaseStudyBuilder,
  useCaseStudy,
} from '@/features/case-studies';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

const DEMO_LESSON_ID = 'playground-lesson-case-studies';

export default function CaseStudiesPlaygroundPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<'play' | 'build'>('play');
  const {
    caseStudy,
    currentNode,
    path,
    isEnd,
    loading,
    error,
    submitting,
    result,
    choose,
    finish,
    restart,
  } = useCaseStudy({ lessonId: DEMO_LESSON_ID });

  if (!user) return <div className="p-6">Faça login para testar.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <GitBranch className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground: Estudos de caso</h1>
            <p className="text-base-content/60 text-sm">
              Feature 7. Decision tree narrativo. Criar nós + escolhas no Builder, percorrer no Player.
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
          <CaseStudyBuilder
            lessonId={DEMO_LESSON_ID}
            createdBy={user.id}
            initial={caseStudy}
            onSaved={() => restart()}
          />
        </div>
      )}

      {tab === 'play' && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
          {loading && <div className="alert alert-info"><span>Carregando caso...</span></div>}
          {error && <div className="alert alert-error"><span>{error}</span></div>}
          {!loading && !caseStudy && (
            <div className="text-center py-10 text-base-content/60">
              Nenhum caso. Vá no <strong>Builder</strong>, monte a árvore de decisão e salve.
            </div>
          )}

          {caseStudy && currentNode && !result && (
            <CaseStudyPlayer
              caseStudy={caseStudy}
              currentNode={currentNode}
              isEnd={isEnd}
              submitting={submitting}
              onChoose={choose}
              onFinish={finish}
            />
          )}

          {caseStudy && result && (
            <CaseStudySummary
              caseStudy={caseStudy}
              path={path}
              persisted={result.persisted}
              onRestart={restart}
            />
          )}
        </div>
      )}
    </div>
  );
}
