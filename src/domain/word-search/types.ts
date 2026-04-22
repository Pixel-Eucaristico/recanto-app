export type WordDirection =
  | 'horizontal'
  | 'horizontal-reverse'
  | 'vertical'
  | 'vertical-reverse'
  | 'diagonal-down'
  | 'diagonal-down-reverse'
  | 'diagonal-up'
  | 'diagonal-up-reverse';

export interface WordPlacement {
  word: string;
  row: number;
  col: number;
  direction: WordDirection;
}

export interface WordSearchPuzzle {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  /** Tamanho do grid (N x N). */
  size: number;
  /** Letras do grid — cada elemento é uma linha (string de N caracteres). Firestore não aceita nested array puro. */
  grid: string[];
  /** Posição de cada palavra colocada. */
  placements: WordPlacement[];
  /** Lista de palavras exibidas ao aluno. */
  words: string[];
  /** Pergunta/dica paralela (mesma ordem de `words`). Se item vazio ou ausente, renderiza a palavra. */
  clues?: string[];
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export interface WordSearchResult {
  id: string;
  user_id: string;
  puzzle_id: string;
  lesson_id: string;
  /** Palavras encontradas (normalizadas). */
  found: string[];
  /** 0–100. */
  score: number;
  completed_at: string;
}
