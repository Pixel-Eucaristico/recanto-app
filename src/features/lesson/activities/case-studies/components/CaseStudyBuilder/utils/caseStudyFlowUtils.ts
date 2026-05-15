import type { CaseNode, CaseStudy } from '@/domain/case-studies/types';

export function gid(prefix = 'n') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export interface NodeData extends Record<string, unknown> {
  label: string;
  text: string;
  feedback?: string;
  is_end?: boolean;
  is_start?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEnd: () => void;
}

export function buildInitialState(initial?: CaseStudy | null): {
  nodes: Record<string, CaseNode>;
  startId: string;
  positions: Record<string, { x: number; y: number }>;
} {
  if (initial?.nodes && Object.keys(initial.nodes).length > 0) {
    const ids = Object.keys(initial.nodes);
    const savedPositions = initial.positions ?? {};
    const positions: Record<string, { x: number; y: number }> = {};
    ids.forEach((id, i) => {
      positions[id] = savedPositions[id] ?? { x: 80 + (i % 3) * 260, y: 80 + Math.floor(i / 3) * 200 };
    });
    return { nodes: initial.nodes, startId: initial.start_node_id || ids[0], positions };
  }

  const startId = gid('n');
  const endId = gid('n');
  const choiceA = gid('c');
  const choiceB = gid('c');
  return {
    nodes: {
      [startId]: { id: startId, text: '', choices: [{ id: choiceA, label: '', next_node_id: endId }, { id: choiceB, label: '', next_node_id: endId }] },
      [endId]: { id: endId, text: '', is_end: true, feedback: '' },
    },
    startId,
    positions: { [startId]: { x: 200, y: 80 }, [endId]: { x: 200, y: 320 } },
  };
}
