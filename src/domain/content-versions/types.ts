/**
 * ContentVersion — log append-only de edições de conteúdo (reflexão, post, reply, mind-map).
 *
 * Plugin grava uma version a cada save com payload serializado.
 * Permite drawer de histórico + rollback.
 *
 * Ver: project_edit_history_design.md
 */

export interface ContentVersion {
  id: string;
  /** Coleção alvo (ex: spiritual_reflections, community_posts, community_replies, student_mind_maps). */
  target_collection: string;
  /** ID do doc na coleção alvo. */
  target_id: string;
  /** Plugin kind que originou (referência ao registry). */
  plugin_kind: string;
  /** Usuário dono do conteúdo. */
  user_id: string;
  /** Aula relacionada (pra filtrar no drawer). */
  lesson_id?: string;
  /**
   * Trilha relacionada — denormalizada do doc alvo.
   *
   * As Firestore rules autorizam o formador por `formation_tracks/{track_id}.formator_ids`,
   * e uma rule não consegue seguir a referência até o doc alvo sem estourar o limite de
   * access-calls. Docs legados sem esse campo só são visíveis ao dono e ao admin até o
   * backfill (`npm run backfill:versions`).
   */
  track_id?: string;
  /** Conteúdo serializado completo da versão (pra restore). */
  payload: Record<string, unknown>;
  /** Resumo curto pra exibir no drawer. */
  label?: string;
  created_at: string;
  created_by: string;
}
