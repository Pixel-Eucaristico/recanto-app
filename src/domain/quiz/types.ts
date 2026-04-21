export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  /** Explicação opcional mostrada após resposta. */
  explanation?: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  /** Porcentagem mínima para aprovação (0–100). */
  passing_score: number;
  /** Admin: tentar N vezes. 0 = ilimitado. */
  max_attempts?: number;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  lesson_id: string;
  /** Respostas: { questionId: selectedOptionId }. */
  answers: Record<string, string>;
  /** Ordem embaralhada usada na tentativa (para revisão pelo admin). */
  question_order: string[];
  /** 0–100. */
  score: number;
  passed: boolean;
  attempted_at: string;
}

export interface QuizValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Variante de Quiz usada apenas no client durante a tentativa — já com perguntas e opções embaralhadas.
 */
export interface ShuffledQuiz {
  quiz: Quiz;
  questions: QuizQuestion[];
  order: string[];
}
