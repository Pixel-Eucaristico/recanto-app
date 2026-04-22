export interface CaseChoice {
  id: string;
  label: string;
  /** ID do nó destino. Obrigatório. */
  next_node_id: string;
  /** Feedback imediato após a escolha (antes de mostrar próximo nó). */
  feedback?: string;
}

export interface CaseNode {
  id: string;
  /** Narrativa / contexto do nó. Markdown. */
  text: string;
  /** Se vazio ou ausente, o nó é terminal (end). */
  choices?: CaseChoice[];
  /** Marca explícita de nó final (independente de choices). */
  is_end?: boolean;
  /** Feedback final quando o nó é o fim do caso. Markdown. */
  feedback?: string;
}

export interface CaseStudy {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  /** Nó de início. */
  start_node_id: string;
  /** Mapa { nodeId: CaseNode }. Firestore suporta objetos aninhados. */
  nodes: Record<string, CaseNode>;
  /** Posições dos nós no canvas do builder visual. */
  positions?: Record<string, { x: number; y: number }>;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

/** Passo percorrido — ID do nó + ID da escolha feita. */
export interface CaseStep {
  node_id: string;
  choice_id?: string;
}

export interface CaseRun {
  id: string;
  user_id: string;
  case_id: string;
  lesson_id: string;
  /** Ordem de passos percorridos. */
  path: CaseStep[];
  /** Texto final exibido (do último nó). */
  ended_at_node_id: string;
  run_at: string;
}
