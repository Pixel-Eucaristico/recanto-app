export interface MindMapNode {
  id: string;
  label: string;
  /** Opcional: cor de destaque (classe DaisyUI). */
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning';
  /** Marca o nó raiz/central. */
  is_root?: boolean;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface MindMapState {
  nodes: Record<string, MindMapNode>;
  edges: Record<string, MindMapEdge>;
  positions: Record<string, { x: number; y: number }>;
}

export interface MindMapTemplate extends MindMapState {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

/**
 * Snapshot do mapa mental do aluno — derivado do template, mas editável livremente.
 * ID composto `${user_id}_${template_id}` pra upsert simples.
 */
export interface StudentMindMap extends MindMapState {
  id: string;
  user_id: string;
  template_id: string;
  lesson_id: string;
  updated_at: string;
  created_at: string;
}
