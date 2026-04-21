export type QuestionKind =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'matching'
  | 'sequence'
  | 'classify';

export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
}

interface BaseQuestion {
  id: string;
  text: string;
  /** Tipo da pergunta — default 'multiple_choice' para retrocompatibilidade. */
  kind?: QuestionKind;
  /** Explicação opcional mostrada após resposta. */
  explanation?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  kind?: 'multiple_choice' | 'true_false';
  options: QuizOption[];
}

export interface FillBlankSlot {
  /** Respostas aceitas para essa lacuna, comparadas com trim + lowercase. */
  accepted: string[];
}

export interface FillBlankQuestion extends BaseQuestion {
  kind: 'fill_blank';
  /** Template com `__` marcando cada lacuna. */
  template: string;
  /** Lacunas na ordem em que aparecem no template. Firestore não aceita array aninhado puro. */
  blanks: FillBlankSlot[];
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}
export interface MatchingQuestion extends BaseQuestion {
  kind: 'matching';
  pairs: MatchingPair[];
}

export interface SequenceItem {
  id: string;
  text: string;
}
export interface SequenceQuestion extends BaseQuestion {
  kind: 'sequence';
  /** Ordem CORRETA. Player embaralha para o aluno reordenar. */
  items: SequenceItem[];
}

export interface ClassifyBucket {
  id: string;
  label: string;
}
export interface ClassifyCard {
  id: string;
  text: string;
  bucket_id: string;
}
export interface ClassifyQuestion extends BaseQuestion {
  kind: 'classify';
  buckets: ClassifyBucket[];
  cards: ClassifyCard[];
}

export type QuizQuestion =
  | MultipleChoiceQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | SequenceQuestion
  | ClassifyQuestion;

/**
 * Resposta do aluno — shape depende do kind. Armazenada em quiz_attempts.answers[questionId].
 * - multiple_choice / true_false: string (optionId)
 * - fill_blank: string[] (uma por lacuna, na ordem)
 * - matching: Record<leftPairId, rightPairId>
 * - sequence: string[] (ids reordenados)
 * - classify: Record<cardId, bucketId>
 */
export type QuestionAnswer = string | string[] | Record<string, string>;

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
  /** Respostas: { questionId: QuestionAnswer }. Tipo depende do kind da questão. */
  answers: Record<string, QuestionAnswer>;
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
