'use client';

import { useEffect, useState, ReactNode } from 'react';
import { BookOpen, PenLine, Award, MessageSquare, Quote, Activity, Megaphone, Layers, Search, Grid3x3, Network } from 'lucide-react';
import { FormationLesson } from '@/domain/formation/types';
import { RichContent } from '@/shared/components/RichContent';
import { useReflection } from '@/features/spiritual-notebook';
import { ReflectionEditor } from '@/features/spiritual-notebook/components/ReflectionEditor';
import { QuizPlayer, QuizResult, useQuiz } from '@/features/lesson/activities/quiz';
import { ForumThread } from '@/features/community';
import { LessonBookExcerpt } from '@/features/lesson/components/LessonBookExcerpt';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { useFlashcardDeck, FlashcardDeckPlayer } from '@/features/lesson/activities/flashcards';
import { useCaseStudy, CaseStudyPlayer, CaseStudySummary } from '@/features/lesson/activities/case-studies';
import { useWordSearch, WordSearchGrid } from '@/features/lesson/activities/word-search';
import { useCrossword, CrosswordGrid } from '@/features/lesson/activities/crossword';
import { useMindMap, MindMapCanvas } from '@/features/lesson/activities/mind-maps';

type TabId = 'apostila' | 'reflection' | 'quiz' | 'forum' | 'practical'
  | 'flashcards' | 'case_study' | 'word_search' | 'crossword' | 'mind_map';

export interface LessonTabsHandle {
  /** Bump ou valor diferente pra forçar abrir fórum + composer. */
  openForumComposerKey?: number;
}

interface LessonTabsProps {
  lesson: FormationLesson;
  track: { id: string; title: string };
  module: { id: string; title: string };
  userId: string;
  userName: string;
  onProgress?: () => void;
  /** Se mudar, pula pro fórum e pede abrir composer. */
  openForumComposerKey?: number;
}

