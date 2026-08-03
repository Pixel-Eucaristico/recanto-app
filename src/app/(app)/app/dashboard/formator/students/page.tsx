'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users, Search, ChevronRight, Activity, AlertTriangle, TrendingUp, Download, Clock, UserX,
} from 'lucide-react';
import { BackButton } from '@/shared/components/BackButton';
import { StatCard } from '@/shared/components/StatCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingCard } from '@/shared/components/LoadingCard';
import { TrackCompletionChart, StudentsTable } from '@/features/formator-dashboard';
import { useAccess } from '@/shared/hooks/useAccess';
import {
  formatorService, activityBand, ACTIVITY_BAND_LABELS,
  type StudentSummary, type FormatorStats, type ActivityBand,
} from '@/application/formation/FormatorService';
import type { FormationTrack } from '@/domain/formation/types';
import { toCsv, downloadCsv } from '@/shared/utils/csv';
import { formatRelative } from '@/shared/utils/datetime';
import {
  buildTrackProgress, formatProgressCount, formatProgressPercent, progressBadgeClass,
} from '@/domain/formation/progress';

type ActivityFilter = 'all' | ActivityBand;

/** Ordem das abas: da faixa que exige menos atenção para a que exige mais. */
const BAND_TABS: ActivityBand[] = ['active', 'attention', 'stale', 'never'];

