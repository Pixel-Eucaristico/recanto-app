'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Plus, X, Tag } from 'lucide-react';
import {
  TrackList, TrackForm, ModuleList, ModuleForm, LessonList, LessonForm,
  TrackTypeManager,
  useTracksAdmin, useModulesAdmin, useLessonsAdmin,
} from '@/features/formation-admin';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import type { FormationTrack, FormationModule, FormationLesson } from '@/domain/formation/types';

type View = 'tracks' | 'track-form' | 'modules' | 'lessons' | 'lesson-form' | 'track-types';

export default function AdminFormationPage() {
  const user = useCurrentUser();
  const tracksAdmin = useTracksAdmin();
  const [view, setView] = useState<View>('tracks');
  const [activeTrack, setActiveTrack] = useState<FormationTrack | null>(null);
  const [activeModule, setActiveModule] = useState<FormationModule | null>(null);
  const [activeLesson, setActiveLesson] = useState<FormationLesson | null>(null);
  const [editingTrack, setEditingTrack] = useState<FormationTrack | null>(null);
  const [editingModule, setEditingModule] = useState<FormationModule | null>(null);
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [deleteTrackTarget, setDeleteTrackTarget] = useState<FormationTrack | null>(null);
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<FormationModule | null>(null);
  const [deleteLessonTarget, setDeleteLessonTarget] = useState<FormationLesson | null>(null);

  const modulesAdmin = useModulesAdmin(activeTrack?.id ?? null);
  const lessonsAdmin = useLessonsAdmin(activeModule?.id ?? null);

  if (!user) return <div className="p-6">Faça login.</div>;

  const canManage = user.role === 'admin' || user.features.includes('manage:formation') || user.features.includes('*');
  if (!canManage) {
    return (
      <div className="p-6">
        <div className="alert alert-error"><span>Sem permissão pra gerenciar formação.</span></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-3 md:p-6 space-y-3 md:space-y-4">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-3 md:p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/app/dashboard" className="btn btn-ghost btn-sm gap-1">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <h1 className="text-base md:text-lg font-bold">Gerenciar formação</h1>
          </div>
          {view === 'tracks' && (
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-1"
                onClick={() => setView('track-types')}
              >
                <Tag className="w-4 h-4" /> Tipos
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm gap-1"
                onClick={() => { setEditingTrack(null); setView('track-form'); }}
              >
                <Plus className="w-4 h-4" /> Nova trilha
              </button>
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        {(view === 'modules' || view === 'lessons' || view === 'lesson-form') && activeTrack && (
          <div className="text-xs text-base-content/60 mt-2 flex items-center gap-1 flex-wrap">
            <button type="button" className="link link-hover" onClick={() => { setView('tracks'); setActiveTrack(null); setActiveModule(null); }}>
              Trilhas
            </button>
            <span>›</span>
            <button type="button" className="link link-hover" onClick={() => { setView('modules'); setActiveModule(null); }}>
              {activeTrack.title}
            </button>
            {(view === 'lessons' || view === 'lesson-form') && activeModule && (
              <>
                <span>›</span>
                {view === 'lesson-form' ? (
                  <button type="button" className="link link-hover" onClick={() => setView('lessons')}>
                    {activeModule.title}
                  </button>
                ) : (
                  <span>{activeModule.title}</span>
                )}
              </>
            )}
            {view === 'lesson-form' && (
              <>
                <span>›</span>
                <span>{activeLesson ? activeLesson.title : 'Nova aula'}</span>
              </>
            )}
          </div>
        )}
      </header>

      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-3 md:p-5">
        {tracksAdmin.error && <div className="alert alert-error text-sm mb-2"><span>{tracksAdmin.error}</span></div>}
        {modulesAdmin.error && <div className="alert alert-error text-sm mb-2"><span>{modulesAdmin.error}</span></div>}
        {lessonsAdmin.error && <div className="alert alert-error text-sm mb-2"><span>{lessonsAdmin.error}</span></div>}

        {view === 'tracks' && (
          tracksAdmin.loading
            ? <div className="alert alert-info text-sm"><span>Carregando trilhas...</span></div>
            : <TrackList
                tracks={tracksAdmin.tracks}
                onEdit={t => { setEditingTrack(t); setView('track-form'); }}
                onOpenModules={t => { setActiveTrack(t); setView('modules'); }}
                onDelete={t => setDeleteTrackTarget(t)}
              />
        )}

        {view === 'track-types' && (
          <div className="space-y-3">
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => setView('tracks')}
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para trilhas
            </button>
            <TrackTypeManager />
          </div>
        )}

        {view === 'track-form' && (
          <TrackForm
            track={editingTrack}
            allTracks={tracksAdmin.tracks}
            saving={tracksAdmin.saving}
            onSave={async input => {
              await tracksAdmin.save(input);
              setView('tracks');
              setEditingTrack(null);
            }}
            onCancel={() => { setView('tracks'); setEditingTrack(null); }}
          />
        )}

        {view === 'modules' && activeTrack && (
          <div className="space-y-3">
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => { setView('tracks'); setActiveTrack(null); }}
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para trilhas
            </button>
            <ModuleList
              modules={modulesAdmin.modules}
              onCreate={() => { setEditingModule(null); setModuleFormOpen(true); }}
              onEdit={m => { setEditingModule(m); setModuleFormOpen(true); }}
              onOpenLessons={m => { setActiveModule(m); setView('lessons'); }}
              onDelete={m => setDeleteModuleTarget(m)}
            />
          </div>
        )}

        {view === 'lessons' && activeModule && (
          <div className="space-y-3">
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => { setView('modules'); setActiveModule(null); }}
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para módulos
            </button>
            <LessonList
              lessons={lessonsAdmin.lessons}
              onCreate={() => { setActiveLesson(null); setView('lesson-form'); }}
              onEdit={l => { setActiveLesson(l); setView('lesson-form'); }}
              onDelete={l => setDeleteLessonTarget(l)}
            />
          </div>
        )}

        {view === 'lesson-form' && activeModule && (
          <LessonForm
            lesson={activeLesson}
            moduleId={activeModule.id}
            defaultOrder={lessonsAdmin.lessons.length + 1}
            saving={lessonsAdmin.saving}
            onSave={async input => {
              await lessonsAdmin.save(input);
              setView('lessons');
              setActiveLesson(null);
            }}
            onCancel={() => { setView('lessons'); setActiveLesson(null); }}
          />
        )}
      </div>

      {/* Module form modal */}
      {moduleFormOpen && activeTrack && (
        <ModuleForm
          module={editingModule}
          trackId={activeTrack.id}
          defaultOrder={modulesAdmin.modules.length + 1}
          saving={modulesAdmin.saving}
          onSave={async input => { await modulesAdmin.save(input); }}
          onClose={() => { setModuleFormOpen(false); setEditingModule(null); }}
        />
      )}

      {/* Confirm delete modals */}
      {deleteTrackTarget && (
        <ConfirmDeleteModal
          title="Remover trilha"
          message={`Remover "${deleteTrackTarget.title}"? Todos os módulos e aulas serão deletados em cascata.`}
          onCancel={() => setDeleteTrackTarget(null)}
          onConfirm={async () => {
            await tracksAdmin.remove(deleteTrackTarget.id);
            setDeleteTrackTarget(null);
          }}
          saving={tracksAdmin.saving}
        />
      )}
      {deleteModuleTarget && (
        <ConfirmDeleteModal
          title="Remover módulo"
          message={`Remover "${deleteModuleTarget.title}"? Todas as aulas serão deletadas em cascata.`}
          onCancel={() => setDeleteModuleTarget(null)}
          onConfirm={async () => {
            await modulesAdmin.remove(deleteModuleTarget.id);
            setDeleteModuleTarget(null);
          }}
          saving={modulesAdmin.saving}
        />
      )}
      {deleteLessonTarget && (
        <ConfirmDeleteModal
          title="Remover aula"
          message={`Remover "${deleteLessonTarget.title}"? Progresso dos alunos será mantido mas órfão.`}
          onCancel={() => setDeleteLessonTarget(null)}
          onConfirm={async () => {
            await lessonsAdmin.remove(deleteLessonTarget.id);
            setDeleteLessonTarget(null);
          }}
          saving={lessonsAdmin.saving}
        />
      )}
    </div>
  );
}

function ConfirmDeleteModal({ title, message, onCancel, onConfirm, saving }: {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  saving: boolean;
}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base">{title}</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onCancel}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-base-content/70">{message}</p>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={saving}>Cancelar</button>
          <button type="button" className="btn btn-error btn-sm" onClick={onConfirm} disabled={saving}>
            {saving ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel} />
    </div>
  );
}
