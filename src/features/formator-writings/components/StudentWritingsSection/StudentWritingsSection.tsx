'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clock, FileEdit, PenLine } from 'lucide-react';
import { useAccess } from '@/shared/hooks/useAccess';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingCard } from '@/shared/components/LoadingCard';
import { StatCard } from '@/shared/components/StatCard';
import {
  WRITING_KIND_LABELS,
  type StudentWriting, type WritingKind, type WritingsCounts,
} from '@/domain/formation/writings';
import type { ReflectionStatus } from '@/domain/spiritual-notebook/types';
import { useStudentWritings } from '../../hooks/useStudentWritings';
import { WritingCard } from '../WritingCard/WritingCard';
import { WritingHistoryModal } from '../WritingHistoryModal/WritingHistoryModal';
import { WritingReviewModal } from '../WritingReviewModal/WritingReviewModal';

interface StudentWritingsSectionProps {
  studentId: string;
  /** Reporta os contadores pro cabeçalho de resumo, sem refazer as queries. */
  onCountsChange?: (counts: WritingsCounts) => void;
}

/** Cada card monta um ReactMarkdown — paginar não é luxo. */
const PAGE_SIZE = 10;

type StatusFilter = 'all' | ReflectionStatus;
type KindFilter = 'all' | WritingKind;

/**
 * Bloco "Escritos" na página de detalhe do aluno.
 *
 * Ganhou filtros e paginação porque era uma lista crua: os mesmos dados já eram
 * filtráveis na tela de escopo, e os contadores (`total`, `reviewed`, `drafts`)
 * eram calculados e descartados — só `pendingReview` chegava à tela.
 */
export function StudentWritingsSection({ studentId, onCountsChange }: StudentWritingsSectionProps) {
  const { user, isAdmin } = useAccess();
  const { writings, counts, warnings, truncated, loading, error, patch } =
    useStudentWritings(user?.id, isAdmin, studentId);

  // Ref pra não disparar o efeito quando o pai recria a função.
  const onCountsRef = useRef(onCountsChange);
  onCountsRef.current = onCountsChange;
  useEffect(() => {
    if (counts) onCountsRef.current?.(counts);
  }, [counts]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [historyOf, setHistoryOf] = useState<StudentWriting | null>(null);
  const [reviewOf, setReviewOf] = useState<StudentWriting | null>(null);

  /** Só oferece filtro de tipo para o que o aluno realmente produziu. */
  const kindsDisponiveis = useMemo(() => {
    const presentes = new Set(writings.map(w => w.kind));
    return (Object.keys(WRITING_KIND_LABELS) as WritingKind[]).filter(k => presentes.has(k));
  }, [writings]);

  const filtrados = useMemo(() => {
    let lista = writings;
    if (statusFilter !== 'all') lista = lista.filter(w => w.status === statusFilter);
    if (kindFilter !== 'all') lista = lista.filter(w => w.kind === kindFilter);
    return lista;
  }, [writings, statusFilter, kindFilter]);

  const exibidos = filtrados.slice(0, visible);

  function aplicarStatus(next: StatusFilter) {
    setStatusFilter(prev => (prev === next ? 'all' : next));
    setVisible(PAGE_SIZE);
  }

  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
        <PenLine className="w-4 h-4 text-primary" /> Escritos do aluno
      </h2>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {warnings.map(w => (
        <div key={w} className="alert alert-warning text-sm"><span>{w}</span></div>
      ))}

      {truncated && (
        <div className="alert alert-info text-sm">
          <span>Muitos escritos — mostrando os mais recentes. Use os filtros pra afinar.</span>
        </div>
      )}

      {loading && <LoadingCard label="Carregando escritos..." />}

      {!loading && counts && counts.total > 0 && (
        /* Contadores que já eram calculados e nunca chegavam à tela. */
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
            onClick={() => aplicarStatus('submitted')}
            active={statusFilter === 'submitted'}
          />
          <StatCard
            label="Revisados"
            value={counts.reviewed}
            icon={<CheckCircle2 className="w-4 h-4" />}
            color="text-success"
            onClick={() => aplicarStatus('reviewed')}
            active={statusFilter === 'reviewed'}
          />
          <StatCard
            label="Rascunhos"
            value={counts.drafts}
            icon={<FileEdit className="w-4 h-4" />}
            color="text-info"
            onClick={() => aplicarStatus('draft')}
            active={statusFilter === 'draft'}
          />
        </div>
      )}

      {!loading && kindsDisponiveis.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          <KindChip
            label="Todos"
            count={writings.length}
            active={kindFilter === 'all'}
            onClick={() => { setKindFilter('all'); setVisible(PAGE_SIZE); }}
          />
          {kindsDisponiveis.map(kind => (
            <KindChip
              key={kind}
              label={WRITING_KIND_LABELS[kind]}
              count={counts?.byKind[kind] ?? 0}
              active={kindFilter === kind}
              onClick={() => { setKindFilter(kind); setVisible(PAGE_SIZE); }}
            />
          ))}
        </div>
      )}

      {!loading && writings.length === 0 && (
        <EmptyState
          size="sm"
          title="Este aluno ainda não escreveu nada nas trilhas que você acompanha."
        />
      )}

      {!loading && writings.length > 0 && filtrados.length === 0 && (
        <EmptyState size="sm" title="Nenhum escrito bate com os filtros." />
      )}

      <div className="space-y-2">
        {exibidos.map(w => (
          <WritingCard
            key={w.key}
            writing={w}
            hideStudent
            onOpenHistory={setHistoryOf}
            onReview={setReviewOf}
          />
        ))}
      </div>

      {filtrados.length > exibidos.length && (
        <button
          type="button"
          className="btn btn-ghost btn-sm w-full"
          onClick={() => setVisible(v => v + PAGE_SIZE)}
        >
          Ver mais ({filtrados.length - exibidos.length} restantes)
        </button>
      )}

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
    </section>
  );
}

function KindChip({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`btn btn-xs ${active ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );
}
