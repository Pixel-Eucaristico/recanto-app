'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Send } from 'lucide-react';
import {
  ShuffledQuiz,
  QuizQuestion,
  QuestionAnswer,
  MultipleChoiceQuestion,
  FillBlankQuestion,
  MatchingQuestion,
  SequenceQuestion,
  ClassifyQuestion,
} from '@/domain/quiz/types';
import { QuizAttemptEntity } from '@/domain/quiz/entities/QuizAttempt';
import { RichContent } from '@/shared/components/RichContent';
import { FillBlankPlayer } from '../FillBlankQuestion';
import { MatchingPlayer } from '../MatchingQuestion';
import { SequencePlayer } from '../SequenceQuestion';
import { ClassifyPlayer } from '../ClassifyQuestion';

interface QuizPlayerProps {
  shuffled: ShuffledQuiz;
  submitting: boolean;
  onSubmit: (answers: Record<string, QuestionAnswer>) => Promise<unknown>;
}

function emptyAnswer(q: QuizQuestion): QuestionAnswer {
  const kind = q.kind ?? 'multiple_choice';
  if (kind === 'multiple_choice' || kind === 'true_false') return '';
  if (kind === 'fill_blank') return [];
  if (kind === 'matching') return {};
  if (kind === 'sequence') return [];
  if (kind === 'classify') return {};
  return '';
}

