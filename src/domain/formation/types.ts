import { Role } from '@/shared/types/role';

export type TrackType = 'pre-vocacional' | 'vocacional' | 'etapas' | 'continua';

export type ProgressStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export type UnlockBlocker =
  | 'video'
  | 'time_lock'
  | 'reflection'
  | 'quiz'
  | 'forum'
  | 'habits'
  | 'previous_lesson';

// ─── Entidades de dados ────────────────────────────────────────────────────

export interface FormationTrack {
  id: string;
  title: string;
  description: string;
  type: TrackType;
  required_roles: Role[];
  order: number;
  is_published: boolean;
  module_ids: string[];
  thumbnail_url?: string;
  gallery_images?: string[];
  created_at: string;
  updated_at?: string;
}

export interface FormationModule {
  id: string;
  title: string;
  description: string;
  track_id: string;
  order: number;
  lesson_ids: string[];
  created_at: string;
  updated_at?: string;
}

export interface FormationLesson {
  id: string;
  title: string;
  description: string;
  module_id: string;
  order: number;
  video_url: string;
  video_duration_seconds: number;
  min_watch_percent: number;
  unlock_after_hours: number;
  requires_reflection: boolean;
  requires_quiz: boolean;
  requires_forum_post: boolean;
  /** Flags pra novas atividades — todas opcionais, default false. */
  requires_flashcards?: boolean;
  requires_case_study?: boolean;
  requires_word_search?: boolean;
  requires_crossword?: boolean;
  requires_mind_map?: boolean;
  /** Ordem de exibição das atividades pra o aluno. */
  activity_order?: Array<'quiz' | 'flashcards' | 'case_study' | 'word_search' | 'crossword' | 'mind_map'>;
  apostila_content?: string;
  material_ids: string[];
  quiz_id?: string;
  highlight_quotes: HighlightQuote[];
  /** Imagem ilustrativa da aula (capa). */
  thumbnail_url?: string;
  /** Citações de livros embutidas na aula. Cada uma renderiza o trecho do livro inline. */
  book_citations?: LessonBookCitation[];
  /** Pergunta/mural exibida no topo do tab Fórum quando requires_forum_post é true. */
  forum_prompt?: string;
  /** Conteúdo da atividade prática (markdown). */
  practical_activity?: string;
  /** Quando true, aluno precisa marcar a atividade prática como feita pra concluir a aula. */
  practical_required?: boolean;
  /**
   * Quando true, a prática é permanente — aparece em "Minha Jornada" como hábito
   * recorrente. Default false (atividade única).
   */
  practical_permanent?: boolean;
  /** Limite em dias após desbloqueio pra completar a prática. Vazio = sem limite. */
  practical_deadline_days?: number;
  created_at: string;
  updated_at?: string;
}

export interface HighlightQuote {
  text: string;
  source: string;
}

/**
 * Cita um trecho de livro da biblioteca dentro da aula.
 * Aluno vê o trecho renderizado inline + link pra ler o livro completo.
 * Quando ativa `apply_spoiler`, o livro fica cortado em `until_ref` no leitor.
 */
export interface LessonBookCitation {
  book_id: string;
  /** Ex: '1:7'. Vazio = início do livro. */
  start_ref?: string;
  /** Ex: '3:18'. Vazio = fim do livro. */
  end_ref?: string;
  /** Quando true, BookSpoilerEngine usa essa aula como gate de spoiler. */
  apply_spoiler?: boolean;
  /** Limite máximo liberado se `apply_spoiler=true`. Default: end_ref. */
  until_ref?: string;
  /** Anotação opcional do formador exibida acima do trecho. */
  note?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  module_id: string;
  track_id: string;
  status: ProgressStatus;
  video_watch_percent: number;
  video_watch_seconds: number;
  video_last_position_seconds: number;
  video_completed_at?: string;
  reflection_submitted: boolean;
  quiz_passed: boolean;
  forum_post_made: boolean;
  unlocked_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
}

// ─── Value objects / resultados ────────────────────────────────────────────

export interface UnlockResult {
  isUnlocked: boolean;
  blockedBy: UnlockBlocker[];
  timeRemainingSeconds?: number;
}

export interface TrackWithProgress {
  track: FormationTrack;
  modules: ModuleWithProgress[];
  completedLessons: number;
  totalLessons: number;
}

export interface ModuleWithProgress {
  module: FormationModule;
  lessons: LessonWithProgress[];
  completedCount: number;
}

export interface LessonWithProgress {
  lesson: FormationLesson;
  progress: LessonProgress | null;
  unlockResult: UnlockResult;
}
