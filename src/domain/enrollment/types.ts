/**
 * TrackEnrollmentRequest — fila de aprovação manual do formador.
 *
 * Cria-se quando aluno clica "Solicitar acesso" numa trilha com
 * `requires_formator_approval=true` e pré-requisitos cumpridos.
 *
 * Formador (em formator_ids) ou admin aprova/rejeita.
 */

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

export interface TrackEnrollmentRequest {
  id: string;
  user_id: string;
  user_name?: string;
  track_id: string;
  track_title?: string;
  status: EnrollmentStatus;
  /** Mensagem opcional do aluno ao solicitar. */
  request_note?: string;
  /** Mensagem opcional do formador ao decidir. */
  decision_note?: string;
  requested_at: string;
  decided_at?: string;
  decided_by?: string;
  decided_by_name?: string;
}
