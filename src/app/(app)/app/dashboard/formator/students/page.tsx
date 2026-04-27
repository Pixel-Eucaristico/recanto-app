'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Search, ChevronRight, BookOpen } from 'lucide-react';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { formatorService, type StudentSummary } from '@/application/formation/FormatorService';
import type { FormationTrack } from '@/domain/formation/types';

export default function FormatorStudentsPage() {
  const user = useCurrentUser();
  const [tracks, setTracks] = useState<FormationTrack[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [trackFilter, setTrackFilter] = useState<string>('all');
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
      .then(({ tracks, students }) => {
        setTracks(tracks);
        setStudents(students);
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [user?.id, isAdmin, isFormator]);

  const filtered = useMemo(() => {
    let list = students;
    if (trackFilter !== 'all') {
      list = list.filter(s => s.trackIds.includes(trackFilter));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.user.name || '').toLowerCase().includes(q)
        || (s.user.email || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [students, trackFilter, search]);

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

        {tracks.length > 0 && (
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
            </div>
          </div>
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
