'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react';
import { formatRelative } from '@/shared/utils/datetime';
import {
  buildTrackProgress, formatProgressCount, formatProgressPercent, progressBadgeClass,
} from '@/domain/formation/progress';
import {
  activityBand, ACTIVITY_BAND_LABELS,
  type ActivityBand, type StudentSummary,
} from '@/application/formation/FormatorService';

interface StudentsTableProps {
  students: StudentSummary[];
  /** trackId → total de aulas, para o progresso real. */
  lessonCountByTrack: Map<string, number>;
  /** trackId → título, para mostrar o nome em vez da contagem. */
  trackTitleById: Map<string, string>;
}

type SortKey = 'name' | 'progress' | 'lastActivity';

/**
 * Tabela densa de alunos — visão de desktop.
 *
 * O trabalho do formador aqui é comparar alunos entre si, e comparação pede
 * colunas alinhadas, não uma pilha de cards de três andares. Os cards continuam no
 * mobile (`StudentsCards`), onde tabela não cabe.
 *
 * Mostra o NOME das trilhas: antes só a contagem chegava à tela, e o export CSV
 * tinha mais informação que a interface.
 */
export function StudentsTable({ students, lessonCountByTrack, trackTitleById }: StudentsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('lastActivity');
  const [asc, setAsc] = useState(false);

  const linhas = useMemo(() => students.map(s => {
    const total = s.trackIds.reduce<number | null>((soma, id) => {
      const t = lessonCountByTrack.get(id);
      return soma === null || t === undefined ? null : soma + t;
    }, 0);
    return {
      student: s,
      progress: buildTrackProgress(s.totalLessonsCompleted, total),
      band: activityBand(s.lastActivityAt),
      nome: s.user.name || s.user.email || s.user.id,
      trilhas: s.trackIds.map(id => trackTitleById.get(id) ?? id),
    };
  }), [students, lessonCountByTrack, trackTitleById]);

  const ordenadas = useMemo(() => {
    const dir = asc ? 1 : -1;
    return [...linhas].sort((a, b) => {
      if (sortKey === 'name') return a.nome.localeCompare(b.nome) * dir;
      if (sortKey === 'progress') {
        // Sem percentual vai para o fim, independente da direção — não é "zero".
        if (a.progress.percent === null) return 1;
        if (b.progress.percent === null) return -1;
        return (a.progress.percent - b.progress.percent) * dir;
      }
      return (a.student.lastActivityAt ?? '').localeCompare(b.student.lastActivityAt ?? '') * dir;
    });
  }, [linhas, sortKey, asc]);

  function alternar(key: SortKey) {
    if (sortKey === key) setAsc(v => !v);
    else { setSortKey(key); setAsc(key === 'name'); }
  }

  return (
    /* Rolagem dentro do container — a página nunca rola na horizontal. */
    <div className="card bg-base-100 border border-base-300 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <SortHeader label="Aluno" active={sortKey === 'name'} asc={asc} onClick={() => alternar('name')} />
              <th>Trilhas</th>
              <SortHeader label="Progresso" numeric active={sortKey === 'progress'} asc={asc} onClick={() => alternar('progress')} />
              <SortHeader label="Última atividade" active={sortKey === 'lastActivity'} asc={asc} onClick={() => alternar('lastActivity')} />
              <th>Situação</th>
              <th aria-label="Abrir" />
            </tr>
          </thead>
          <tbody>
            {ordenadas.map(({ student, progress, band, nome, trilhas }) => (
              <tr key={student.user.id} className="hover">
                <td>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="avatar placeholder shrink-0">
                      <div className="bg-neutral text-neutral-content rounded-full w-8">
                        <span className="text-xs">{nome.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate max-w-[14rem]">{nome}</p>
                      {student.user.email && student.user.name && (
                        <p className="text-[11px] text-base-content/50 truncate max-w-[14rem]">
                          {student.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="text-xs text-base-content/70">
                  <span className="line-clamp-2 max-w-[16rem]" title={trilhas.join(' · ')}>
                    {trilhas.join(' · ') || '—'}
                  </span>
                </td>

                <td className="text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={`badge badge-sm ${progressBadgeClass(progress)}`}>
                      {formatProgressPercent(progress)}
                    </span>
                    <span className="text-[10px] text-base-content/50 tabular-nums">
                      {formatProgressCount(progress)}
                    </span>
                  </div>
                </td>

                <td className="text-xs text-base-content/70 whitespace-nowrap">
                  {student.lastActivityAt ? formatRelative(student.lastActivityAt) : '—'}
                </td>

                <td>
                  <span className={`badge badge-sm ${bandBadge(band)}`}>
                    {ACTIVITY_BAND_LABELS[band]}
                  </span>
                </td>

                <td>
                  <Link
                    href={`/app/dashboard/formator/students/${student.user.id}`}
                    className="btn btn-ghost btn-xs"
                    aria-label={`Abrir ${nome}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({ label, active, asc, numeric, onClick }: {
  label: string; active: boolean; asc: boolean; numeric?: boolean; onClick: () => void;
}) {
  return (
    <th className={numeric ? 'text-right' : undefined} aria-sort={active ? (asc ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-base-content ${active ? 'text-base-content' : 'text-base-content/60'}`}
      >
        {label}
        {active && (asc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </button>
    </th>
  );
}

/** Classes literais — Tailwind não resolve classe montada em runtime. */
function bandBadge(band: ActivityBand): string {
  if (band === 'active') return 'badge-success';
  if (band === 'attention') return 'badge-info';
  if (band === 'stale') return 'badge-warning';
  return 'badge-error';
}
