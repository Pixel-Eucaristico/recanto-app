/**
 * StudentActivityService — linha do tempo do que o aluno fez num curso.
 *
 * As atividades (quiz, flashcards, cruzadinha, caça-palavras, estudo de caso, vídeo)
 * guardam `lesson_id` mas NÃO `track_id`. Em vez de resolver aula→módulo→trilha
 * (duas leituras por aula), o escopo sai do `formation_progress` do próprio aluno,
 * que já carrega `lesson_id` + `track_id` e é lido de qualquer forma. Atividade em
 * aula sem progresso registrado fica de fora — na prática não existe, porque
 * interagir com a aula cria o progresso.
 */

import { formatorService } from '@/application/formation/FormatorService';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import { attemptRepository } from '@/infrastructure/quiz/AttemptRepository';
import { crosswordResultRepository } from '@/infrastructure/crossword/CrosswordRepository';
import { wordSearchResultRepository } from '@/infrastructure/word-search/WordSearchRepository';
import { flashcardReviewRepository } from '@/infrastructure/flashcards/FlashcardReviewRepository';
import { caseRunRepository } from '@/infrastructure/case-studies/CaseRunRepository';
import { videoWatchSessionRepository } from '@/infrastructure/video-player/VideoWatchSessionRepository';
import { habitLogRepository } from '@/infrastructure/habits/HabitLogRepository';
import { habitRepository } from '@/infrastructure/habits/HabitRepository';
import { reflectionRepository } from '@/infrastructure/spiritual-notebook/ReflectionRepository';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { communityReplyRepository } from '@/infrastructure/community/CommunityReplyRepository';
import type { FormationTrack, FormationLesson, LessonProgress } from '@/domain/formation/types';
import type { CommunityPost, CommunityVisibility } from '@/domain/community/types';
import type {
  ActivityCounts,
  ActivityOutcome,
  StudentActivityEvent,
} from '@/domain/formation/activity';

export interface ActivityScopeInput {
  viewerId: string;
  isAdmin: boolean;
  studentId: string;
}

export interface ActivityResult {
  tracks: FormationTrack[];
  events: StudentActivityEvent[];
  counts: ActivityCounts;
  /** Fontes que falharam — lista vazia por erro não pode parecer "não fez nada". */
  warnings: string[];
}

const EMPTY_COUNTS: ActivityCounts = { total: 0, byKind: {}, lastAt: null, activeDays: 0 };

