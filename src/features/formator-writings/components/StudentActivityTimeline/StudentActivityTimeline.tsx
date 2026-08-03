'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Activity, BookOpenCheck, Brain, CheckCircle2, CornerDownRight, Grid3x3,
  ListChecks, MessageCircle, PenLine, PlayCircle, Search, Sparkles, Unlock,
} from 'lucide-react';
import { useAccess } from '@/shared/hooks/useAccess';
import { LoadingCard } from '@/shared/components/LoadingCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { Timeline, TimelineItem } from '@/shared/components/Timeline';
import { formatRelativeDateTime } from '@/shared/utils/datetime';
import { ActivityWeeksChart, ActivityMixChart } from '@/features/formator-dashboard';
import { studentActivityService } from '@/application/formation/StudentActivityService';
import {
  ACTIVITY_KIND_LABELS,
  type ActivityCounts,
  type ActivityKind,
  type StudentActivityEvent,
} from '@/domain/formation/activity';

interface StudentActivityTimelineProps {
  studentId: string;
  /**
   * Reporta os contadores pra cima, pro cabeçalho de resumo.
   *
   * Callback em vez de o cabeçalho buscar por conta própria: as ~13 queries que
   * alimentam a timeline seriam refeitas só pra mostrar dois números.
   */
  onCountsChange?: (counts: ActivityCounts) => void;
}

type KindFilter = 'all' | ActivityKind;

/** Quantos eventos mostrar antes de exigir "ver mais". */
const PAGE_SIZE = 25;

export function StudentActivityTimeline({ studentId, onCountsChange }: StudentActivityTimelineProps) {
  const { user, isAdmin } = useAccess();
  const [events, setEvents] = useState<StudentActivityEvent[]>([]);
  const [counts, setCounts] = useState<ActivityCounts | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const viewerId = user?.id;

  // Em ref pra não reexecutar o efeito quando o pai recria a função.
  const onCountsRef = useRef(onCountsChange);
  onCountsRef.current = onCountsChange;

  useEffect(() => {
    if (!viewerId || !studentId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    studentActivityService.listForStudent({ viewerId, isAdmin, studentId })
      .then(result => {
        if (cancelled) return;
        setEvents(result.events);
        setCounts(result.counts);
        setWarnings(result.warnings);
        onCountsRef.current?.(result.counts);
      })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [viewerId, isAdmin, studentId]);

  /** Só oferece filtro pros tipos que o aluno realmente produziu. */
  const availableKinds = useMemo(() => {
    const kinds = Object.keys(counts?.byKind ?? {}) as ActivityKind[];
    return kinds.sort((a, b) => (counts!.byKind[b] ?? 0) - (counts!.byKind[a] ?? 0));
  }, [counts]);

  const filtered = useMemo(
    () => (kindFilter === 'all' ? events : events.filter(e => e.kind === kindFilter)),
    [events, kindFilter],
  );

  const shown = filtered.slice(0, visible);

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
          <Activity className="w-4 h-4 text-secondary" /> Histórico de atividades
        </h2>
        {counts && counts.total > 0 && (
          <span className="text-xs text-base-content/60">
            {counts.total} registro{counts.total === 1 ? '' : 's'} · {counts.activeDays} dia
            {counts.activeDays === 1 ? '' : 's'} com atividade
          </span>
        )}
      </div>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {warnings.map(w => (
        <div key={w} className="alert alert-warning text-sm"><span>{w}</span></div>
      ))}

      {loading && <LoadingCard label="Carregando histórico..." />}

      {/* Gráfico antes da lista: responde "está esfriando?" sem precisar ler evento
          por evento. Usa os eventos já carregados — nenhuma query extra. */}
      {!loading && events.length > 0 && <ActivityWeeksChart events={events} />}

      {!loading && events.length > 0 && <ActivityMixChart counts={counts} />}

      {!loading && events.length === 0 && (
        <EmptyState
          size="sm"
          icon={<Activity className="w-8 h-8" />}
          title="Nenhuma atividade registrada nas trilhas que você acompanha."
        />
      )}

      {!loading && availableKinds.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          <FilterChip
            label="Tudo"
            count={counts?.total ?? 0}
            active={kindFilter === 'all'}
            onClick={() => { setKindFilter('all'); setVisible(PAGE_SIZE); }}
          />
          {availableKinds.map(kind => (
            <FilterChip
              key={kind}
              label={ACTIVITY_KIND_LABELS[kind]}
              count={counts?.byKind[kind] ?? 0}
              active={kindFilter === kind}
              onClick={() => { setKindFilter(kind); setVisible(PAGE_SIZE); }}
            />
          ))}
        </div>
      )}

      {shown.length > 0 && (
        <Timeline>
          {shown.map(event => (
            <TimelineItem
              key={event.key}
              tone={event.outcome === 'success' ? 'success' : event.outcome === 'fail' ? 'error' : 'neutral'}
              icon={<KindIcon kind={event.kind} />}
            >
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-sm text-base-content">{event.title}</p>
                {event.detail && (
                  <span className={`text-xs ${detailTone(event.outcome)}`}>{event.detail}</span>
                )}
              </div>
              <p className="text-xs text-base-content/60 truncate">
                {event.track_title}
                {event.lesson_title && event.lesson_title !== '—' ? ` · ${event.lesson_title}` : ''}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-base-content/40">{formatRelativeDateTime(event.at)}</p>
                {event.href && (
                  <Link href={event.href} className="link link-hover text-[10px]">
                    abrir
                  </Link>
                )}
              </div>
            </TimelineItem>
          ))}
        </Timeline>
      )}

      {filtered.length > shown.length && (
        <button
          type="button"
          className="btn btn-ghost btn-sm w-full"
          onClick={() => setVisible(v => v + PAGE_SIZE)}
        >
          Ver mais ({filtered.length - shown.length} restantes)
        </button>
      )}
    </section>
  );
}

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, count, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn btn-xs ${active ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );
}

function KindIcon({ kind }: { kind: ActivityKind }) {
  const cls = 'w-4 h-4 shrink-0 mt-0.5';
  switch (kind) {
    case 'video_watch': return <PlayCircle className={`${cls} text-info`} />;
    case 'quiz': return <ListChecks className={`${cls} text-primary`} />;
    case 'flashcards': return <Brain className={`${cls} text-secondary`} />;
    case 'crossword': return <Grid3x3 className={`${cls} text-accent`} />;
    case 'word_search': return <Search className={`${cls} text-accent`} />;
    case 'case_study': return <BookOpenCheck className={`${cls} text-secondary`} />;
    case 'habit_log': return <Sparkles className={`${cls} text-success`} />;
    case 'reflection': return <PenLine className={`${cls} text-primary`} />;
    case 'forum_post': return <MessageCircle className={`${cls} text-accent`} />;
    case 'forum_reply': return <CornerDownRight className={`${cls} text-info`} />;
    case 'lesson_completed': return <CheckCircle2 className={`${cls} text-success`} />;
    case 'lesson_unlocked': return <Unlock className={`${cls} text-base-content/50`} />;
    default: return <Activity className={`${cls} text-base-content/50`} />;
  }
}

/** Classes literais — Tailwind não enxerga classe montada em runtime. */
function detailTone(outcome: StudentActivityEvent['outcome']): string {
  if (outcome === 'success') return 'text-success';
  if (outcome === 'fail') return 'text-error';
  return 'text-base-content/60';
}

