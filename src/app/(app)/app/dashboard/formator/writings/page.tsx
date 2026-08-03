'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, Clock, Download, FileEdit, PenLine, Users,
} from 'lucide-react';
import { BackButton } from '@/shared/components/BackButton';
import { StatCard } from '@/shared/components/StatCard';
import { useAccess } from '@/shared/hooks/useAccess';
import { toCsv, downloadCsv } from '@/shared/utils/csv';
import { WRITING_KIND_LABELS, type StudentWriting } from '@/domain/formation/writings';
import {
  WritingCard, WritingsFilters, WritingHistoryModal, WritingReviewModal,
  useScopeWritings, useWritingsFilters,
} from '@/features/formator-writings';

export default function FormatorWritingsPage() {
  const { user, isAdmin, isFormatorLike, loading: accessLoading } = useAccess();
  const { tracks, writings, counts, truncated, warnings, loading, error, patch } =
    useScopeWritings(isFormatorLike ? user?.id : undefined, isAdmin);
  const filters = useWritingsFilters(writings);

  const [historyOf, setHistoryOf] = useState<StudentWriting | null>(null);
  const [reviewOf, setReviewOf] = useState<StudentWriting | null>(null);

  function exportCsv() {
    const rows = filters.filtered.map(w => ({
      aluno: w.student_name,
      tipo: WRITING_KIND_LABELS[w.kind],
      trilha: w.track_title,
      aula: w.lesson_title,
      status: statusLabel(w.status),
      edicoes: w.version_count,
      data: new Date(w.updated_at ?? w.created_at).toLocaleString('pt-BR'),
      texto: w.content,
    }));
    const csv = toCsv(rows, ['aluno', 'tipo', 'trilha', 'aula', 'status', 'edicoes', 'data', 'texto']);
    downloadCsv(`escritos_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-base-200 p-6 flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  if (!user) return <div className="p-6">Faça login.</div>;

  if (!isFormatorLike) {
    return (
      <div className="p-6">
        <div className="alert alert-warning">
          <span>Acesso restrito a formadores.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref="/app/dashboard/journey" />
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-1">
            <PenLine className="w-5 h-5 text-primary" /> Escritos dos alunos
          </h1>
          {filters.filtered.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1 ml-auto"
              onClick={exportCsv}
              title="Exportar lista filtrada em CSV"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <Link href="/app/dashboard/formator/students" className="link link-hover flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Ver por aluno
          </Link>
        </div>

        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        {warnings.map(w => (
          <div key={w} className="alert alert-warning text-sm"><span>{w}</span></div>
        ))}

        {truncated && (
          <div className="alert alert-info text-sm">
            <span>Muitos registros — mostrando apenas os mais recentes. Use os filtros pra afinar.</span>
          </div>
        )}

        {!loading && tracks.length === 0 && (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body p-6 text-center gap-1">
              <p className="text-sm font-medium">
                {isAdmin
                  ? 'Sem trilhas cadastradas.'
                  : 'Você não está atribuído como formador em nenhuma trilha.'}
              </p>
              <p className="text-xs text-base-content/60">
                {isAdmin
                  ? 'Crie trilhas em Admin → Formação.'
                  : 'Peça a um admin pra te atribuir como formador na edição da trilha.'}
              </p>
            </div>
          </div>
        )}

        {tracks.length > 0 && counts && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatCard
                label="Total de escritos"
                value={counts.total}
                icon={<PenLine className="w-4 h-4" />}
                color="text-primary"
              />
              <StatCard
                label="Aguardando revisão"
                value={counts.pendingReview}
                icon={<Clock className="w-4 h-4" />}
                color="text-warning"
                onClick={() => filters.setStatusFilter(
                  filters.statusFilter === 'submitted' ? 'all' : 'submitted',
                )}
                active={filters.statusFilter === 'submitted'}
              />
              <StatCard
                label="Revisados"
                value={counts.reviewed}
                icon={<CheckCircle2 className="w-4 h-4" />}
                color="text-success"
                onClick={() => filters.setStatusFilter(
                  filters.statusFilter === 'reviewed' ? 'all' : 'reviewed',
                )}
                active={filters.statusFilter === 'reviewed'}
              />
              <StatCard
                label="Rascunhos"
                value={counts.drafts}
                icon={<FileEdit className="w-4 h-4" />}
                color="text-info"
                onClick={() => filters.setStatusFilter(
                  filters.statusFilter === 'draft' ? 'all' : 'draft',
                )}
                active={filters.statusFilter === 'draft'}
              />
            </div>

            {counts.byTrack.length > 1 && (
              <div className="card bg-base-100 border border-base-300">
                <div className="card-body p-3 gap-2">
                  <h2 className="font-semibold text-sm">Escritos por trilha</h2>
                  <ul className="space-y-1">
                    {counts.byTrack.map(b => (
                      <li key={b.track_id} className="flex items-center gap-2 text-xs">
                        <span className="flex-1 min-w-0 truncate">{b.track_title}</span>
                        <span className="text-base-content/60">{b.total} escrito{b.total !== 1 ? 's' : ''}</span>
                        {b.pending > 0 && (
                          <span className="badge badge-warning badge-sm">{b.pending} pendente{b.pending !== 1 ? 's' : ''}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <WritingsFilters
              tracks={tracks}
              trackFilter={filters.trackFilter}
              onTrackFilter={filters.setTrackFilter}
              kindFilter={filters.kindFilter}
              onKindFilter={filters.setKindFilter}
              statusFilter={filters.statusFilter}
              onStatusFilter={filters.setStatusFilter}
              search={filters.search}
              onSearch={filters.setSearch}
              from={filters.from}
              onFrom={filters.setFrom}
              to={filters.to}
              onTo={filters.setTo}
            />
          </>
        )}

        {loading && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 items-center text-center gap-2">
              <span className="loading loading-spinner loading-md text-primary" />
              <p className="text-sm text-base-content/60">Carregando escritos...</p>
            </div>
          </div>
        )}

        {!loading && tracks.length > 0 && filters.filtered.length === 0 && (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body p-6 text-center">
              <p className="text-sm text-base-content/60">
                {writings.length === 0
                  ? 'Nenhum aluno escreveu nada nas suas trilhas ainda.'
                  : 'Nenhum escrito bate com os filtros.'}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {filters.filtered.map(w => (
            <WritingCard
              key={w.key}
              writing={w}
              onOpenHistory={setHistoryOf}
              onReview={setReviewOf}
            />
          ))}
        </div>
      </div>

      {historyOf && (
        <WritingHistoryModal writing={historyOf} onClose={() => setHistoryOf(null)} />
      )}

      {reviewOf && (
        <WritingReviewModal
          writing={reviewOf}
          onClose={() => setReviewOf(null)}
          onReviewed={updated => patch(reviewOf.key, {
            status: updated.status,
            review_notes: updated.review_notes,
            reviewed_by: updated.reviewed_by,
          })}
        />
      )}
    </div>
  );
}

function statusLabel(status?: string): string {
  if (status === 'submitted') return 'Aguardando revisão';
  if (status === 'reviewed') return 'Revisado';
  if (status === 'draft') return 'Rascunho';
  return '';
}
