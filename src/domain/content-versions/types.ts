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
  /** Conteúdo serializado completo da versão (pra restore). */
  payload: Record<string, unknown>;
  /** Resumo curto pra exibir no drawer. */
  label?: string;
  created_at: string;
  created_by: string;
}
