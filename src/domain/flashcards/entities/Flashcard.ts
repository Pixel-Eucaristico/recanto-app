import { Flashcard, FlashcardDeck, FlashcardReview, FlashcardReviewResult } from '@/domain/flashcards/types';

export class FlashcardEntity {
  static validateCard(card: Flashcard): string[] {
    const errors: string[] = [];
    // Frente: exige texto OU imagem
    if (!card.front?.trim() && !card.image_url) errors.push('Frente vazia — adicione texto ou imagem.');
    // Verso: exige texto OU imagem
    if (!card.back?.trim() && !card.image_url_back) errors.push('Verso vazio — adicione texto ou imagem.');
    return errors;
  }

  static validateDeck(deck: Pick<FlashcardDeck, 'title' | 'cards'>): string[] {
    const errors: string[] = [];
    if (!deck.title?.trim() || deck.title.trim().length < 3) errors.push('Título deve ter ao menos 3 caracteres.');
    if (!deck.cards || deck.cards.length === 0) errors.push('Deck precisa de ao menos 1 card.');
    deck.cards?.forEach((c, i) => {
      FlashcardEntity.validateCard(c).forEach(e => errors.push(`Card ${i + 1}: ${e}`));
    });
    return errors;
  }

  /**
   * Score fracionário do deck: correct_count / total_count * 100.
   */
  static score(answers: Record<string, FlashcardReviewResult>, totalCards: number): {
    correct: number;
    total: number;
    score: number;
  } {
    const entries = Object.values(answers);
    const correct = entries.filter(v => v === 'correct').length;
    const total = totalCards;
    return {
      correct,
      total,
      score: total > 0 ? Math.round((correct / total) * 10000) / 100 : 0,
    };
  }

  static fromReview(
    params: Pick<FlashcardReview, 'user_id' | 'deck_id' | 'lesson_id' | 'answers'>,
    totalCards: number,
  ): Omit<FlashcardReview, 'id'> {
    const { correct, total, score } = FlashcardEntity.score(params.answers, totalCards);
    return {
      ...params,
      correct_count: correct,
      total_count: total,
      score,
      reviewed_at: new Date().toISOString(),
    };
  }
}
