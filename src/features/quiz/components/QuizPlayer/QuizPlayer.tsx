'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Send } from 'lucide-react';
import { ShuffledQuiz } from '@/domain/quiz/types';
import { RichContent } from '@/shared/components/RichContent';

interface QuizPlayerProps {
  shuffled: ShuffledQuiz;
  submitting: boolean;
  onSubmit: (answers: Record<string, string>) => Promise<unknown>;
}

type Feedback = { correctOptionId: string; selectedOptionId: string; isCorrect: boolean };

export function QuizPlayer({ shuffled, submitting, onSubmit }: QuizPlayerProps) {
  const questions = shuffled.questions;
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = questions[index];
  const isLast = index === total - 1;
  const correct = useMemo(() => q?.options.find(o => o.is_correct), [q]);

  function handleVerify() {
    if (!q || !selected || !correct) return;
    const isCorrect = selected === correct.id;
    setFeedback({ correctOptionId: correct.id, selectedOptionId: selected, isCorrect });
    setAnswers(prev => ({ ...prev, [q.id]: selected }));
  }

  async function handleNext() {
    if (isLast) {
      // finalizar — inclui respostas anteriores + atual
      const finalAnswers = { ...answers };
      if (selected && q) finalAnswers[q.id] = selected;
      await onSubmit(finalAnswers);
      return;
    }
    setIndex(idx => idx + 1);
    setSelected(null);
    setFeedback(null);
  }

  if (!q) return null;

  const progressPct = ((index + (feedback ? 1 : 0)) / total) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-base-content">{shuffled.quiz.title}</h2>
          {shuffled.quiz.description && (
            <div className="mt-1"><RichContent markdown={shuffled.quiz.description} /></div>
          )}
        </div>
        <span className="badge badge-ghost flex-shrink-0">Pergunta {index + 1} / {total}</span>
      </div>

      <progress className="progress progress-primary w-full" value={progressPct} max={100} />

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <div className="flex items-start gap-2">
            <span className="badge badge-primary badge-sm mt-1">{index + 1}</span>
            <div className="flex-1 font-medium"><RichContent markdown={q.text} /></div>
          </div>

          <div className="space-y-2">
            {q.options.map(opt => {
              const picked = selected === opt.id;
              let stateClass = 'border-base-300 hover:border-primary/50';
              let icon = null;
              if (feedback) {
                if (opt.id === feedback.correctOptionId) {
                  stateClass = 'border-success bg-success/10';
                  icon = <CheckCircle2 className="w-4 h-4 text-success" />;
                } else if (opt.id === feedback.selectedOptionId) {
                  stateClass = 'border-error bg-error/10';
                  icon = <XCircle className="w-4 h-4 text-error" />;
                } else {
                  stateClass = 'border-base-300 opacity-60';
                }
              } else if (picked) {
                stateClass = 'border-primary bg-primary/10';
              }
              return (
                <label
                  key={opt.id}
                  className={`flex items-start justify-between gap-2 p-3 rounded-lg border transition-colors ${
                    feedback ? 'cursor-default' : 'cursor-pointer'
                  } ${stateClass}`}
                >
                  <div className="flex items-start gap-2 flex-1">
                    <input
                      type="radio"
                      className="radio radio-primary radio-sm mt-0.5 flex-shrink-0"
                      name={`q-${q.id}`}
                      checked={picked}
                      disabled={!!feedback}
                      onChange={() => setSelected(opt.id)}
                    />
                    <div className="flex-1"><RichContent markdown={opt.text} /></div>
                  </div>
                  {icon && <div className="flex-shrink-0">{icon}</div>}
                </label>
              );
            })}
          </div>

          {feedback && (
            <div className={`alert ${feedback.isCorrect ? 'alert-success' : 'alert-error'} text-sm items-start`}>
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <strong>{feedback.isCorrect ? 'Correto!' : 'Incorreto.'}</strong>
                {q.explanation && <div className="mt-1"><RichContent markdown={q.explanation} /></div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        {!feedback ? (
          <button
            className="btn btn-primary gap-1"
            onClick={handleVerify}
            disabled={!selected}
          >
            Verificar resposta
          </button>
        ) : (
          <button
            className="btn btn-primary gap-1"
            onClick={handleNext}
            disabled={submitting}
          >
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
