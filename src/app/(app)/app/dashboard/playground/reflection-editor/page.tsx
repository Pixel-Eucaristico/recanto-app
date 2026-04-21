'use client';

import { FileEdit } from 'lucide-react';
import { ReflectionEditor, useReflection } from '@/features/spiritual-notebook';

const DEMO_LESSON = {
  lessonId: 'playground-lesson-reflection',
  lessonTitle: 'Playground — Aula de teste',
  moduleTitle: 'Módulo playground',
  trackId: 'playground-track',
  trackTitle: 'Trilha playground',
};

export default function ReflectionEditorPlaygroundPage() {
  const { reflection, loading, error, saving, saveDraft, submit } = useReflection(DEMO_LESSON);

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <FileEdit className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground: Editor de Reflexão</h1>
            <p className="text-base-content/60 text-sm">
              Validação Feature 2. Mínimo 100 chars para enviar. Salvar rascunho com qualquer texto.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="alert alert-info"><span>Carregando...</span></div>
      ) : (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
          <ReflectionEditor
            reflection={reflection}
            saving={saving}
            error={error}
            onSaveDraft={saveDraft}
            onSubmit={submit}
          />
        </div>
      )}

      <div className="bg-base-100 border border-base-300 rounded-2xl p-4 text-xs space-y-1 text-base-content/70">
        <div className="font-semibold text-base-content">Debug</div>
        <div>Status: {reflection?.status ?? '—'}</div>
        <div>ID: {reflection?.id ?? '—'}</div>
        <div>Chars salvos: {reflection?.content.length ?? 0}</div>
      </div>
    </div>
  );
}
