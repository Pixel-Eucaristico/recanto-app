'use client';

import { useMemo, useState } from 'react';
import { Check, X, ChevronRight, Send, RefreshCw, Sparkles } from 'lucide-react';
import { FlashcardDeck, FlashcardReviewResult } from '@/domain/flashcards/types';
import { RichContent } from '@/shared/components/RichContent';
import { FlashcardView } from '../FlashcardView';

interface FlashcardDeckPlayerProps {
  deck: FlashcardDeck;
  submitting: boolean;
  result: { correct: number; total: number; score: number; persisted: boolean } | null;
  onSubmit: (answers: Record<string, FlashcardReviewResult>) => Promise<unknown>;
  onRestart: () => void;
}

export function FlashcardDeckPlayer({ deck, submitting, result, onSubmit, onRestart }: FlashcardDeckPlayerProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, FlashcardReviewResult>>({});

  const total = deck.cards.length;
  const current = deck.cards[index];
  const isLast = index === total - 1;

  function mark(result: FlashcardReviewResult) {
    const next = { ...answers, [current.id]: result };
    setAnswers(next);
    if (isLast) {
      onSubmit(next);
    } else {
      setIndex(i => i + 1);
    }
  }

  function handleRestart() {
    setAnswers({});
    setIndex(0);
    onRestart();
  }

  const progressPct = (index / total) * 100;

  if (result) {
    return (
      <div className="space-y-4">
        <div className={`card ${result.correct === result.total ? 'bg-success/10 border-success' : 'bg-base-100 border-base-300'} border`}>
          <div className="card-body items-center text-center gap-2">
            <Sparkles className="w-12 h-12 text-primary" />
            <h2 className="text-2xl font-bold text-base-content">Deck completo!</h2>
            <p className="text-base-content/70">
              Acertos: {result.correct} / {result.total} ({result.score.toFixed(1)}%)
            </p>
            <p className="text-xs text-base-content/50">
              {result.persisted
                ? 'Primeira revisão — registrada para o formador e no caderno.'
                : 'Retake — score mostrado, não registrado.'}
            </p>
            <button className="btn btn-ghost btn-sm gap-1" onClick={handleRestart}>
              <RefreshCw className="w-4 h-4" />
              Refazer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-base-content">{deck.title}</h2>
          {deck.description && (
            <div className="text-sm text-base-content/60 mt-0.5"><RichContent markdown={deck.description} /></div>
          )}
        </div>
        <span className="badge badge-ghost">{index + 1} / {total}</span>
      </div>

      <progress className="progress progress-primary w-full" value={progressPct} max={100} />

      <FlashcardView
        front={current.front}
        back={current.back}
        imageUrl={current.image_url}
        imageUrlBack={current.image_url_back}
        resetKey={current.id}
      />

      <div className="flex gap-2 justify-center">
        <button className="btn btn-error gap-1" onClick={() => mark('wrong')} disabled={submitting}>
          <X className="w-4 h-4" />
          Errei
        </button>
        <button className="btn btn-success gap-1" onClick={() => mark('correct')} disabled={submitting}>
          <Check className="w-4 h-4" />
          Acertei
        </button>
      </div>

      {isLast && submitting && (
        <p className="text-center text-sm text-base-content/60">
          <Send className="inline w-4 h-4 mr-1" />
          Finalizando...
        </p>
      )}
    </div>
  );
}
