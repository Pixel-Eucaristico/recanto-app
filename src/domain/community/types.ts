export type CommunityKind = 'forum' | 'poll' | 'wall';

export type CommunityVisibility =
  | { scope: 'global' }
  | { scope: 'track'; track_id: string }
  | { scope: 'module'; track_id: string; module_id: string }
  | { scope: 'lesson'; track_id: string; lesson_id: string };

export interface PollOption {
  id: string;
  label: string;
}

export interface CommunityPost {
  id: string;
  kind: CommunityKind;
  title: string;
  /** Markdown — corpo do post (pergunta do fórum, descrição da enquete, depoimento do mural). */
  body: string;
  /** Alvo: global, trilha, módulo ou aula. */
  visibility: CommunityVisibility;
  /** Opções da enquete (apenas quando kind === 'poll'). */
  poll_options?: PollOption[];
  /** Trancar enquete após essa data (ISO). Opcional. */
  poll_closes_at?: string;
  /** Pin fixa no topo. */
  is_pinned?: boolean;
  /** Tranca respostas. */
  is_locked?: boolean;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at?: string;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  /** Resposta em markdown. */
  body: string;
  /** Id de outra resposta que está sendo respondida. Vazio = resposta direta ao post. */
  parent_reply_id?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at?: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  voted_at: string;
}

export interface PollTally {
  option_id: string;
  label: string;
  count: number;
  percent: number;
}