export class StudentActivityService {
  async listForStudent(input: ActivityScopeInput): Promise<ActivityResult> {
    const { viewerId, isAdmin, studentId } = input;

    const tracks = await formatorService.getMyTracks(viewerId, isAdmin);
    if (tracks.length === 0) {
      return { tracks: [], events: [], counts: EMPTY_COUNTS, warnings: [] };
    }

    const trackById = new Map(tracks.map(t => [t.id, t] as const));
    const warnings: string[] = [];

    // Progresso define o escopo: quais aulas do aluno pertencem às trilhas do viewer.
    const allProgress = await guard(
      () => progressRepository.findByUser(studentId), 'progresso', warnings, [] as LessonProgress[],
    );
    const scoped = allProgress.filter(p => trackById.has(p.track_id));
    if (scoped.length === 0) {
      return { tracks, events: [], counts: EMPTY_COUNTS, warnings };
    }

    const trackByLesson = new Map(scoped.map(p => [p.lesson_id, p.track_id] as const));
    const lessonIds = Array.from(trackByLesson.keys());

    const lessons = await guard(
      () => lessonRepository.findByIds(lessonIds), 'aulas', warnings, [] as FormationLesson[],
    );
    const lessonById = new Map(lessons.map(l => [l.id, l] as const));

    /** Contexto comum de um evento ancorado numa aula. */
    const ctxOf = (lessonId: string) => {
      const trackId = trackByLesson.get(lessonId) ?? null;
      return {
        track_id: trackId,
        track_title: trackId ? (trackById.get(trackId)?.title ?? 'Trilha') : '—',
        lesson_id: lessonId,
        lesson_title: lessonById.get(lessonId)?.title ?? '(aula)',
        href: trackId ? `/app/dashboard/formation/${trackId}/${lessonId}` : undefined,
      };
    };
    const inScope = (lessonId?: string): lessonId is string =>
      Boolean(lessonId) && trackByLesson.has(lessonId!);

    const [
      attempts, crosswords, wordSearches, flashcards, cases, videoSessions,
      reflections, posts, replies,
    ] = await Promise.all([
      guard(() => attemptRepository.findByUser(studentId), 'quizzes', warnings, []),
      guard(() => crosswordResultRepository.findByUser(studentId), 'cruzadinhas', warnings, []),
      guard(() => wordSearchResultRepository.findByUser(studentId), 'caça-palavras', warnings, []),
      guard(() => flashcardReviewRepository.findByUser(studentId), 'flashcards', warnings, []),
      guard(() => caseRunRepository.findByUser(studentId), 'estudos de caso', warnings, []),
      guard(() => videoWatchSessionRepository.findByUser(studentId), 'sessões de vídeo', warnings, []),
      guard(() => reflectionRepository.findByUser(studentId), 'reflexões', warnings, []),
      guard(() => communityPostRepository.findByUser(studentId, 100), 'perguntas do fórum', warnings, [] as CommunityPost[]),
      guard(() => communityReplyRepository.findByUser(studentId, 100), 'respostas do fórum', warnings, []),
    ]);

    const events: StudentActivityEvent[] = [];

    // ─── Marcos da aula ───────────────────────────────────────────────────
    for (const p of scoped) {
      if (p.completed_at) {
        events.push({
          key: `lesson_completed:${p.id}`, kind: 'lesson_completed', at: p.completed_at,
          ...ctxOf(p.lesson_id), title: 'Concluiu a aula', outcome: 'success',
        });
      } else if (p.unlocked_at) {
        events.push({
          key: `lesson_unlocked:${p.id}`, kind: 'lesson_unlocked', at: p.unlocked_at,
          ...ctxOf(p.lesson_id), title: 'Aula liberada', outcome: 'neutral',
        });
      }
    }

    // ─── Vídeo ────────────────────────────────────────────────────────────
    for (const s of videoSessions) {
      if (!inScope(s.lesson_id)) continue;
      events.push({
        key: `video_watch:${s.id}`, kind: 'video_watch', at: s.started_at,
        ...ctxOf(s.lesson_id),
        title: s.ended_at ? 'Assistiu o vídeo' : 'Começou a assistir',
        detail: formatWatchDetail(s.seconds_watched),
        outcome: 'neutral',
      });
    }

    // ─── Atividades com nota ──────────────────────────────────────────────
    for (const a of attempts) {
      if (!inScope(a.lesson_id)) continue;
      events.push({
        key: `quiz:${a.id}`, kind: 'quiz', at: a.attempted_at, ...ctxOf(a.lesson_id),
        title: a.passed ? 'Passou no quiz' : 'Tentou o quiz',
        detail: `${a.score}%`,
        outcome: a.passed ? 'success' : 'fail',
      });
    }

    for (const r of crosswords) {
      if (!inScope(r.lesson_id)) continue;
      events.push({
        key: `crossword:${r.id}`, kind: 'crossword', at: r.completed_at, ...ctxOf(r.lesson_id),
        title: 'Fez a cruzadinha', detail: `${r.score}%`, outcome: scoreOutcome(r.score),
      });
    }

    for (const r of wordSearches) {
      if (!inScope(r.lesson_id)) continue;
      events.push({
        key: `word_search:${r.id}`, kind: 'word_search', at: r.completed_at, ...ctxOf(r.lesson_id),
        title: 'Fez o caça-palavras', detail: `${r.score}%`, outcome: scoreOutcome(r.score),
      });
    }

    for (const r of flashcards) {
      if (!inScope(r.lesson_id)) continue;
      events.push({
        key: `flashcards:${r.id}`, kind: 'flashcards', at: r.reviewed_at, ...ctxOf(r.lesson_id),
        title: 'Revisou os flashcards',
        detail: `${r.correct_count} acerto${r.correct_count === 1 ? '' : 's'} · ${r.score}%`,
        outcome: scoreOutcome(r.score),
      });
    }

    for (const r of cases) {
      if (!inScope(r.lesson_id)) continue;
      events.push({
        key: `case_study:${r.id}`, kind: 'case_study', at: r.run_at, ...ctxOf(r.lesson_id),
        title: 'Resolveu o estudo de caso', outcome: 'neutral',
      });
    }

    // ─── Escritos (compacto — o texto completo fica na seção de escritos) ──
    for (const r of reflections) {
      if (!trackById.has(r.track_id)) continue;
      events.push({
        key: `reflection:${r.id}`, kind: 'reflection',
        at: r.submitted_at ?? r.updated_at ?? r.created_at,
        track_id: r.track_id, track_title: r.track_title,
        lesson_id: r.lesson_id, lesson_title: r.lesson_title,
        title: reflectionTitle(r.status),
        detail: excerpt(r.content),
        outcome: r.status === 'reviewed' ? 'success' : 'neutral',
        href: `/app/dashboard/formation/${r.track_id}/${r.lesson_id}`,
      });
    }

    for (const p of posts) {
      const trackId = scopeTrackId(p.visibility);
      if (!trackId || !trackById.has(trackId)) continue;
      const lessonId = scopeLessonId(p.visibility);
      events.push({
        key: `forum_post:${p.id}`, kind: 'forum_post', at: p.created_at,
        track_id: trackId, track_title: trackById.get(trackId)!.title,
        lesson_id: lessonId, lesson_title: lessonId ? (lessonById.get(lessonId)?.title ?? '(aula)') : 'Trilha',
        title: 'Perguntou no fórum', detail: p.title || excerpt(p.body), outcome: 'neutral',
        href: `/app/dashboard/forum?post=${encodeURIComponent(p.id)}`,
      });
    }

    if (replies.length > 0) {
      const parents = await guard(
        () => communityPostRepository.findByIds(replies.map(r => r.post_id)),
        'posts das respostas', warnings, [] as CommunityPost[],
      );
      const postById = new Map(parents.map(p => [p.id, p] as const));
      for (const reply of replies) {
        const parent = postById.get(reply.post_id);
        const trackId = scopeTrackId(parent?.visibility);
        if (!trackId || !trackById.has(trackId)) continue;
        const lessonId = scopeLessonId(parent!.visibility);
        events.push({
          key: `forum_reply:${reply.id}`, kind: 'forum_reply', at: reply.created_at,
          track_id: trackId, track_title: trackById.get(trackId)!.title,
          lesson_id: lessonId, lesson_title: lessonId ? (lessonById.get(lessonId)?.title ?? '(aula)') : 'Trilha',
          title: 'Respondeu no fórum', detail: excerpt(reply.body), outcome: 'neutral',
          href: `/app/dashboard/forum?post=${encodeURIComponent(reply.post_id)}`,
        });
      }
    }

    // ─── Hábitos ──────────────────────────────────────────────────────────
    // HabitLog não tem lesson_id. Só entram os hábitos que as aulas do escopo
    // referenciam — senão o formador veria hábitos de cursos que não acompanha.
    const scopedHabitIds = new Set(lessons.flatMap(l => l.habit_ids ?? []));
    if (scopedHabitIds.size > 0) {
      const logs = await guard(
        () => habitLogRepository.findByUser(studentId), 'hábitos', warnings, [],
      );
      const relevant = logs.filter(log => scopedHabitIds.has(log.habit_id));
      if (relevant.length > 0) {
        const habits = await guard(() => habitRepository.listAll(), 'lista de hábitos', warnings, []);
        const habitById = new Map(habits.map(h => [h.id, h] as const));
        for (const log of relevant) {
          events.push({
            key: `habit_log:${log.id}`, kind: 'habit_log', at: log.logged_at,
            track_id: null, track_title: 'Hábitos', lesson_id: null, lesson_title: '—',
            title: `Registrou: ${habitById.get(log.habit_id)?.title ?? 'hábito'}`,
            detail: log.log_date, outcome: 'success',
            href: '/app/dashboard/habits',
          });
        }
      }
    }

    const sorted = events
      .filter(e => Boolean(e.at))
      .sort((a, b) => b.at.localeCompare(a.at));

    return { tracks, events: sorted, counts: buildCounts(sorted), warnings };
  }
}

