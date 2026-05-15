export type CrosswordDirection = 'across' | 'down';

export interface CrosswordClue {
  /** Pergunta mostrada ao aluno. Markdown simples permitido. */
  clue: string;
  /** Resposta normalizada (uppercase, sem acentos, sem espaços). */
  answer: string;
}

export interface CrosswordEntry extends CrosswordClue {
  /** Numeração da entrada (única por grid; entries que compartilham célula inicial podem ter mesmo número). */
  number: number;
  direction: CrosswordDirection;
  /** Posição inicial da resposta. */
  row: number;
  col: number;
}

export interface CrosswordPuzzle {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  /** Tamanho do grid após layout. */
  size: number;
  /** Grid como linhas de string — posições vazias são espaço ' '. */
  grid: string[];
  entries: CrosswordEntry[];
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export interface CrosswordResult {
  id: string;
  user_id: string;
  puzzle_id: string;
  lesson_id: string;
  /** Ids/numbers das entries respondidas corretamente. */
  correct_entries: number[];
  score: number;
  completed_at: string;
}
