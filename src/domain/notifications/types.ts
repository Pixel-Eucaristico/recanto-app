/**
 * Notification — in-app, push-like. Cada doc = 1 destinatário (denormalizado pra
 * fan-out no momento do evento, evita listener com filtro complexo).
 *
 * Tipos:
 * - 'enrollment_request': aluno pediu acesso (notifica formador/admin)
 * - 'enrollment_decision': formador decidiu (notifica aluno)
 * - 'lesson_completed': aluno concluiu aula (notifica formador)
 * - 'forum_reply': alguém respondeu post (notifica autor do post)
 * - 'generic': mensagem livre
 */

export type NotificationKind =
  | 'enrollment_request'
  | 'enrollment_decision'
  | 'lesson_completed'
  | 'forum_reply'
  | 'generic';

export interface Notification {
  id: string;
  /** Destinatário. */
  user_id: string;
  kind: NotificationKind;
  title: string;
  /** Corpo curto. */
  body?: string;
  /** Path interno (`/app/dashboard/...`) pra abrir ao clicar. */
  link?: string;
  read: boolean;
  /** Metadata específica do kind (track_id, lesson_id, request_id, etc). */
  meta?: Record<string, unknown>;
  created_at: string;
}
