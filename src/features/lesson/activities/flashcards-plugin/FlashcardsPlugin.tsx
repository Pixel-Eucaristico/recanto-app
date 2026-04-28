'use client';

import { Layers } from 'lucide-react';
import { flashcardDeckRepository } from '@/infrastructure/flashcards/FlashcardDeckRepository';
import { flashcardReviewRepository } from '@/infrastructure/flashcards/FlashcardReviewRepository';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface FlashcardsConfig {
  deck_id?: string;
}

const FlashcardsPlugin: LessonComponent<FlashcardsConfig> = {
  kind: 'flashcards',
  label: 'Flashcards',
  icon: Layers,

  defaultConfig: {},
  defaultRequired: false,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">ID do deck (opcional)</span>
        <input
          className="input input-bordered input-sm"
          value={config.deck_id ?? ''}
          onChange={e => onChange({ config: { deck_id: e.target.value || undefined } as Partial<FlashcardsConfig> })}
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" className="checkbox checkbox-sm" checked={required} onChange={e => onChange({ required: e.target.checked })} />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: () => (
    <div className="alert alert-info text-sm"><span>Veja o deck na aba Flashcards.</span></div>
  ),

  ChecklistRowComponent: () => <div className="text-sm">Flashcards · revisar deck completo</div>,

  async isCompleted(config, ctx) {
    let deckId = config.deck_id;
    if (!deckId) {
      const deck = await flashcardDeckRepository.findByLesson(ctx.lessonId);
      if (!deck) return false;
      deckId = deck.id;
    }
    const reviews = await flashcardReviewRepository.findByUserAndDeck(ctx.userId, deckId);
    return reviews.length > 0;
  },

  summary() { return { label: 'Flashcards', description: 'Revisar deck' }; },
};

export default FlashcardsPlugin;
