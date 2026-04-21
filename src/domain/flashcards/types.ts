export interface Flashcard {
  id: string;
  front: string;
  back: string;
  /** Imagem de fundo da frente (estilo card de Pokémon). */
  image_url?: string;
  /** Imagem de fundo do verso (opcional). */
  image_url_back?: string;
  /** Ordem opcional no deck. */
  order?: number;
}

export interface FlashcardDeck {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  cards: Flashcard[];
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export type FlashcardReviewResult = 'correct' | 'wrong';

export interface FlashcardReview {
  id: string;
  user_id: string;
  deck_id: string;
  lesson_id: string;
  /** { cardId: 'correct' | 'wrong' } na ordem percorrida. */
  answers: Record<string, FlashcardReviewResult>;
  correct_count: number;
  total_count: number;
  /** 0–100. */
  score: number;
  reviewed_at: string;
}