export const studentActivityService = new StudentActivityService();

// ─── Helpers ───────────────────────────────────────────────────────────────

async function guard<T>(
  run: () => Promise<T>,
  sourceLabel: string,
  warnings: string[],
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    warnings.push(`Não foi possível carregar ${sourceLabel}: ${reason}`);
    return fallback;
  }
}

function scopeTrackId(visibility?: CommunityVisibility): string | null {
  if (!visibility || visibility.scope === 'global') return null;
  return visibility.track_id ?? null;
}

function scopeLessonId(visibility?: CommunityVisibility): string | null {
  if (!visibility || visibility.scope !== 'lesson') return null;
  return visibility.lesson_id ?? null;
}

function scoreOutcome(score: number): ActivityOutcome {
  if (score >= 70) return 'success';
  if (score > 0) return 'neutral';
  return 'fail';
}

function reflectionTitle(status: string): string {
  if (status === 'reviewed') return 'Reflexão revisada';
  if (status === 'submitted') return 'Enviou a reflexão';
  return 'Escreveu um rascunho';
}

function formatWatchDetail(seconds?: number): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  // Abaixo de um minuto mostra segundos — arredondar antes viraria "1 min" pra 30s.
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.round(seconds / 60)} min`;
}

function excerpt(text?: string, max = 90): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length === 0) return undefined;
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function buildCounts(events: StudentActivityEvent[]): ActivityCounts {
  const byKind: ActivityCounts['byKind'] = {};
  const days = new Set<string>();

  for (const e of events) {
    byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
    days.add(e.at.slice(0, 10));
  }

  return {
    total: events.length,
    byKind,
    lastAt: events[0]?.at ?? null,
    activeDays: days.size,
  };
}
