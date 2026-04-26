'use client';

import { useCallback, useMemo, useState } from 'react';
import { addEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { MindMapState, MindMapNode, MindMapEdge } from '@/domain/mind-maps/types';
import { type NodeData } from '../components/MindMapFlowNode';

function gid(prefix = 'n') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function useMindMapCanvas(state: MindMapState, onChange: (next: MindMapState) => void, allowRootToggle?: boolean) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [modalLabel, setModalLabel] = useState('');

  function updateNode(id: string, patch: Partial<MindMapNode>) {
    onChange({ ...state, nodes: { ...state.nodes, [id]: { ...state.nodes[id], ...patch } } });
  }

  function addNode() {
    const id = gid();
    onChange({ ...state, nodes: { ...state.nodes, [id]: { id, label: '' } }, positions: { ...state.positions, [id]: { x: 200, y: 200 } } });
  }

  function removeNode(id: string) {
    const node = state.nodes[id];
    if (!node || node.is_root) return;
    const { [id]: _, ...restNodes } = state.nodes;
    const { [id]: __, ...restPositions } = state.positions;
    const filteredEdges: Record<string, MindMapEdge> = {};
    for (const [eid, edge] of Object.entries(state.edges)) {
      if (edge.source !== id && edge.target !== id) filteredEdges[eid] = edge;
    }
    onChange({ nodes: restNodes, edges: filteredEdges, positions: restPositions });
  }

  function toggleRoot(id: string) {
    if (!allowRootToggle) return;
    const nextNodes: Record<string, MindMapNode> = {};
    for (const [nid, n] of Object.entries(state.nodes)) {
      nextNodes[nid] = { ...n, is_root: nid === id ? !n.is_root : false };
    }
    onChange({ ...state, nodes: nextNodes });
  }

  function removeEdge(edgeId: string) {
    const { [edgeId]: _, ...rest } = state.edges;
    onChange({ ...state, edges: rest });
  }

  function updateEdge(edgeId: string, patch: Partial<MindMapEdge>) {
    const existing = state.edges[edgeId];
    if (!existing) return;
    onChange({ ...state, edges: { ...state.edges, [edgeId]: { ...existing, ...patch } } });
  }

  const flowNodes: Node<NodeData>[] = useMemo(() => {
    return Object.values(state.nodes).map(n => ({
      id: n.id,
      type: 'mindMapNode',
      position: state.positions[n.id] ?? { x: 100, y: 100 },
      data: {
        label: n.label,
        is_root: n.is_root,
        color: n.color,
        onEdit: () => { setEditingId(n.id); setModalLabel(n.label); },
        onDelete: () => removeNode(n.id),
        onToggleRoot: allowRootToggle ? () => toggleRoot(n.id) : undefined,
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, allowRootToggle]);

  const flowEdges: Edge[] = useMemo(() => {
    return Object.values(state.edges).map(e => ({
      id: e.id, source: e.source, target: e.target,
      label: e.label || '',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      data: { edgeId: e.id },
    }));
  }, [state.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(flowEdges);

  useMemo(() => setNodes(flowNodes), [flowNodes, setNodes]);
  useMemo(() => setEdges(flowEdges), [flowEdges, setEdges]);

  const onConnect = useCallback((conn: Connection) => {
    if (!conn.source || !conn.target || conn.source === conn.target) return;
    const duplicated = Object.values(state.edges).some(e => e.source === conn.source && e.target === conn.target);
    if (duplicated) return;
    const id = gid('e');
    const newEdge: MindMapEdge = { id, source: conn.source, target: conn.target };
    onChange({ ...state, edges: { ...state.edges, [id]: newEdge } });
    setEdges(eds => addEdge({ ...conn, id }, eds));
  }, [state, onChange, setEdges]);

  const editingNode = editingId ? state.nodes[editingId] : null;
  const editingEdge = editingEdgeId ? state.edges[editingEdgeId] : null;

  return {
    editingId, setEditingId,
    editingEdgeId, setEditingEdgeId,
    modalLabel, setModalLabel,
    editingNode, editingEdge,
    nodes, edges,
    onNodesChange, onEdgesChange,
    onConnect,
    addNode,
    updateNode,
    removeEdge,
    updateEdge,
  };
}
