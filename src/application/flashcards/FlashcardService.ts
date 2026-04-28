import { flashcardDeckRepository, IFlashcardDeckRepository } from '@/infrastructure/flashcards/FlashcardDeckRepository';
import { flashcardReviewRepository, IFlashcardReviewRepository } from '@/infrastructure/flashcards/FlashcardReviewRepository';
import { FlashcardEntity } from '@/domain/flashcards/entities/Flashcard';
import { FlashcardDeck, FlashcardReview, FlashcardReviewResult } from '@/domain/flashcards/types';

export interface SubmitReviewInput {
  userId: string;
  deckId: string;
  answers: Record<string, FlashcardReviewResult>;
}

export interface SubmitReviewResult {
  review: FlashcardReview;
  correctCount: number;
  totalCount: number;
  score: number;
  persisted: boolean;
}

export class FlashcardService {
  constructor(
    private readonly deckRepo: IFlashcardDeckRepository = flashcardDeckRepository,
    private readonly reviewRepo: IFlashcardReviewRepository = flashcardReviewRepository,
  ) {}

  async getDeckByLesson(lessonId: string): Promise<FlashcardDeck | null> {
    return this.deckRepo.findByLesson(lessonId);
  }

  async getDeck(id: string): Promise<FlashcardDeck | null> {
    return this.deckRepo.findById(id);
  }

  /**
   * 1ª review persiste; retakes recalculam score mas não gravam.
   */
  async submitReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
    const deck = await this.deckRepo.findById(input.deckId);
    if (!deck) throw new Error('Deck não encontrado.');

    const total = deck.cards.length;
    const existing = await this.reviewRepo.findByUserAndDeck(input.userId, input.deckId);
    const score = FlashcardEntity.score(input.answers, total);

    if (existing.length > 0) {
      return {
        review: existing[0],
        correctCount: score.correct,
        totalCount: score.total,
        score: score.score,
        persisted: false,
      };
    }

    const data = FlashcardEntity.fromReview(
      {
        user_id: input.userId,
        deck_id: input.deckId,
        lesson_id: deck.lesson_id,
        answers: input.answers,
      },
      total,
    );
    const review = await this.reviewRepo.create(data);
    return {
      review,
      correctCount: score.correct,
      totalCount: score.total,
      score: score.score,
      persisted: true,
    };
  }

  async hasReviewed(userId: string, deckId: string): Promise<boolean> {
    const existing = await this.reviewRepo.findByUserAndDeck(userId, deckId);
    return existing.length > 0;
  }

  async save(deck: FlashcardDeck | (Omit<FlashcardDeck, 'id'> & { id?: string })): Promise<FlashcardDeck> {
    const errors = FlashcardEntity.validateDeck(deck);
    if (errors.length > 0) throw new Error(errors.join(' '));
    if ('id' in deck && deck.id) {
      const { id, ...rest } = deck as FlashcardDeck;
      const updated = await this.deckRepo.update(id, rest);
      if (!updated) throw new Error('Falha ao atualizar deck.');
      return updated;
    }
    return this.deckRepo.create(deck as Omit<FlashcardDeck, 'id'>);
  }

  async remove(id: string): Promise<void> {
    return this.deckRepo.remove(id);
  }
}

export const flashcardService = new FlashcardService();
