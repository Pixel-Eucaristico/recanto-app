/**
 * Linha do tempo do que o aluno FEZ dentro de um curso.
 *
 * Complementa duas visões parciais que já existiam:
 * - `LessonProgress` diz o estado atual (flags booleanas), não o que aconteceu nem quando.
 * - `StudentWriting` cobre só o que o aluno escreveu.
 *
 * Aqui entram as atividades com resultado: vídeo assistido, quiz, flashcards,
 * caça-palavras, cruzadinha, estudo de caso, hábitos — cada uma com data e desfecho.
 */

export type ActivityKind =
  | 'video_watch'
  | 'quiz'
  | 'flashcards'
  | 'crossword'
  | 'word_search'
  | 'case_study'
  | 'habit_log'
  | 'reflection'
  | 'forum_post'
  | 'forum_reply'
  | 'lesson_completed'
  | 'lesson_unlocked'
  | 'book_started'
  | 'book_finished';

/** Semântica visual do desfecho — mapeada pra cores semânticas do DaisyUI na UI. */
export type ActivityOutcome = 'success' | 'fail' | 'neutral';

export interface StudentActivityEvent {
  /** Chave estável de lista: `${kind}:${id}`. */
  key: string;
  kind: ActivityKind;
  /** Quando aconteceu (ISO). */
  at: string;
  track_id: string | null;
  track_title: string;
  lesson_id: string | null;
  lesson_title: string;
  /** Rótulo principal, já em pt-BR. */
  title: string;
  /** Complemento curto: nota, acertos, duração. */
  detail?: string;
  outcome: ActivityOutcome;
  href?: string;
}

export interface ActivityCounts {
  total: number;
  byKind: Partial<Record<ActivityKind, number>>;
  /** Data do evento mais recente, pra "última atividade". */
  lastAt: string | null;
  /** Dias distintos com pelo menos um evento — noção de constância. */
  activeDays: number;
}

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  video_watch: 'Vídeo',
  quiz: 'Quiz',
  flashcards: 'Flashcards',
  crossword: 'Cruzadinha',
  word_search: 'Caça-palavras',
  case_study: 'Estudo de caso',
  habit_log: 'Hábito',
  reflection: 'Reflexão',
  forum_post: 'Pergunta no fórum',
  forum_reply: 'Resposta no fórum',
  lesson_completed: 'Aula concluída',
  lesson_unlocked: 'Aula liberada',
  book_started: 'Leitura iniciada',
  book_finished: 'Leitura concluída',
};