export function LessonTabs({ lesson, track, module, userId, userName, onProgress, openForumComposerKey }: LessonTabsProps) {
  const [tab, setTab] = useState<TabId>('apostila');
  const [forumAutoOpen, setForumAutoOpen] = useState(0);

  useEffect(() => {
    if (openForumComposerKey !== undefined && openForumComposerKey > 0) {
      setTab('forum');
      setForumAutoOpen(k => k + 1);
    }
  }, [openForumComposerKey]);

  // Plugin instances também ativam a aba (paralelo aos flags requires_*)
  const hasPluginKind = (kind: string) => (lesson.components ?? []).some(c => c.kind === kind);

  const tabs: { id: TabId; label: string; icon: ReactNode; enabled: boolean }[] = [
    { id: 'apostila', label: 'Apostila', icon: <BookOpen className="w-4 h-4" />, enabled: !!lesson.apostila_content || lesson.highlight_quotes.length > 0 || (lesson.book_citations?.length ?? 0) > 0 },
    { id: 'reflection', label: 'Caderno', icon: <PenLine className="w-4 h-4" />, enabled: lesson.requires_reflection || hasPluginKind('reflection') },
    { id: 'quiz', label: 'Quiz', icon: <Award className="w-4 h-4" />, enabled: !!lesson.requires_quiz || hasPluginKind('quiz') },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" />, enabled: !!lesson.requires_flashcards || hasPluginKind('flashcards') },
    { id: 'case_study', label: 'Caso', icon: <Network className="w-4 h-4" />, enabled: !!lesson.requires_case_study || hasPluginKind('case_study') },
    { id: 'word_search', label: 'Caça-palavras', icon: <Search className="w-4 h-4" />, enabled: !!lesson.requires_word_search || hasPluginKind('word_search') },
    { id: 'crossword', label: 'Cruzadas', icon: <Grid3x3 className="w-4 h-4" />, enabled: !!lesson.requires_crossword || hasPluginKind('crossword') },
    { id: 'mind_map', label: 'Mapa mental', icon: <Network className="w-4 h-4" />, enabled: !!lesson.requires_mind_map || hasPluginKind('mind_map') },
    { id: 'practical', label: 'Prática', icon: <Activity className="w-4 h-4" />, enabled: !!lesson.practical_activity },
    { id: 'forum', label: 'Fórum', icon: <MessageSquare className="w-4 h-4" />, enabled: true },
  ];

  const visibleTabs = tabs.filter(t => t.enabled);

  return (
    <div className="space-y-3">
      <div role="tablist" className="tabs tabs-boxed bg-base-100 border border-base-300 w-fit flex-wrap">
        {visibleTabs.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            className={`tab gap-1 ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-base-100 border border-base-300 rounded-2xl p-4">
        {tab === 'apostila' && <ApostilaTab lesson={lesson} userId={userId} />}
        {tab === 'reflection' && (
          <ReflectionTab
            lesson={lesson}
            track={track}
            module={module}
            onSaved={onProgress}
          />
        )}
        {tab === 'quiz' && (
          <QuizTab lessonId={lesson.id} quizId={lesson.quiz_id ?? ''} userId={userId} onPassed={onProgress} />
        )}
        {tab === 'flashcards' && (
          <FlashcardsTab lessonId={lesson.id} onCompleted={onProgress} />
        )}
        {tab === 'case_study' && (
          <CaseStudyTab lessonId={lesson.id} onCompleted={onProgress} />
        )}
        {tab === 'word_search' && (
          <WordSearchTab lessonId={lesson.id} onCompleted={onProgress} />
        )}
        {tab === 'crossword' && (
          <CrosswordTab lessonId={lesson.id} onCompleted={onProgress} />
        )}
        {tab === 'mind_map' && (
          <MindMapTab lessonId={lesson.id} onCompleted={onProgress} />
        )}
        {tab === 'practical' && lesson.practical_activity && (
          <PracticalTab lesson={lesson} />
        )}
        {tab === 'forum' && (
          <div className="space-y-3">
            {lesson.forum_prompt && (
              <div className="alert bg-primary/10 border border-primary/30 text-base-content text-sm gap-2 items-start">
                <Megaphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-xs mb-1 text-primary">Mural do formador</p>
                  <RichContent markdown={lesson.forum_prompt} className="text-sm" />
                </div>
              </div>
            )}
            <ForumThread
              scope={{ scope: 'lesson', track_id: track.id, lesson_id: lesson.id }}
              userId={userId}
              userName={userName}
              autoOpenComposer={forumAutoOpen > 0 ? 'forum' : undefined}
              autoOpenKey={forumAutoOpen}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ApostilaTab({ lesson, userId }: { lesson: FormationLesson; userId: string }) {
  const citations = lesson.book_citations ?? [];

  // Auto-unlock: when student views a lesson with book citations,
  // create reading_progress entry to grant library access to those books.
  useEffect(() => {
    if (citations.length === 0 || !userId) return;
    citations.forEach(c => {
      if (!c.book_id) return;
      bookReadingProgressRepository.get(userId, c.book_id).then(existing => {
        if (existing) return; // Already unlocked, don't overwrite progress
        // Bootstrap empty progress entry — counts as "unlocked via course"
        bookReadingProgressRepository.upsert({
          user_id: userId,
          book_id: c.book_id,
          last_chapter_order: 0,
          percent: 0,
          updated_at: new Date().toISOString(),
        }).catch(err => console.warn('[lesson] failed to unlock book', c.book_id, err));
      });
    });
  }, [citations, userId]);

  if (!lesson.apostila_content && lesson.highlight_quotes.length === 0 && citations.length === 0) {
    return <p className="text-sm text-base-content/60">Sem apostila pra essa aula.</p>;
  }

  return (
    <div className="space-y-4">
      {lesson.apostila_content && <RichContent markdown={lesson.apostila_content} />}

      {/* Book excerpts embedded inline. Dedup por (book_id+start_ref+end_ref)
          pra evitar render duplicado se admin adicionou citation idêntica 2x. */}
      {citations.length > 0 && (
        <div className="space-y-3">
          {Array.from(
            new Map(citations.map(c => [`${c.book_id}|${c.start_ref ?? ''}|${c.end_ref ?? ''}`, c])).values(),
          ).map((c, i) => (
            <LessonBookExcerpt key={`${c.book_id}_${i}`} citation={c} />
          ))}
        </div>
      )}

      {lesson.highlight_quotes.length > 0 && (
        <div className="space-y-2 border-l-4 border-primary pl-4">
          <h4 className="text-sm font-semibold text-primary flex items-center gap-1">
            <Quote className="w-4 h-4" /> Citações
          </h4>
          {lesson.highlight_quotes.map((q, i) => (
            <figure key={i} className="text-sm italic">
              <blockquote>&ldquo;{q.text}&rdquo;</blockquote>
              <figcaption className="text-xs text-base-content/60 not-italic mt-1">— {q.source}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function ReflectionTab({
  lesson,
  track,
  module,
  onSaved,
}: {
  lesson: FormationLesson;
  track: { id: string; title: string };
  module: { id: string; title: string };
  onSaved?: () => void;
}) {
  const { reflection, saving, error, saveDraft, submit } = useReflection({
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    moduleTitle: module.title,
    trackId: track.id,
    trackTitle: track.title,
  });

  return (
    <ReflectionEditor
      reflection={reflection}
      saving={saving}
      error={error}
      onSaveDraft={async content => {
        await saveDraft(content);
        onSaved?.();
      }}
      onSubmit={async () => {
        await submit();
        onSaved?.();
      }}
    />
  );
}

function QuizTab({ lessonId, quizId: _quizId, userId: _userId, onPassed }: { lessonId: string; quizId: string; userId: string; onPassed?: () => void }) {
  const { shuffled, result, loading, error, submitting, submit, restart } = useQuiz({ lessonId });

  if (loading) return <div className="text-sm text-base-content/60">Carregando quiz...</div>;
  if (error) return <div className="alert alert-error text-sm"><span>{error}</span></div>;
  if (!shuffled) return <div className="text-sm text-base-content/60">Quiz não configurado.</div>;

  if (result) {
    return (
      <QuizResult
        shuffled={shuffled}
        result={result.scoreDetail}
        persisted={result.persisted}
        onRestart={restart}
      />
    );
  }

  return (
    <QuizPlayer
      shuffled={shuffled}
      submitting={submitting}
      onSubmit={async answers => {
        const r = await submit(answers);
        if (r?.attempt.passed) onPassed?.();
      }}
    />
  );
}

function PracticalTab({ lesson }: { lesson: FormationLesson }) {
  if (!lesson.practical_activity) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Activity className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-sm">Atividade prática</h4>
        {lesson.practical_required && (
          <span className="badge badge-warning badge-xs">obrigatória</span>
        )}
        {lesson.practical_permanent && (
          <span className="badge badge-info badge-xs">permanente</span>
        )}
        {lesson.practical_deadline_days && lesson.practical_deadline_days > 0 && (
          <span className="badge badge-outline badge-xs">prazo: {lesson.practical_deadline_days} dias</span>
        )}
      </div>
      <RichContent markdown={lesson.practical_activity} />
      {lesson.practical_permanent && (
        <div className="alert alert-info text-xs gap-2">
          <Activity className="w-4 h-4 shrink-0" />
          <span>
            Esta prática é permanente — vai aparecer em &quot;Minha Jornada&quot; como tarefa diária após você desbloquear esta aula.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Activity tab wrappers ──────────────────────────────────────────────────

function NotConfigured({ label }: { label: string }) {
  return (
    <div className="alert alert-warning text-sm">
      <span>Esta aula tem {label} marcado como obrigatório, mas o formador ainda não configurou.</span>
    </div>
  );
}

function FlashcardsTab({ lessonId, onCompleted }: { lessonId: string; onCompleted?: () => void }) {
  const fc = useFlashcardDeck({ lessonId });
  useEffect(() => {
    if (fc.result?.persisted) onCompleted?.();
  }, [fc.result?.persisted]);
  if (fc.loading) return <div className="text-sm text-base-content/60">Carregando flashcards...</div>;
  if (fc.error) return <div className="alert alert-error text-sm"><span>{fc.error}</span></div>;
  if (!fc.deck) return <NotConfigured label="flashcards" />;
  return (
    <FlashcardDeckPlayer
      deck={fc.deck}
      submitting={fc.submitting}
      result={fc.result}
      onSubmit={fc.submit}
      onRestart={fc.restart}
    />
  );
}

function CaseStudyTab({ lessonId, onCompleted }: { lessonId: string; onCompleted?: () => void }) {
  const cs = useCaseStudy({ lessonId });
  useEffect(() => {
    if (cs.result?.persisted) onCompleted?.();
  }, [cs.result?.persisted]);
  if (cs.loading) return <div className="text-sm text-base-content/60">Carregando estudo de caso...</div>;
  if (cs.error) return <div className="alert alert-error text-sm"><span>{cs.error}</span></div>;
  if (!cs.caseStudy) return <NotConfigured label="estudo de caso" />;
  if (cs.result && cs.currentNode) {
    return (
      <CaseStudySummary
        caseStudy={cs.caseStudy}
        path={cs.path}
        persisted={cs.result.persisted}
        onRestart={cs.restart}
      />
    );
  }
  if (!cs.currentNode) return <div className="text-sm text-base-content/60">Nó inicial não encontrado.</div>;
  return (
    <CaseStudyPlayer
      caseStudy={cs.caseStudy}
      currentNode={cs.currentNode}
      isEnd={cs.isEnd}
      submitting={cs.submitting}
      onChoose={cs.choose}
      onFinish={cs.finish}
    />
  );
}

function WordSearchTab({ lessonId, onCompleted }: { lessonId: string; onCompleted?: () => void }) {
  const ws = useWordSearch({ lessonId });
  useEffect(() => {
    if (ws.result?.persisted && ws.result.score >= 100) onCompleted?.();
  }, [ws.result?.persisted, ws.result?.score]);
  if (ws.loading) return <div className="text-sm text-base-content/60">Carregando caça-palavras...</div>;
  if (ws.error) return <div className="alert alert-error text-sm"><span>{ws.error}</span></div>;
  if (!ws.puzzle) return <NotConfigured label="caça-palavras" />;
  return (
    <WordSearchGrid
      puzzle={ws.puzzle}
      found={ws.found}
      onFound={ws.markFound}
      onSubmit={ws.submit}
      onRestart={ws.restart}
      submitting={ws.submitting}
      result={ws.result}
    />
  );
}

function CrosswordTab({ lessonId, onCompleted }: { lessonId: string; onCompleted?: () => void }) {
  const cw = useCrossword({ lessonId });
  useEffect(() => {
    if (cw.result?.persisted && cw.result.correct === cw.result.total) onCompleted?.();
  }, [cw.result?.persisted, cw.result?.correct, cw.result?.total]);
  if (cw.loading) return <div className="text-sm text-base-content/60">Carregando palavras cruzadas...</div>;
  if (cw.error) return <div className="alert alert-error text-sm"><span>{cw.error}</span></div>;
  if (!cw.puzzle) return <NotConfigured label="palavras cruzadas" />;
  return (
    <CrosswordGrid
      puzzle={cw.puzzle}
      onSubmit={cw.submit}
      onRestart={cw.reload}
      submitting={cw.submitting}
      result={cw.result}
    />
  );
}

function MindMapTab({ lessonId, onCompleted }: { lessonId: string; onCompleted?: () => void }) {
  const mm = useMindMap({ lessonId });
  if (mm.loading) return <div className="text-sm text-base-content/60">Carregando mapa mental...</div>;
  if (mm.error) return <div className="alert alert-error text-sm"><span>{mm.error}</span></div>;
  if (!mm.template || !mm.state) return <NotConfigured label="mapa mental" />;
  return (
    <MindMapCanvas
      state={mm.state}
      onChange={mm.setState}
      onSave={async () => {
        if (!mm.state) return;
        await mm.save(mm.state);
        onCompleted?.();
      }}
      saving={mm.saving}
    />
  );
}
