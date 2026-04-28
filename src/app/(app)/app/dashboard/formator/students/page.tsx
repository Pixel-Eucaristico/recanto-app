'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Search, ChevronRight, Activity, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { formatorService, type StudentSummary, type FormatorStats } from '@/application/formation/FormatorService';
import type { FormationTrack } from '@/domain/formation/types';
import { toCsv, downloadCsv } from '@/shared/utils/csv';

type ActivityFilter = 'all' | 'active' | 'stale' | 'never';

export default function FormatorStudentsPage() {
  const user = useCurrentUser();
  const [tracks, setTracks] = useState<FormationTrack[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [stats, setStats] = useState<FormatorStats | null>(null);
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.features.includes('*') || false;
  const isFormator = isAdmin
    || user?.features.includes('manage:formation')
    || user?.role === 'missionario';

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

  const filtered = useMemo(() => {
    let list = students;
    if (trackFilter !== 'all') {
      list = list.filter(s => s.trackIds.includes(trackFilter));
    }
    if (activityFilter !== 'all') {
      const now = Date.now();
      const day = 86400000;
      list = list.filter(s => {
        if (!s.lastActivityAt) return activityFilter === 'never';
        const ageDays = (now - new Date(s.lastActivityAt).getTime()) / day;
        if (activityFilter === 'active') return ageDays <= 7;
        if (activityFilter === 'stale') return ageDays > 14;
        return false;
      });
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
    const rows = filtered.map(s => ({
      nome: s.user.name ?? '',
      email: s.user.email ?? '',
      trilhas: s.trackIds.map(id => trackById.get(id) ?? id).join(' | '),
      aulas_iniciadas: s.totalLessonsTouched,
      aulas_concluidas: s.totalLessonsCompleted,
      percentual: s.totalLessonsTouched > 0
        ? Math.round((s.totalLessonsCompleted / s.totalLessonsTouched) * 100)
        : 0,
      ultima_atividade: s.lastActivityAt
        ? new Date(s.lastActivityAt).toLocaleString('pt-BR')
        : '',
    }));
    const csv = toCsv(rows, [
      'nome', 'email', 'trilhas',
      'aulas_iniciadas', 'aulas_concluidas', 'percentual',
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
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <Link href="/app/dashboard/journey" className="btn btn-ghost btn-sm gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
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
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body p-6 text-center gap-1">
              <p className="text-sm font-medium">
                {isAdmin ? 'Sem trilhas cadastradas.' : 'Você não está atribuído como formador em nenhuma trilha.'}
              </p>
              <p className="text-xs text-base-content/60">
                {isAdmin
                  ? 'Crie trilhas em Admin → Formação.'
                  : 'Peça a um admin pra te atribuir como formador na edição da trilha.'}
              </p>
            </div>
          </div>
        )}

        {tracks.length > 0 && stats && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatCard
                label="Total de alunos"
                value={stats.totalStudents}
                icon={<Users className="w-4 h-4" />}
                color="text-primary"
              />
              <StatCard
                label="Ativos (7d)"
                value={stats.activeLast7d}
                icon={<Activity className="w-4 h-4" />}
                color="text-success"
                onClick={() => setActivityFilter(prev => prev === 'active' ? 'all' : 'active')}
                active={activityFilter === 'active'}
              />
              <StatCard
                label="Parados (>14d)"
                value={stats.staleOver14d}
                icon={<AlertTriangle className="w-4 h-4" />}
                color="text-warning"
                onClick={() => setActivityFilter(prev => prev === 'stale' ? 'all' : 'stale')}
                active={activityFilter === 'stale'}
              />
              <StatCard
                label="Taxa de conclusão"
                value={`${stats.completionRate}%`}
                icon={<TrendingUp className="w-4 h-4" />}
                color="text-info"
              />
            </div>

            {/* Por trilha */}
            {stats.byTrack.length > 0 && (
              <div className="card bg-base-100 border border-base-300">
                <div className="card-body p-3 gap-2">
                  <h2 className="font-semibold text-sm">Conclusão por trilha</h2>
                  <ul className="space-y-1">
                    {stats.byTrack.map(b => (
                      <li key={b.track.id} className="flex items-center gap-2 text-xs">
                        <span className="flex-1 min-w-0 truncate">{b.track.title}</span>
                        <span className="text-base-content/60">
                          {b.studentCount} aluno{b.studentCount !== 1 ? 's' : ''} · {b.completedLessons}/{b.touchedLessons}
                        </span>
                        <span className={`badge badge-sm ${b.rate >= 70 ? 'badge-success' : b.rate >= 30 ? 'badge-info' : 'badge-ghost'}`}>
                          {b.rate}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

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
              <div role="tablist" className="tabs tabs-bordered">
                <button role="tab" className={`tab tab-sm ${activityFilter === 'all' ? 'tab-active' : ''}`} onClick={() => setActivityFilter('all')}>Todos</button>
                <button role="tab" className={`tab tab-sm ${activityFilter === 'active' ? 'tab-active' : ''}`} onClick={() => setActivityFilter('active')}>Ativos</button>
                <button role="tab" className={`tab tab-sm ${activityFilter === 'stale' ? 'tab-active' : ''}`} onClick={() => setActivityFilter('stale')}>Parados</button>
                <button role="tab" className={`tab tab-sm ${activityFilter === 'never' ? 'tab-active' : ''}`} onClick={() => setActivityFilter('never')}>Não iniciaram</button>
              </div>
            </div>
          </div>
          </>
        )}

        {loading && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 items-center text-center gap-2">
              <span className="loading loading-spinner loading-md text-primary" />
              <p className="text-sm text-base-content/60">Carregando alunos...</p>
            </div>
          </div>
        )}

        {!loading && tracks.length > 0 && filtered.length === 0 && (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body p-6 text-center">
              <p className="text-sm text-base-content/60">
                {students.length === 0
                  ? 'Nenhum aluno começou as trilhas ainda.'
                  : 'Nenhum aluno bate com os filtros.'}
              </p>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {filtered.map(s => {
            const percent = s.totalLessonsTouched > 0
              ? Math.round((s.totalLessonsCompleted / s.totalLessonsTouched) * 100)
              : 0;
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
                        {s.totalLessonsCompleted}/{s.totalLessonsTouched} aulas · {s.trackIds.length} trilha(s)
                      </p>
                      {s.lastActivityAt && (
                        <p className="text-[10px] text-base-content/40 mt-0.5">
                          Última atividade: {formatRelative(s.lastActivityAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`badge badge-sm ${percent >= 100 ? 'badge-success' : percent >= 50 ? 'badge-info' : 'badge-ghost'}`}>
                        {percent}%
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

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `${days} dias atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  active?: boolean;
}

function StatCard({ label, value, icon, color, onClick, active }: StatCardProps) {
  const content = (
    <div className={`card bg-base-100 border ${active ? 'border-primary' : 'border-base-300'} h-full`}>
      <div className="card-body p-3 gap-1">
        <div className={`flex items-center gap-1 ${color}`}>
          {icon}
          <span className="text-[11px] text-base-content/60 truncate">{label}</span>
        </div>
        <span className="text-lg font-bold">{value}</span>
      </div>
    </div>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="text-left hover:opacity-80 transition-opacity">
        {content}
      </button>
    );
  }
  return content;
}
