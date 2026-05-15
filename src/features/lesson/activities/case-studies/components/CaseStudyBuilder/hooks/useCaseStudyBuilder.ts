'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { addEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { CaseStudy, CaseNode, CaseChoice } from '@/domain/case-studies/types';
import { CaseStudyEntity } from '@/domain/case-studies/entities/CaseStudy';
import { caseStudyService } from '@/application/case-studies/CaseStudyService';
import { gid, buildInitialState, type NodeData } from '../utils/caseStudyFlowUtils';

interface UseCaseStudyBuilderOptions {
  lessonId: string;
  createdBy: string;
  initial?: CaseStudy | null;
  onSaved?: (cs: CaseStudy) => void;
}

export function useCaseStudyBuilder({ lessonId, createdBy, initial, onSaved }: UseCaseStudyBuilderOptions) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [init] = useState(() => buildInitialState(initial));
  const [caseNodes, setCaseNodes] = useState<Record<string, CaseNode>>(init.nodes);
  const [startNodeId, setStartNodeId] = useState<string>(init.startId);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(init.positions);
  const caseIdRef = useRef<string | undefined>(initial?.id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<{ parentId: string; edgeId: string; label: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const nodeIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    const rest = Object.keys(caseNodes).filter(id => id !== startNodeId);
    const ordered = startNodeId && caseNodes[startNodeId] ? [startNodeId, ...rest] : rest;
    ordered.forEach((id, i) => map.set(id, i + 1));
    return map;
  }, [caseNodes, startNodeId]);

  const flowNodes: Node<NodeData>[] = useMemo(() => {
    return Object.values(caseNodes).map(n => ({
      id: n.id,
      type: 'caseNode',
      position: positions[n.id] ?? { x: 100, y: 100 },
      data: {
        label: `Nó ${nodeIndexMap.get(n.id) ?? '?'}`,
        text: n.text,
        feedback: n.feedback,
        is_end: n.is_end,
        is_start: n.id === startNodeId,
        onEdit: () => setEditingId(n.id),
        onDelete: () => removeNode(n.id),
        onToggleEnd: () => toggleEnd(n.id),
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseNodes, startNodeId, nodeIndexMap, positions]);

  const flowEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    const pairCount = new Map<string, number>();
    for (const node of Object.values(caseNodes)) {
      for (const ch of node.choices ?? []) {
        if (!ch.next_node_id) continue;
        const pairKey = `${node.id}->${ch.next_node_id}`;
        const idxInPair = pairCount.get(pairKey) ?? 0;
        pairCount.set(pairKey, idxInPair + 1);
        edges.push({
          id: ch.id,
          source: node.id,
          target: ch.next_node_id,
          label: ch.label || '(sem label — duplo-clique para editar)',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2 },
          labelStyle: { fontSize: 11, fontWeight: 500 },
          labelBgPadding: [4, 6],
          labelBgBorderRadius: 4,
          data: { choiceId: ch.id, parentNodeId: node.id, indexInPair: idxInPair },
          type: idxInPair > 0 ? 'smoothstep' : 'default',
        });
      }
    }
    return edges;
  }, [caseNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(flowEdges);

  // Sincroniza estado lógico → React Flow
  useMemo(() => setNodes(flowNodes), [flowNodes, setNodes]);
  useMemo(() => setEdges(flowEdges), [flowEdges, setEdges]);

  const persistPositions = useCallback((nextPositions: Record<string, { x: number; y: number }>) => {
    if (!caseIdRef.current) return;
    caseStudyService.save({
      id: caseIdRef.current,
      lesson_id: lessonId,
      title: title.trim() || 'Sem título',
      description: description.trim() || undefined,
      start_node_id: startNodeId,
      nodes: caseNodes,
      positions: nextPositions,
      created_at: initial?.created_at ?? new Date().toISOString(),
      created_by: initial?.created_by ?? createdBy,
    } as CaseStudy).catch(() => {});
  }, [lessonId, title, description, startNodeId, caseNodes, initial, createdBy]);

  function updateNode(id: string, patch: Partial<CaseNode>) {
    setCaseNodes(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function addNode() {
    const n: CaseNode = { id: gid('n'), text: '', choices: [] };
    setCaseNodes(prev => ({ ...prev, [n.id]: n }));
    setPositions(prev => ({ ...prev, [n.id]: { x: 400, y: 200 } }));
  }

  function removeNode(id: string) {
    if (Object.keys(caseNodes).length <= 2 || id === startNodeId) return;
    const { [id]: _, ...rest } = caseNodes;
    const cleaned: Record<string, CaseNode> = {};
    for (const [nid, node] of Object.entries(rest)) {
      cleaned[nid] = { ...node, choices: node.choices?.filter(c => c.next_node_id !== id) };
    }
    setCaseNodes(cleaned);
  }

  function toggleEnd(id: string) {
    if (id === startNodeId) return;
    const n = caseNodes[id];
    if (!n) return;
    updateNode(id, { is_end: !n.is_end, choices: [] });
  }

  function changeStartNode(newStart: string) {
    if (caseNodes[newStart]?.is_end) updateNode(newStart, { is_end: false });
    setStartNodeId(newStart);
  }

  const onConnect = useCallback((conn: Connection) => {
    if (!conn.source || !conn.target || conn.source === conn.target) return;
    const sourceNode = caseNodes[conn.source];
    if (!sourceNode) return;
    const duplicated = (sourceNode.choices ?? []).some(c => c.next_node_id === conn.target);
    if (duplicated) return;
    const newChoice: CaseChoice = { id: gid('c'), label: 'Nova escolha', next_node_id: conn.target };
    updateNode(conn.source, { choices: [...(sourceNode.choices ?? []), newChoice], is_end: false });
    setEdges(eds => addEdge({ ...conn, id: newChoice.id, label: newChoice.label }, eds));
  }, [caseNodes, setEdges]);

  function removeChoice(parentNodeId: string, choiceId: string) {
    const parent = caseNodes[parentNodeId];
    if (!parent) return;
    updateNode(parentNodeId, { choices: parent.choices?.filter(c => c.id !== choiceId) });
  }

  function updateChoice(parentNodeId: string, choiceId: string, patch: Partial<CaseChoice>) {
    const parent = caseNodes[parentNodeId];
    if (!parent) return;
    updateNode(parentNodeId, { choices: parent.choices?.map(c => c.id === choiceId ? { ...c, ...patch } : c) });
  }

  async function save() {
    setError(null);
    setSavedMsg(null);
    const payload: Omit<CaseStudy, 'id'> & { id?: string } = {
      id: initial?.id,
      lesson_id: lessonId,
      title: title.trim(),
      description: description.trim() || undefined,
      start_node_id: startNodeId,
      nodes: caseNodes,
      positions,
      created_at: initial?.created_at ?? new Date().toISOString(),
      created_by: initial?.created_by ?? createdBy,
    };
    const errors = CaseStudyEntity.validate(payload);
    if (errors.length > 0) { setError(errors.join(' ')); return; }
    setSaving(true);
    try {
      const saved = await caseStudyService.save(payload as CaseStudy);
      caseIdRef.current = saved.id;
      setSavedMsg('Caso salvo com sucesso.');
      onSaved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return {
    title, setTitle,
    description, setDescription,
    caseNodes,
    startNodeId,
    nodeIndexMap,
    nodes, edges,
    onNodesChange, onEdgesChange,
    onConnect,
    editingId, setEditingId,
    editingEdge, setEditingEdge,
    saving, error, savedMsg,
    addNode, updateNode, removeNode,
    removeChoice, updateChoice,
    changeStartNode,
    persistPositions, setPositions,
    save,
  };
}
