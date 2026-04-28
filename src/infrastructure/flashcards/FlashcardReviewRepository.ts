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
    return this.queryByFilters(
      [
        { field: 'user_id', operator: '==', value: userId },
        { field: 'deck_id', operator: '==', value: deckId },
      ],
      { orderByField: 'reviewed_at', direction: 'desc' },
    );
  }
}

export const flashcardReviewRepository = new FirebaseFlashcardReviewRepository();
