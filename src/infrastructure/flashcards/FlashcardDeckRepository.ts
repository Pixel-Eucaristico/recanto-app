import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { FlashcardDeck } from '@/domain/flashcards/types';

export interface IFlashcardDeckRepository {
  findById(id: string): Promise<FlashcardDeck | null>;
  findByLesson(lessonId: string): Promise<FlashcardDeck | null>;
  create(data: Omit<FlashcardDeck, 'id'>): Promise<FlashcardDeck>;
  update(id: string, data: Partial<Omit<FlashcardDeck, 'id'>>): Promise<FlashcardDeck | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseFlashcardDeckRepository
  extends BaseRepository<FlashcardDeck>
  implements IFlashcardDeckRepository
{
  constructor() {
    super('flashcard_decks');
  }

  async findById(id: string): Promise<FlashcardDeck | null> {
    return this.get(id);
  }

  async findByLesson(lessonId: string): Promise<FlashcardDeck | null> {
    const results = await this.queryByFilters([
      { field: 'lesson_id', operator: '==', value: lessonId },
    ]);
    return results[0] ?? null;
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const flashcardDeckRepository = new FirebaseFlashcardDeckRepository();
