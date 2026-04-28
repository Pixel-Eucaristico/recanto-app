import type { ComponentType, ReactNode } from 'react';

/**
 * Plugin architecture pra atividades de aula. Cada feature (video, quiz, reflection,
 * flashcards, etc) implementa LessonComponent + se registra no LessonComponentRegistry.
 *
 * Adicionar atividade nova = 1 arquivo de plugin + 1 linha em registerAllPlugins. Sem
 * tocar no core (UnlockRuleEngine, LessonChecklist, LessonProgress).
 *
 * Ver: project_lesson_component_plugin_architecture.md
 */

export interface LessonComponentRuntimeContext {
  userId: string;
  trackId: string;
  moduleId: string;
  lessonId: string;
}

export interface LessonComponentInstance<Config = unknown> {
  /** ID único dentro da aula. */
  id: string;
  /** Tipo do plugin — referência ao registry. */
  kind: string;
  /** Quando true, bloqueia avançar até `isCompleted` retornar true. */
  required: boolean;
  /** Ordem de exibição no checklist/player. */
  order: number;
  /** Config opaca — formato definido pelo plugin. */
  config: Config;
}

export interface VersionEntry {
  id: string;
  created_at: string;
  created_by: string;
  /** Resumo curto pra exibir. */
  label: string;
  /** Conteúdo serializado da versão (pra restaurar). */
  payload: unknown;
}

export interface SessionEvent {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  /** Dados específicos do plugin. */
  data?: Record<string, unknown>;
}

export interface LessonComponentSummary {
  label: string;
  description?: string;
  /** Ícone opcional override. */
  icon?: ReactNode;
}

export interface LessonComponentEditorProps<Config> {
  config: Config;
  required: boolean;
  onChange: (patch: { config?: Partial<Config>; required?: boolean }) => void;
}

export interface LessonComponentPlayerProps<Config> {
  config: Config;
  ctx: LessonComponentRuntimeContext;
  onCompleted?: () => void;
}

export interface LessonComponentChecklistRowProps<Config> {
  config: Config;
  ctx: LessonComponentRuntimeContext;
  onAction?: () => void;
}

export interface LessonComponent<Config = unknown> {
  kind: string;
  label: string;
  icon: ComponentType<{ className?: string }>;

  defaultConfig: Config;
  defaultRequired: boolean;

  EditorComponent: ComponentType<LessonComponentEditorProps<Config>>;
  PlayerComponent: ComponentType<LessonComponentPlayerProps<Config>>;
  ChecklistRowComponent: ComponentType<LessonComponentChecklistRowProps<Config>>;

  isCompleted(config: Config, ctx: LessonComponentRuntimeContext): Promise<boolean>;
  summary(config: Config): LessonComponentSummary;

  /** OPCIONAL: histórico de versões editáveis (reflection, forum_ask, etc). */
  getHistory?(config: Config, ctx: LessonComponentRuntimeContext): Promise<VersionEntry[]>;
  restoreVersion?(
    config: Config,
    ctx: LessonComponentRuntimeContext,
    versionId: string,
  ): Promise<void>;

  /** OPCIONAL: log de sessões/eventos (vídeo, reassistir). */
  recordSession?(
    config: Config,
    ctx: LessonComponentRuntimeContext,
    event: Omit<SessionEvent, 'id'>,
  ): Promise<void>;
  listSessions?(
    config: Config,
    ctx: LessonComponentRuntimeContext,
  ): Promise<SessionEvent[]>;
}
