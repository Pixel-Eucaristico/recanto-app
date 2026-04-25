'use client';

import { useEffect, useState, ReactNode } from 'react';
import { BookOpen, PenLine, Award, MessageSquare, Quote } from 'lucide-react';
import { FormationLesson } from '@/domain/formation/types';
import { RichContent } from '@/shared/components/RichContent';
import { useReflection } from '@/features/spiritual-notebook';
import { ReflectionEditor } from '@/features/spiritual-notebook/components/ReflectionEditor';
import { QuizPlayer, QuizResult, useQuiz } from '@/features/lesson/activities/quiz';
import { ForumThread } from '@/features/community';

type TabId = 'apostila' | 'reflection' | 'quiz' | 'forum';

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

  const tabs: { id: TabId; label: string; icon: ReactNode; enabled: boolean }[] = [
    { id: 'apostila', label: 'Apostila', icon: <BookOpen className="w-4 h-4" />, enabled: !!lesson.apostila_content || lesson.highlight_quotes.length > 0 },
    { id: 'reflection', label: 'Caderno', icon: <PenLine className="w-4 h-4" />, enabled: lesson.requires_reflection },
    { id: 'quiz', label: 'Quiz', icon: <Award className="w-4 h-4" />, enabled: lesson.requires_quiz && !!lesson.quiz_id },
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
        {tab === 'apostila' && <ApostilaTab lesson={lesson} />}
        {tab === 'reflection' && (
          <ReflectionTab
            lesson={lesson}
            track={track}
            module={module}
            onSaved={onProgress}
          />
        )}
        {tab === 'quiz' && lesson.quiz_id && (
          <QuizTab lessonId={lesson.id} quizId={lesson.quiz_id} userId={userId} onPassed={onProgress} />
        )}
        {tab === 'forum' && (
          <ForumThread
            scope={{ scope: 'lesson', track_id: track.id, lesson_id: lesson.id }}
            userId={userId}
            userName={userName}
            autoOpenComposer={forumAutoOpen > 0 ? 'forum' : undefined}
            autoOpenKey={forumAutoOpen}
          />
        )}
      </div>
    </div>
  );
}

function ApostilaTab({ lesson }: { lesson: FormationLesson }) {
  if (!lesson.apostila_content && lesson.highlight_quotes.length === 0) {
    return <p className="text-sm text-base-content/60">Sem apostila pra essa aula.</p>;
  }
  return (
    <div className="space-y-4">
      {lesson.apostila_content && <RichContent markdown={lesson.apostila_content} />}
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
