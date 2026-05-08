import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { FlashcardReview } from '@/domain/flashcards/types';

export interface IFlashcardReviewRepository {
  findById(id: string): Promise<FlashcardReview | null>;
  findByUserAndDeck(userId: string, deckId: string): Promise<FlashcardReview[]>;
  create(data: Omit<FlashcardReview, 'id'>): Promise<FlashcardReview>;
}

export class FirebaseFlashcardReviewRepository
  extends BaseRepository<FlashcardReview>
  implements IFlashcardReviewRepository
{
  constructor() {
    super('flashcard_reviews');
  }

  async findById(id: string): Promise<FlashcardReview | null> {
    return this.get(id);
  }

  async findByUserAndDeck(userId: string, deckId: string): Promise<FlashcardReview[]> {
    // Query sem orderBy pra evitar dependência de index composto. Sort client-side.
    const all = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'deck_id', operator: '==', value: deckId },
    ]);
    return all.sort((a, b) => b.reviewed_at.localeCompare(a.reviewed_at));
  }
}

export const flashcardReviewRepository = new FirebaseFlashcardReviewRepository();
