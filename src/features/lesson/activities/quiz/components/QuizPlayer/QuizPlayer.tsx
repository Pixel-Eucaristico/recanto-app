'use client';

import { CheckCircle2, XCircle, ChevronRight, Send } from 'lucide-react';
import type { ShuffledQuiz, QuestionAnswer } from '@/domain/quiz/types';
import { RichContent } from '@/shared/components/RichContent';
import { QuizQuestionPlayer } from './components/QuizQuestionPlayer';
import { kindLabel } from './utils/quizPlayerUtils';
import { useQuizPlayer } from './hooks/useQuizPlayer';

interface QuizPlayerProps {
  shuffled: ShuffledQuiz;
  submitting: boolean;
  onSubmit: (answers: Record<string, QuestionAnswer>) => Promise<unknown>;
}

export function QuizPlayer({ shuffled, submitting, onSubmit }: QuizPlayerProps) {
  const {
    q, kind, isLast, total, index,
    currentAnswer, setCurrent,
    revealed, setRevealed,
    scoreForCurrent, progressPct,
    canVerify, next,
  } = useQuizPlayer(shuffled, onSubmit);

  if (!q) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-base-content">{shuffled.quiz.title}</h2>
          {shuffled.quiz.description && <div className="mt-1"><RichContent markdown={shuffled.quiz.description} /></div>}
        </div>
        <span className="badge badge-ghost flex-shrink-0">{index + 1} / {total} · {kindLabel(kind)}</span>
      </div>

      <progress className="progress progress-primary w-full" value={progressPct} max={100} />

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <div className="flex items-start gap-2">
            <span className="badge badge-primary badge-sm mt-1">{index + 1}</span>
            <div className="flex-1 font-medium"><RichContent markdown={q.text} /></div>
          </div>

          <QuizQuestionPlayer question={q} answer={currentAnswer} revealed={revealed} onChange={setCurrent} />

          {revealed && scoreForCurrent && (
            <div className={`alert ${scoreForCurrent.isCorrect ? 'alert-success' : 'alert-error'} text-sm items-start`}>
              {scoreForCurrent.isCorrect ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
              <div className="flex-1">
                <strong>{scoreForCurrent.isCorrect ? 'Correto!' : `Parcial: ${Math.round(scoreForCurrent.fraction * 100)}%`}</strong>
                {q.explanation && <div className="mt-1"><RichContent markdown={q.explanation} /></div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        {!revealed ? (
          <button className="btn btn-primary gap-1" onClick={() => setRevealed(true)} disabled={!canVerify()}>
            Verificar resposta
          </button>
        ) : (
          <button className="btn btn-primary gap-1" onClick={next} disabled={submitting}>
            {isLast ? (
              <><Send className="w-4 h-4" />{submitting ? 'Finalizando...' : 'Ver resultado'}</>
            ) : (
              <>Próxima<ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
