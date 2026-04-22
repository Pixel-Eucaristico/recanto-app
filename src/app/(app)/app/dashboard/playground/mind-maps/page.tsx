'use client';

import { useState } from 'react';
import { Network } from 'lucide-react';
import { MindMapBuilder, MindMapCanvas, useMindMap } from '@/features/lesson/activities/mind-maps';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

const DEMO_LESSON_ID = 'playground-lesson-mindmap';

export default function MindMapsPlaygroundPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<'play' | 'build'>('play');
  const { template, state, setState, loading, error, saving, save, reload } = useMindMap({ lessonId: DEMO_LESSON_ID });

  if (!user) return <div className="p-6">Faça login para testar.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Network className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground: Mapas mentais</h1>
            <p className="text-base-content/60 text-sm">
              Feature 8. Admin cria template com nó raiz; aluno edita o próprio snapshot.
            </p>
          </div>
        </div>
      </header>

      <div className="tabs tabs-boxed bg-base-100 w-fit">
        <button className={`tab ${tab === 'play' ? 'tab-active' : ''}`} onClick={() => setTab('play')}>Aluno</button>
        <button className={`tab ${tab === 'build' ? 'tab-active' : ''}`} onClick={() => setTab('build')}>Template (admin)</button>
      </div>

      {tab === 'build' && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
          <MindMapBuilder
            lessonId={DEMO_LESSON_ID}
            createdBy={user.id}
            initial={template}
            onSaved={() => reload()}
          />
        </div>
      )}

      {tab === 'play' && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
          {loading && <div className="alert alert-info"><span>Carregando...</span></div>}
          {error && <div className="alert alert-error"><span>{error}</span></div>}
          {!loading && !template && (
            <div className="text-center py-10 text-base-content/60">
              Nenhum template. Vá no <strong>Template (admin)</strong>, monte e salve.
            </div>
          )}
          {template && state && (
            <MindMapCanvas
              state={state}
              onChange={setState}
              onSave={() => save(state)}
              saving={saving}
            />
          )}
        </div>
      )}
    </div>
  );
}