export default function FormatorStudentsPage() {
  const { user, isAdmin, isFormatorLike: isFormator } = useAccess();
  const [tracks, setTracks] = useState<FormationTrack[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [stats, setStats] = useState<FormatorStats | null>(null);
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isFormator) { setLoading(false); return; }
    formatorService.getMyStudents(user.id, isAdmin)
      .then(({ tracks, students, stats }) => {
        setTracks(tracks);
        setStudents(students);
        setStats(stats);
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [user?.id, isAdmin, isFormator]);

  /** trackId → total de aulas do currículo, vindo das stats já calculadas. */
  const lessonCountByTrack = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const b of stats?.byTrack ?? []) {
      if (b.totalLessons !== null) mapa.set(b.track.id, b.totalLessons);
    }
    return mapa;
  }, [stats]);

  /** trackId → título. A tabela mostra o nome; antes só a contagem chegava à UI. */
  const trackTitleById = useMemo(
    () => new Map(tracks.map(t => [t.id, t.title] as const)),
    [tracks],
  );

  const filtered = useMemo(() => {
    let list = students;
    if (trackFilter !== 'all') {
      list = list.filter(s => s.trackIds.includes(trackFilter));
    }
    if (activityFilter !== 'all') {
      // Usa a mesma classificação das stats — antes o filtro tinha regras próprias
      // e devolvia false para a faixa de 7 a 14 dias, que sumia da tela.
      list = list.filter(s => activityBand(s.lastActivityAt) === activityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.user.name || '').toLowerCase().includes(q)
        || (s.user.email || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [students, trackFilter, activityFilter, search]);

  function exportCsv() {
    const trackById = new Map(tracks.map(t => [t.id, t.title] as const));
    const rows = filtered.map(s => {
      const totalDoAluno = s.trackIds.reduce<number | null>((soma, id) => {
        const total = lessonCountByTrack.get(id);
        return soma === null || total === undefined ? null : soma + total;
      }, 0);
      const progresso = buildTrackProgress(s.totalLessonsCompleted, totalDoAluno);
      return {
        nome: s.user.name ?? '',
        email: s.user.email ?? '',
        trilhas: s.trackIds.map(id => trackById.get(id) ?? id).join(' | '),
        aulas_iniciadas: s.totalLessonsTouched,
        aulas_concluidas: s.totalLessonsCompleted,
        aulas_no_curriculo: progresso.total ?? '',
        percentual: progresso.percent ?? '',
        ultima_atividade: s.lastActivityAt
          ? new Date(s.lastActivityAt).toLocaleString('pt-BR')
          : '',
      };
    });
    const csv = toCsv(rows, [
      'nome', 'email', 'trilhas',
      'aulas_iniciadas', 'aulas_concluidas', 'aulas_no_curriculo', 'percentual',
      'ultima_atividade',
    ]);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`alunos_${date}.csv`, csv);
  }

  if (!user) return <div className="p-6">Faça login.</div>;
  if (!isFormator) {
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
      {/* Larga no desktop: a tabela precisa de espaço. Antes eram 768px fixos, com
          ~670px vazios de cada lado em 1440px. */}
      <div className="max-w-3xl lg:max-w-6xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref="/app/dashboard/journey" />
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-1">
            <Users className="w-5 h-5 text-accent" /> Meus alunos
          </h1>
          {students.length > 0 && (
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

        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        {tracks.length === 0 && !loading && (
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title={isAdmin
              ? 'Sem trilhas cadastradas.'
              : 'Você não está atribuído como formador em nenhuma trilha.'}
            description={isAdmin
              ? 'Crie trilhas em Admin → Formação.'
              : 'Peça a um admin pra te atribuir como formador na edição da trilha.'}
          />
        )}

        {tracks.length > 0 && stats && (
          <>
            {/* Filtros acima de tudo que eles afetam — KPIs, gráfico e lista leem a
                mesma fatia, então os números sempre concordam. */}
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-3 gap-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-base-content/50 shrink-0" />
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1"
                    placeholder="Buscar aluno por nome ou email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    className="select select-bordered select-sm"
                    value={trackFilter}
                    onChange={e => setTrackFilter(e.target.value)}
                  >
                    <option value="all">Todas as trilhas ({tracks.length})</option>
                    {tracks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  {/* Select em vez de abas: 5 opções com rótulo longo estouram a
                      linha em 320px, e `tabs` não tem rolagem nem quebra. */}
                  <select
                    className="select select-bordered select-sm"
                    value={activityFilter}
                    onChange={e => setActivityFilter(e.target.value as ActivityFilter)}
                    aria-label="Filtrar por atividade"
                  >
                    <option value="all">Qualquer atividade</option>
                    {BAND_TABS.map(band => (
                      <option key={band} value={band}>{ACTIVITY_BAND_LABELS[band]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* As 4 faixas cobrem todos os alunos e somam o total — clicar filtra. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <StatCard
                label="Total de alunos"
                value={stats.totalStudents}
                icon={<Users className="w-4 h-4" />}
                color="text-primary"
                hint={`${stats.totalLessonsCompleted} aulas concluídas`}
              />
              <StatCard
                label={ACTIVITY_BAND_LABELS.active}
                value={stats.activeLast7d}
                icon={<Activity className="w-4 h-4" />}
                color="text-success"
                onClick={() => setActivityFilter(prev => prev === 'active' ? 'all' : 'active')}
                active={activityFilter === 'active'}
              />
              <StatCard
                label={ACTIVITY_BAND_LABELS.attention}
                value={stats.attention7to14d}
                icon={<Clock className="w-4 h-4" />}
                color="text-info"
                onClick={() => setActivityFilter(prev => prev === 'attention' ? 'all' : 'attention')}
                active={activityFilter === 'attention'}
              />
              <StatCard
                label={ACTIVITY_BAND_LABELS.stale}
                value={stats.staleOver14d}
                icon={<AlertTriangle className="w-4 h-4" />}
                color="text-warning"
                onClick={() => setActivityFilter(prev => prev === 'stale' ? 'all' : 'stale')}
                active={activityFilter === 'stale'}
              />
              {/* `neverStarted` era calculado e nunca renderizado. */}
              <StatCard
                label={ACTIVITY_BAND_LABELS.never}
                value={stats.neverStarted}
                icon={<UserX className="w-4 h-4" />}
                color="text-error"
                onClick={() => setActivityFilter(prev => prev === 'never' ? 'all' : 'never')}
                active={activityFilter === 'never'}
                hint={stats.neverStarted > 0 ? 'Matriculados sem atividade' : undefined}
              />
              <StatCard
                label="Taxa de conclusão"
                value={stats.completionRate === null ? '—' : `${stats.completionRate}%`}
                icon={<TrendingUp className="w-4 h-4" />}
                color="text-info"
              />
            </div>

            {/* Clicar na barra filtra a lista — antes era uma lista inerte e o
                filtro de trilha ficava dois cards abaixo. */}
            {stats.byTrack.length > 0 && (
              <TrackCompletionChart
                byTrack={stats.byTrack}
                selectedTrackId={trackFilter === 'all' ? undefined : trackFilter}
                onSelectTrack={id => setTrackFilter(prev => (prev === id ? 'all' : id))}
              />
            )}

          </>
        )}

        {loading && <LoadingCard label="Carregando alunos..." />}

        {!loading && tracks.length > 0 && filtered.length === 0 && (
          <EmptyState
            size="sm"
            title={students.length === 0
              ? 'Nenhum aluno começou as trilhas ainda.'
              : 'Nenhum aluno bate com os filtros.'}
            description={students.length > 0 ? 'Ajuste a busca ou os filtros acima.' : undefined}
          />
        )}

        {/* Desktop: tabela ordenável — comparar alunos pede colunas alinhadas. */}
        {filtered.length > 0 && (
          <div className="hidden lg:block">
            <StudentsTable
              students={filtered}
              lessonCountByTrack={lessonCountByTrack}
              trackTitleById={trackTitleById}
            />
          </div>
        )}

        {/* Mobile: cards — tabela de 6 colunas não cabe em 320px. */}
        <ul className="space-y-2 lg:hidden">
          {filtered.map(s => {
            // Denominador é a soma do currículo das trilhas do aluno, não as aulas
            // que ele abriu. Sem total conhecido, não há percentual.
            const totalDoAluno = s.trackIds.reduce<number | null>((soma, id) => {
              const total = lessonCountByTrack.get(id);
              return soma === null || total === undefined ? null : soma + total;
            }, 0);
            const progresso = buildTrackProgress(s.totalLessonsCompleted, totalDoAluno);
            return (
              <li key={s.user.id}>
                <Link
                  href={`/app/dashboard/formator/students/${s.user.id}`}
                  className="card bg-base-100 border border-base-300 hover:border-accent block"
                >
                  <div className="card-body p-3 flex-row items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-10">
                        <span className="text-sm">
                          {(s.user.name || s.user.email || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.user.name || s.user.email}</p>
                      <p className="text-[11px] text-base-content/60 truncate">
                        {formatProgressCount(progresso)} · {s.trackIds.length} trilha(s)
                      </p>
                      {s.lastActivityAt && (
                        <p className="text-[10px] text-base-content/40 mt-0.5">
                          Última atividade: {formatRelative(s.lastActivityAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`badge badge-sm ${progressBadgeClass(progresso)}`}>
                        {formatProgressPercent(progresso)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-base-content/40" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}


