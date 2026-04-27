'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, GraduationCap, CheckCircle2, Clock, BookMarked } from 'lucide-react';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
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
}

export default function FormatorStudentDetailPage() {
  const user = useCurrentUser();
  const params = useParams();
  const studentId = String(params?.uid ?? '');

  const [student, setStudent] = useState<FirebaseUser | null>(null);
  const [blocks, setBlocks] = useState<TrackBlock[]>([]);
  const [books, setBooks] = useState<Array<{ progress: BookReadingProgress; book: Book | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.features.includes('*') || false;

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

        // Resolve títulos das aulas por trilha
        const blockList: TrackBlock[] = [];
        for (const track of detail.tracks) {
          const progresses = detail.progressesByTrack.get(track.id) ?? [];
          const lessonTitles = await formatorService.resolveLessonTitles(progresses);
          blockList.push({ track, progresses, lessonTitles });
        }
        setBlocks(blockList);

        // Livros vinculados às trilhas (citações nas aulas) — filtra só esses
        const bookIds = new Set<string>();
        for (const track of detail.tracks) {
          // pra cada lesson da trilha, ler citations
          // module_ids → modules → lessons → book_citations
          // simplificação: pega lessons das progresses (já interagidas)
          const progresses = detail.progressesByTrack.get(track.id) ?? [];
          const lessonIds = Array.from(new Set(progresses.map(p => p.lesson_id)));
          const lessons = await lessonRepository.findByIds(lessonIds);
          for (const l of lessons) {
            for (const c of l.book_citations ?? []) {
              if (c.book_id) bookIds.add(c.book_id);
            }
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

  if (!user) return <div className="p-6">Faça login.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <Link href="/app/dashboard/formator/students" className="btn btn-ghost btn-sm gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-base sm:text-lg font-bold truncate">
            {student?.name || student?.email || 'Aluno'}
          </h1>
        </div>

        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        {loading && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 items-center text-center gap-2">
              <span className="loading loading-spinner loading-md text-primary" />
              <p className="text-sm text-base-content/60">Carregando jornada do aluno...</p>
            </div>
          </div>
        )}

        {!loading && blocks.length === 0 && (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body p-6 text-center">
              <p className="text-sm text-base-content/60">
                Aluno não tem progresso nas trilhas que você acompanha.
              </p>
            </div>
          </div>
        )}

        {blocks.map(({ track, progresses, lessonTitles }) => {
          const completed = progresses.filter(p => p.status === 'completed').length;
          const percent = progresses.length > 0 ? Math.round((completed / progresses.length) * 100) : 0;
          return (
            <section key={track.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-3 sm:p-4 gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-primary" /> {track.title}
                  </h2>
                  <span className={`badge badge-sm ${percent >= 100 ? 'badge-success' : 'badge-info'}`}>
                    {completed}/{progresses.length} · {percent}%
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

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `${days} dias atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
