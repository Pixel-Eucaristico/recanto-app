'use client';

import { Activity, CalendarCheck, GraduationCap, PenLine } from 'lucide-react';
import { formatRelative } from '@/shared/utils/datetime';
import { buildTrackProgress, formatProgressCount, formatProgressPercent } from '@/domain/formation/progress';
import { activityBand, ACTIVITY_BAND_LABELS, type ActivityBand } from '@/application/formation/FormatorService';

interface StudentSummaryHeaderProps {
  name: string;
  email?: string;
  /** Aulas concluídas somando todas as trilhas no escopo. */
  completedLessons: number;
  /** Total de aulas do currículo. `null` se não resolveu. */
  totalLessons: number | null;
  /** Última atividade registrada. `ActivityCounts.lastAt`. */
  lastActivityAt: string | null;
  /** Dias distintos com atividade. */
  activeDays: number;
  /** Reflexões aguardando revisão. */
  pendingReviews: number;
  loading?: boolean;
}

/**
 * Resumo do aluno no topo da página de detalhe.
 *
 * A página não tinha nenhum: só o nome. Tudo que o formador precisa nos primeiros
 * segundos — onde o aluno está, quando apareceu por último, se há algo esperando
 * ele — ficava espalhado dentro dos blocos, ou nem era exibido: `lastAt` e
 * `activeDays` eram calculados e descartados.
 */
export function StudentSummaryHeader({
  name, email, completedLessons, totalLessons, lastActivityAt, activeDays,
  pendingReviews, loading,
}: StudentSummaryHeaderProps) {
  const progresso = buildTrackProgress(completedLessons, totalLessons);
  const banda = activityBand(lastActivityAt);

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-3 sm:p-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="avatar placeholder shrink-0">
            <div className="bg-neutral text-neutral-content rounded-full w-12">
              <span className="text-lg">{name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold truncate">{name}</h1>
            {email && <p className="text-xs text-base-content/50 truncate">{email}</p>}
          </div>
          <span className={`badge badge-sm shrink-0 ${bandBadge(banda)}`}>
            {ACTIVITY_BAND_LABELS[banda]}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <span className="loading loading-spinner loading-xs" /> Calculando resumo...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Metric
              icon={<GraduationCap className="w-4 h-4" />}
              color="text-primary"
              label="Progresso"
              value={formatProgressPercent(progresso)}
              hint={formatProgressCount(progresso)}
            />
            <Metric
              icon={<Activity className="w-4 h-4" />}
              color="text-info"
              label="Última atividade"
              value={lastActivityAt ? formatRelative(lastActivityAt) : '—'}
            />
            <Metric
              icon={<CalendarCheck className="w-4 h-4" />}
              color="text-success"
              label="Dias com atividade"
              value={activeDays}
            />
            <Metric
              icon={<PenLine className="w-4 h-4" />}
              color={pendingReviews > 0 ? 'text-warning' : 'text-base-content/50'}
              label="Aguardando revisão"
              value={pendingReviews}
              hint={pendingReviews > 0 ? 'Precisa da sua leitura' : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ icon, color, label, value, hint }: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-base-200/60 p-2 sm:p-3">
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="text-[10px] sm:text-[11px] text-base-content/60 truncate">{label}</span>
      </div>
      <p className="text-sm sm:text-base font-bold mt-0.5 truncate">{value}</p>
      {hint && <p className="text-[10px] text-base-content/50 truncate">{hint}</p>}
    </div>
  );
}

/** Classes literais — Tailwind não resolve classe montada em runtime. */
function bandBadge(band: ActivityBand): string {
  if (band === 'active') return 'badge-success';
  if (band === 'attention') return 'badge-info';
  if (band === 'stale') return 'badge-warning';
  return 'badge-error';
}
