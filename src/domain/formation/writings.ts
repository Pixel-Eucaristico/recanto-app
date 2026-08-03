import type { ReflectionStatus } from '@/domain/spiritual-notebook/types';

/**
 * View-model dos "escritos" do aluno dentro de um curso — o que ele produziu com as
 * próprias palavras (reflexão do caderno, pergunta no fórum, resposta no fórum,
 * mapa mental), somado ao histórico de edições.
 *
 * Existe porque o formador precisa ler o TEXTO, não só as flags booleanas de
 * `LessonProgress`. Diferente do `getHistory` dos plugins, que devolve apenas
 * versões, aqui o conteúdo atual está sempre presente — um post nunca editado tem
 * zero versões e ainda assim precisa aparecer.
 */

export type WritingKind = 'reflection' | 'forum_post' | 'forum_reply' | 'mind_map';

export interface WritingVersion {
  id: string;
  created_at: string;
  label: string;
  /** Texto já extraído do payload. O payload cru NUNCA chega à UI. */
  text: string;
  title?: string;
}

export interface StudentWriting {
  /** Chave estável de lista: `${kind}:${doc_id}`. */
  key: string;
  doc_id: string;
  kind: WritingKind;
  student_id: string;
  student_name: string;
  track_id: string | null;
  track_title: string;
  lesson_id: string | null;
  lesson_title: string;
  module_title?: string;
  title?: string;
  /** Conteúdo atual — sempre preenchido. */
  content: string;
  /** Só para `reflection`. */
  status?: ReflectionStatus;
  review_notes?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at?: string;
  /** Quantidade de edições registradas. 0 = nunca editado. */
  version_count: number;
  /** Carregado sob demanda por `loadVersions`. */
  versions?: WritingVersion[];
  /** Deep link pra aula, quando trilha e aula são conhecidas. */
  href?: string;
}

export interface WritingsFilter {
  trackIds?: string[];
  kinds?: WritingKind[];
  statuses?: ReflectionStatus[];
  search?: string;
  /** ISO date (YYYY-MM-DD) inclusivo. */
  from?: string;
  to?: string;
}

export interface WritingsCounts {
  total: number;
  pendingReview: number;
  reviewed: number;
  drafts: number;
  byKind: Record<WritingKind, number>;
  byTrack: Array<{ track_id: string; track_title: string; total: number; pending: number }>;
}

export const WRITING_KIND_LABELS: Record<WritingKind, string> = {
  reflection: 'Reflexão',
  forum_post: 'Pergunta no fórum',
  forum_reply: 'Resposta no fórum',
  mind_map: 'Mapa mental',
};
