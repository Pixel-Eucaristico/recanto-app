'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, GraduationCap, CheckCircle2, Clock, BookMarked } from 'lucide-react';
import { BackButton } from '@/shared/components/BackButton';
import { useAccess } from '@/shared/hooks/useAccess';
import { StudentWritingsSection, StudentActivityTimeline } from '@/features/formator-writings';
import { formatRelative } from '@/shared/utils/datetime';
import { LoadingCard } from '@/shared/components/LoadingCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { StudentSummaryHeader } from '@/features/formator-dashboard';
import type { ActivityCounts } from '@/domain/formation/activity';
import type { WritingsCounts } from '@/domain/formation/writings';
import {
  buildTrackProgress, formatProgressCount, formatProgressPercent, progressBadgeClass,
} from '@/domain/formation/progress';
import { formatorService } from '@/application/formation/FormatorService';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import { bookRepository } from '@/infrastructure/library/BookRepository';
import type { FormationTrack, LessonProgress } from '@/domain/formation/types';
import type { FirebaseUser } from '@/types/firebase-entities';
import type { BookReadingProgress, Book } from '@/domain/library/types';

interface TrackBlock {
  track: FormationTrack;
  progresses: LessonProgress[];
  lessonTitles: Map<string, string>;
  /** Total real de aulas da trilha. `null` quando o currículo não resolveu. */
  totalLessons: number | null;
}