export function QuizPlayer({ shuffled, submitting, onSubmit }: QuizPlayerProps) {
  const questions = shuffled.questions;
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [revealed, setRevealed] = useState<boolean>(false);

  const q = questions[index];
  const kind = q?.kind ?? 'multiple_choice';
  const isLast = index === total - 1;

  const currentAnswer = (answers[q.id] ?? emptyAnswer(q)) as QuestionAnswer;

  const scoreForCurrent = useMemo(() => {
    if (!revealed || !q) return null;
    const result = QuizAttemptEntity.score({ questions: [q], passing_score: 100 } as any, { [q.id]: currentAnswer });
    return result.detail[0];
  }, [revealed, q, currentAnswer]);

  function setCurrent(v: QuestionAnswer) {
    setAnswers(prev => ({ ...prev, [q.id]: v }));
  }

  function canVerify(): boolean {
    if (!q) return false;
    if (kind === 'multiple_choice' || kind === 'true_false') return typeof currentAnswer === 'string' && currentAnswer.length > 0;
    if (kind === 'fill_blank') {
      const arr = Array.isArray(currentAnswer) ? currentAnswer : [];
      return arr.some(v => v && v.trim().length > 0);
    }
    if (kind === 'matching') return typeof currentAnswer === 'object' && !Array.isArray(currentAnswer) && Object.keys(currentAnswer).length > 0;
    if (kind === 'sequence') return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    if (kind === 'classify') return typeof currentAnswer === 'object' && !Array.isArray(currentAnswer) && Object.keys(currentAnswer).length > 0;
    return false;
  }

  function verify() {
    setRevealed(true);
  }

  async function next() {
    if (isLast) {
      await onSubmit(answers);
      return;
    }
    setIndex(i => i + 1);
    setRevealed(false);
  }

  if (!q) return null;

  const progressPct = ((index + (revealed ? 1 : 0)) / total) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-base-content">{shuffled.quiz.title}</h2>
          {shuffled.quiz.description && (
            <div className="mt-1"><RichContent markdown={shuffled.quiz.description} /></div>
          )}
        </div>
        <span className="badge badge-ghost flex-shrink-0">
          {index + 1} / {total} · {kindLabel(kind)}
        </span>
      </div>

      <progress className="progress progress-primary w-full" value={progressPct} max={100} />

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <div className="flex items-start gap-2">
            <span className="badge badge-primary badge-sm mt-1">{index + 1}</span>
            <div className="flex-1 font-medium"><RichContent markdown={q.text} /></div>
          </div>

          {renderPlayer(q, currentAnswer, setCurrent, revealed)}

          {revealed && scoreForCurrent && (
            <div className={`alert ${scoreForCurrent.isCorrect ? 'alert-success' : 'alert-error'} text-sm items-start`}>
              {scoreForCurrent.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <strong>
                  {scoreForCurrent.isCorrect ? 'Correto!' : `Parcial: ${Math.round(scoreForCurrent.fraction * 100)}%`}
                </strong>
                {q.explanation && <div className="mt-1"><RichContent markdown={q.explanation} /></div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        {!revealed ? (
          <button className="btn btn-primary gap-1" onClick={verify} disabled={!canVerify()}>
            Verificar resposta
          </button>
        ) : (
          <button className="btn btn-primary gap-1" onClick={next} disabled={submitting}>
            {isLast ? (
              <>
                <Send className="w-4 h-4" />
                {submitting ? 'Finalizando...' : 'Ver resultado'}
              </>
            ) : (
              <>
                Próxima
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function renderPlayer(
  q: QuizQuestion,
  answer: QuestionAnswer,
  setAnswer: (v: QuestionAnswer) => void,
  revealed: boolean,
) {
  const kind = q.kind ?? 'multiple_choice';

  if (kind === 'multiple_choice' || kind === 'true_false') {
    const mc = q as MultipleChoiceQuestion;
    const selected = typeof answer === 'string' ? answer : '';
    const correct = mc.options.find(o => o.is_correct);
    return (
      <div className="space-y-2">
        {mc.options.map(opt => {
          const picked = selected === opt.id;
          let cls = 'border-base-300 hover:border-primary/50';
          if (revealed) {
            if (opt.id === correct?.id) cls = 'border-success bg-success/10';
            else if (opt.id === selected) cls = 'border-error bg-error/10';
            else cls = 'border-base-300 opacity-60';
          } else if (picked) {
            cls = 'border-primary bg-primary/10';
          }
          return (
            <label
              key={opt.id}
              className={`flex items-start gap-2 p-3 rounded-lg border ${revealed ? 'cursor-default' : 'cursor-pointer'} ${cls}`}
            >
              <input
                type="radio"
                className="radio radio-primary radio-sm mt-0.5"
                name={`q-${q.id}`}
                checked={picked}
                disabled={revealed}
                onChange={() => setAnswer(opt.id)}
              />
              <div className="flex-1"><RichContent markdown={opt.text} /></div>
            </label>
          );
        })}
      </div>
    );
  }

  if (kind === 'fill_blank') {
    const fb = q as FillBlankQuestion;
    return (
      <FillBlankPlayer
        question={fb}
        value={Array.isArray(answer) ? (answer as string[]) : []}
        onChange={setAnswer}
        disabled={revealed}
        feedback={revealed ? { correctBlanks: fb.blanks, isCorrect: false } : undefined}
      />
    );
  }

  if (kind === 'matching') {
    const m = q as MatchingQuestion;
    return (
      <MatchingPlayer
        question={m}
        value={typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : {}}
        onChange={setAnswer}
        disabled={revealed}
        feedback={revealed}
      />
    );
  }

  if (kind === 'sequence') {
    const s = q as SequenceQuestion;
    return (
      <SequencePlayer
        question={s}
        value={Array.isArray(answer) ? (answer as string[]) : []}
        onChange={setAnswer}
        disabled={revealed}
        feedback={revealed}
      />
    );
  }

  if (kind === 'classify') {
    const c = q as ClassifyQuestion;
    return (
      <ClassifyPlayer
        question={c}
        value={typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : {}}
        onChange={setAnswer}
        disabled={revealed}
        feedback={revealed}
      />
    );
  }

  return null;
}

function kindLabel(kind: string): string {
  switch (kind) {
    case 'multiple_choice': return 'Múltipla escolha';
    case 'true_false': return 'V/F';
    case 'fill_blank': return 'Lacunas';
    case 'matching': return 'Relacionar';
    case 'sequence': return 'Ordenar';
    case 'classify': return 'Classificar';
    default: return kind;
  }
}
