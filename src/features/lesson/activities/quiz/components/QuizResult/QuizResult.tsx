'use client';

import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { ShuffledQuiz, MultipleChoiceQuestion } from '@/domain/quiz/types';
import { ScoreResult } from '@/domain/quiz/entities/QuizAttempt';
import { RichContent } from '@/shared/components/RichContent';

interface QuizResultProps {
  shuffled: ShuffledQuiz;
  result: ScoreResult;
  persisted?: boolean;
  onRestart?: () => void;
}

export function QuizResult({ shuffled, result, persisted, onRestart }: QuizResultProps) {
  const { score, earnedPoints, totalPoints, passed } = result;
  const questionMap = new Map(shuffled.questions.map(q => [q.id, q]));

  return (
    <div className="space-y-5">
      <div className={`card ${passed ? 'bg-success/10 border-success' : 'bg-error/10 border-error'} border`}>
        <div className="card-body items-center text-center gap-2">
          {passed ? (
            <CheckCircle2 className="w-14 h-14 text-success" />
          ) : (
            <XCircle className="w-14 h-14 text-error" />
          )}
          <h2 className="text-2xl font-bold text-base-content">
            {passed ? 'Aprovado!' : 'Reprovado'}
          </h2>
          <p className="text-base-content/70">
            {earnedPoints.toFixed(2)} de {totalPoints} pontos ({score.toFixed(1)}%). Mínimo: {shuffled.quiz.passing_score}%.
          </p>
          <p className="text-xs text-base-content/50 mt-1">
            {persisted === true && 'Primeira tentativa — registrada para o formador e no seu caderno.'}
            {persisted === false && 'Retake — pontuação mostrada, não registrada.'}
          </p>
          {onRestart && (
            <button className="btn btn-ghost btn-sm gap-1 mt-2" onClick={onRestart}>
              <RefreshCw className="w-4 h-4" />
              {passed ? 'Refazer (não salva)' : 'Tentar novamente'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-base-content">Revisão</h3>
        {result.detail.map((d, idx) => {
          const q = questionMap.get(d.questionId);
          if (!q) return null;
          const kind = q.kind ?? 'multiple_choice';
          const mc = (kind === 'multiple_choice' || kind === 'true_false') ? (q as MultipleChoiceQuestion) : null;
          const correctOpt = mc && d.correctOptionId ? mc.options.find(o => o.id === d.correctOptionId) : null;
          const selectedOpt = mc && d.selectedOptionId ? mc.options.find(o => o.id === d.selectedOptionId) : null;

          return (
            <div
              key={d.questionId}
              className={`card bg-base-100 border ${d.isCorrect ? 'border-success/50' : d.fraction > 0 ? 'border-warning/50' : 'border-error/50'}`}
            >
              <div className="card-body gap-2 p-4">
                <div className="flex items-start gap-2">
                  {d.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : d.fraction > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-warning/30 text-warning text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      {Math.round(d.fraction * 100)}
                    </span>
                  ) : (
                    <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 font-medium">
                    <span>{idx + 1}. </span>
                    <RichContent markdown={q.text} className="inline" />
                  </div>
                </div>

                {mc && (
                  <div className="ml-7 space-y-2 text-sm">
                    <div>
                      <span className="text-base-content/60">Sua resposta: </span>
                      {selectedOpt ? (
                        <div className={d.isCorrect ? 'text-success' : 'text-error'}>
                          <RichContent markdown={selectedOpt.text} />
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    {!d.isCorrect && correctOpt && (
                      <div>
                        <span className="text-base-content/60">Correta: </span>
                        <div className="text-success">
                          <RichContent markdown={correctOpt.text} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!mc && (
                  <div className="ml-7 text-sm text-base-content/60">
                    {d.isCorrect ? 'Totalmente correto.' : d.fraction > 0 ? `Pontuação parcial: ${Math.round(d.fraction * 100)}%` : 'Incorreto.'}
                  </div>
                )}

                {q.explanation && (
                  <div className="ml-7 mt-2 text-base-content/70 italic">
                    <RichContent markdown={q.explanation} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