export default function FormatorStudentDetailPage() {
  const { user, isAdmin } = useAccess();
  const params = useParams();
  const studentId = String(params?.uid ?? '');

  const [student, setStudent] = useState<FirebaseUser | null>(null);
  const [blocks, setBlocks] = useState<TrackBlock[]>([]);
  const [books, setBooks] = useState<Array<{ progress: BookReadingProgress; book: Book | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Vêm dos blocos abaixo via callback — evita repetir as ~13 queries da timeline.
  const [activityCounts, setActivityCounts] = useState<ActivityCounts | null>(null);
  const [writingsCounts, setWritingsCounts] = useState<WritingsCounts | null>(null);

  useEffect(() => {
    if (!user || !studentId) return;
    setLoading(true);
    (async () => {
      try {
        const detail = await formatorService.getStudentDetail(user.id, isAdmin, studentId);
        if (!detail.student) {
          setError('Aluno não encontrado ou sem acesso.');
          setLoading(false);
          return;
        }
        setStudent(detail.student);

        // Uma única leitura de aulas para tudo. Antes eram dois loops sequenciais
        // sobre as MESMAS aulas: um para títulos, outro para book_citations.
        const todasLessonIds = Array.from(new Set(
          detail.tracks.flatMap(t =>
            (detail.progressesByTrack.get(t.id) ?? []).map(p => p.lesson_id)),
        ));
        const lessons = await lessonRepository.findByIds(todasLessonIds);
        const lessonById = new Map(lessons.map(l => [l.id, l] as const));

        const blockList: TrackBlock[] = detail.tracks.map(track => {
          const progresses = detail.progressesByTrack.get(track.id) ?? [];
          const lessonTitles = new Map<string, string>();
          for (const p of progresses) {
            const titulo = lessonById.get(p.lesson_id)?.title;
            if (titulo) lessonTitles.set(p.lesson_id, titulo);
          }
          return {
            track,
            progresses,
            lessonTitles,
            totalLessons: detail.lessonCounts.get(track.id) ?? null,
          };
        });
        setBlocks(blockList);

        // Livros citados pelas aulas que o aluno já tocou.
        const bookIds = new Set<string>();
        for (const l of lessons) {
          for (const c of l.book_citations ?? []) {
            if (c.book_id) bookIds.add(c.book_id);
          }
        }

        const allBookProgress = await bookReadingProgressRepository.findByUser(studentId);
        const filteredBookProgress = allBookProgress.filter(bp => bookIds.has(bp.book_id));
        const booksData = await Promise.all(
          filteredBookProgress.map(async bp => ({
            progress: bp,
            book: await bookRepository.get(bp.book_id).catch(() => null),
          })),
        );
        setBooks(booksData);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, isAdmin, studentId]);

  /**
   * Progresso somado das trilhas no escopo. `total` é `null` se QUALQUER trilha não
   * resolveu o currículo — somar parcialmente daria um percentual inflado.
   */
  const resumo = useMemo(() => {
    let concluidas = 0;
    let total: number | null = 0;
    for (const b of blocks) {
      concluidas += b.progresses.filter(p => p.status === 'completed').length;
      total = total === null || b.totalLessons === null ? null : total + b.totalLessons;
    }
    return { concluidas, total };
  }, [blocks]);

  if (!user) return <div className="p-6">Faça login.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6">
      <div className="max-w-3xl lg:max-w-6xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref="/app/dashboard/formator/students" />
        </div>

        {/* Resumo antes das listas — o formador precisa do quadro geral em segundos. */}
        <StudentSummaryHeader
          name={student?.name || student?.email || 'Aluno'}
          email={student?.name ? student?.email : undefined}
          completedLessons={resumo.concluidas}
          totalLessons={resumo.total}
          lastActivityAt={activityCounts?.lastAt ?? null}
          activeDays={activityCounts?.activeDays ?? 0}
          pendingReviews={writingsCounts?.pendingReview ?? 0}
          loading={loading || !activityCounts}
        />

        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        {loading && <LoadingCard label="Carregando jornada do aluno..." />}

        {!loading && blocks.length === 0 && (
          <EmptyState
            size="sm"
            title="Aluno não tem progresso nas trilhas que você acompanha."
            description="Se ele foi matriculado recentemente, pode ainda não ter aberto nenhuma aula."
          />
        )}

        {blocks.map(({ track, progresses, lessonTitles, totalLessons }) => {
          const completed = progresses.filter(p => p.status === 'completed').length;
          // Total do currículo, não das aulas abertas.
          const progresso = buildTrackProgress(completed, totalLessons);
          return (
            <section key={track.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-3 sm:p-4 gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-primary" /> {track.title}
                  </h2>
                  <span className={`badge badge-sm ${progressBadgeClass(progresso)}`}>
                    {formatProgressCount(progresso)} · {formatProgressPercent(progresso)}
                  </span>
                </div>

                <ul className="space-y-1">
                  {progresses
                    .slice()
                    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
                    .map(p => (
                    <li key={p.id} className="flex items-start gap-2 text-xs">
                      <StatusIcon status={p.status} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{lessonTitles.get(p.lesson_id) ?? '(aula)'}</p>
                        <p className="text-[10px] text-base-content/50">
                          {p.video_watch_percent ?? 0}% vídeo
                          {p.reflection_submitted && ' · reflexão'}
                          {p.quiz_passed && ' · quiz ok'}
                          {p.forum_post_made && ' · fórum'}
                          {p.updated_at && ` · ${formatRelative(p.updated_at)}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}

        {!loading && (
          <StudentActivityTimeline studentId={studentId} onCountsChange={setActivityCounts} />
        )}

        {!loading && (
          <StudentWritingsSection studentId={studentId} onCountsChange={setWritingsCounts} />
        )}

        {books.length > 0 && (
          <section className="card bg-base-100 border border-base-300">
            <div className="card-body p-3 sm:p-4 gap-2">
              <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
                <BookMarked className="w-4 h-4 text-info" /> Livros das trilhas
              </h2>
              <ul className="space-y-1">
                {books.map(({ progress, book }) => (
                  <li key={progress.id} className="flex items-start gap-2 text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-info shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{book?.title ?? progress.book_title ?? 'Livro'}</p>
                      <p className="text-[10px] text-base-content/50">
                        {progress.percent}% lido
                        {progress.completed_at && ' · concluído'}
                        {progress.updated_at && ` · ${formatRelative(progress.updated_at)}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: LessonProgress['status'] }) {
  if (status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />;
  if (status === 'in_progress') return <Clock className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />;
  return <BookOpen className="w-3.5 h-3.5 text-base-content/40 shrink-0 mt-0.5" />;
}

