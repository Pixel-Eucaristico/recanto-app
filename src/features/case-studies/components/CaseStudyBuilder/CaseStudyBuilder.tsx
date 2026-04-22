'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Pencil, Plus, Save, Trophy, Play, Trash2, ArrowDownToDot } from 'lucide-react';
import { CaseStudy, CaseNode, CaseChoice } from '@/domain/case-studies/types';
import { CaseStudyEntity } from '@/domain/case-studies/entities/CaseStudy';
import { caseStudyService } from '@/application/case-studies/CaseStudyService';
import { MarkdownField } from '@/shared/components/MarkdownField';

interface CaseStudyBuilderProps {
  lessonId: string;
  createdBy: string;
  initial?: CaseStudy | null;
  onSaved?: (cs: CaseStudy) => void;
}

function gid(prefix = 'n') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// ─── Node Data mantido dentro do React Flow ────────────────────────────────
interface NodeData extends Record<string, unknown> {
  label: string;
  text: string;
  feedback?: string;
  is_end?: boolean;
  is_start?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEnd: () => void;
}

function CaseFlowNode({ data }: NodeProps<Node<NodeData>>) {
  const cleaned = data.text.replace(/[#*`>_]/g, '').trim();
  const preview = cleaned.slice(0, 60) || '(clique ✏️ para escrever)';
  return (
    <div
      className={`bg-base-100 border-2 rounded-xl shadow-md min-w-48 max-w-64 ${
        data.is_start ? 'border-primary' : data.is_end ? 'border-success' : 'border-base-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-1 flex-wrap">
          {data.is_start && (
            <span className="badge badge-primary badge-xs gap-1">
              <Play className="w-2.5 h-2.5" /> Início
            </span>
          )}
          {data.is_end && (
            <span className="badge badge-success badge-xs gap-1">
              <Trophy className="w-2.5 h-2.5" /> Final
            </span>
          )}
          <span className="badge badge-ghost badge-xs">{data.label}</span>
        </div>
        <p className="text-xs text-base-content line-clamp-3">{preview}</p>
        <div className="flex gap-1 justify-end">
          <button
            className="btn btn-xs btn-ghost"
            onClick={data.onEdit}
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {!data.is_start && (
            <button
              className={`btn btn-xs btn-ghost ${data.is_end ? 'text-warning' : 'text-info'}`}
              onClick={data.onToggleEnd}
              title={data.is_end ? 'Remover marca final' : 'Marcar como final'}
            >
              {data.is_end ? <Trophy className="w-3.5 h-3.5" /> : <ArrowDownToDot className="w-3.5 h-3.5" />}
            </button>
          )}
          {!data.is_start && (
            <button
              className="btn btn-xs btn-ghost text-error"
              onClick={data.onDelete}
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
}

const nodeTypes = { caseNode: CaseFlowNode };

// ─── Conversão entre CaseStudy e React Flow state ─────────────────────────

function buildInitialState(initial?: CaseStudy | null): {
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
    return {
      nodes: initial.nodes,
      startId: initial.start_node_id || ids[0],
      positions,
    };
  }
  const startId = gid('n');
  const endId = gid('n');
  const choiceA = gid('c');
  const choiceB = gid('c');
  return {
    nodes: {
      [startId]: {
        id: startId,
        text: '',
        choices: [
          { id: choiceA, label: '', next_node_id: endId },
          { id: choiceB, label: '', next_node_id: endId },
        ],
      },
      [endId]: {
        id: endId,
        text: '',
        is_end: true,
        feedback: '',
      },
    },
    startId,
    positions: {
      [startId]: { x: 200, y: 80 },
      [endId]: { x: 200, y: 320 },
    },
  };
}

export function CaseStudyBuilder({ lessonId, createdBy, initial, onSaved }: CaseStudyBuilderProps) {
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
    // Nó de início é sempre 1; demais seguem ordem de inserção
    const rest = Object.keys(caseNodes).filter(id => id !== startNodeId);
    const ordered = startNodeId && caseNodes[startNodeId] ? [startNodeId, ...rest] : rest;
    ordered.forEach((id, i) => map.set(id, i + 1));
    return map;
  }, [caseNodes, startNodeId]);

  // Derivar React Flow nodes/edges a partir do state lógico
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
    // Contar quantos edges já existem pro mesmo par (source, target) pra offsetar labels
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
          labelBgStyle: {},
          labelStyle: { fontSize: 11, fontWeight: 500 },
          labelBgPadding: [4, 6],
          labelBgBorderRadius: 4,
          data: { choiceId: ch.id, parentNodeId: node.id, indexInPair: idxInPair },
          // Alterna tipo de edge quando há múltiplas entre o mesmo par — curvaturas diferentes evitam overlap
          type: idxInPair > 0 ? 'smoothstep' : 'default',
        });
      }
    }
    return edges;
  }, [caseNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(flowEdges);

  // Sincronizar flowNodes → React Flow nodes quando lógica muda
  useMemo(() => setNodes(flowNodes), [flowNodes, setNodes]);
  useMemo(() => setEdges(flowEdges), [flowEdges, setEdges]);

  // Salva só após soltar o drag ou em momentos explícitos (evita spam de writes).
  const persistPositions = useCallback((nextPositions: Record<string, { x: number; y: number }>) => {
    if (!caseIdRef.current) return;
    caseStudyService
      .save({
        id: caseIdRef.current,
        lesson_id: lessonId,
        title: title.trim() || 'Sem título',
        description: description.trim() || undefined,
        start_node_id: startNodeId,
        nodes: caseNodes,
        positions: nextPositions,
        created_at: initial?.created_at ?? new Date().toISOString(),
        created_by: initial?.created_by ?? createdBy,
      } as CaseStudy)
      .catch(() => { /* silent */ });
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
    const n = caseNodes[id];
    if (!n) return;
    // Nó de início não pode virar final
    if (id === startNodeId) return;
    updateNode(id, {
      is_end: !n.is_end,
      choices: !n.is_end ? [] : [],
    });
  }

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target) return;
      if (conn.source === conn.target) return;
      const sourceNode = caseNodes[conn.source];
      if (!sourceNode) return;
      // Bloqueia duplicata: já existe escolha do mesmo source → mesmo target?
      const duplicated = (sourceNode.choices ?? []).some(c => c.next_node_id === conn.target);
      if (duplicated) return;
      const newChoice: CaseChoice = {
        id: gid('c'),
        label: 'Nova escolha',
        next_node_id: conn.target,
      };
      updateNode(conn.source, {
        choices: [...(sourceNode.choices ?? []), newChoice],
        is_end: false,
      });
      setEdges(eds => addEdge({ ...conn, id: newChoice.id, label: newChoice.label }, eds));
    },
    [caseNodes, setEdges],
  );

  function removeChoice(parentNodeId: string, choiceId: string) {
    const parent = caseNodes[parentNodeId];
    if (!parent) return;
    updateNode(parentNodeId, { choices: parent.choices?.filter(c => c.id !== choiceId) });
  }

  function updateChoice(parentNodeId: string, choiceId: string, patch: Partial<CaseChoice>) {
    const parent = caseNodes[parentNodeId];
    if (!parent) return;
    updateNode(parentNodeId, {
      choices: parent.choices?.map(c => (c.id === choiceId ? { ...c, ...patch } : c)),
    });
  }

  const editingNode = editingId ? caseNodes[editingId] : null;

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
    if (errors.length > 0) {
      setError(errors.join(' '));
      return;
    }
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

  return (
    <div className="space-y-5">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Título</span>
            <input
              className="input input-bordered input-sm"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex.: Dilema do jovem rico"
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Descrição (Markdown)</span>
            <MarkdownField value={description} onChange={setDescription} height={120} preview="live" />
          </label>
          <label className="form-control max-w-md">
            <span className="label-text text-xs mb-1">Nó de início</span>
            <select
              className="select select-bordered select-sm"
              value={startNodeId}
              onChange={e => {
                const newStart = e.target.value;
                // Se o novo nó de início era final, desmarcar
                if (caseNodes[newStart]?.is_end) {
                  updateNode(newStart, { is_end: false });
                }
                setStartNodeId(newStart);
              }}
            >
              {Object.values(caseNodes).map(n => (
                <option key={n.id} value={n.id}>
                  Nó {nodeIndexMap.get(n.id)} — {(n.text ?? '').slice(0, 40) || '(vazio)'}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0 gap-0">
          <div className="flex items-center justify-between p-3 border-b border-base-300">
            <div className="text-sm text-base-content/70">
              Arraste nós • Conecte ⬇→⬆ • Duplo-clique na seta: editar texto • Ctrl+clique na seta: remover • Ícones: editar / marcar final / excluir
            </div>
            <button className="btn btn-primary btn-sm gap-1" onClick={addNode}>
              <Plus className="w-4 h-4" /> Adicionar nó
            </button>
          </div>
          <div style={{ height: 520 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onNodeDragStop={(_, node) => {
                setPositions(prev => {
                  const next = { ...prev, [node.id]: { x: node.position.x, y: node.position.y } };
                  persistPositions(next);
                  return next;
                });
              }}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={(event, edge) => {
                const parentId = (edge.data as { parentNodeId?: string } | undefined)?.parentNodeId;
                if (!parentId) return;
                // Ctrl/Cmd + clique → remove direto
                if (event.ctrlKey || event.metaKey) {
                  removeChoice(parentId, edge.id);
                }
              }}
              onEdgeDoubleClick={(event, edge) => {
                event.stopPropagation();
                const parentId = (edge.data as { parentNodeId?: string } | undefined)?.parentNodeId;
                if (!parentId) return;
                setEditingEdge({ parentId, edgeId: edge.id, label: String(edge.label ?? '') });
              }}
              onEdgesDelete={(deleted) => {
                for (const e of deleted) {
                  const parentId = (e.data as { parentNodeId?: string } | undefined)?.parentNodeId;
                  if (parentId) removeChoice(parentId, e.id);
                }
              }}
              nodeTypes={nodeTypes}
              fitView
              deleteKeyCode={['Delete', 'Backspace']}
              proOptions={{ hideAttribution: true }}
            >
              <Background />
              <Controls />
              <MiniMap
                style={{
                  background: 'var(--color-base-200)',
                  border: '1px solid var(--color-base-300)',
                }}
                nodeColor={() => 'var(--color-primary)'}
                maskColor="color-mix(in oklch, var(--color-base-300) 60%, transparent)"
              />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Modal de edição */}
      {editingNode && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-3">
              Editar Nó {nodeIndexMap.get(editingNode.id)}
            </h3>
            <div className="space-y-3">
              <label className="form-control">
                <span className="label-text text-xs mb-1">Texto do nó (Markdown)</span>
                <MarkdownField
                  value={editingNode.text}
                  onChange={v => updateNode(editingNode.id, { text: v })}
                  placeholder="Descreva a cena/cenário que o aluno irá ler..."
                  height={200}
                  preview="live"
                />
              </label>

              {editingNode.is_end && (
                <label className="form-control">
                  <span className="label-text text-xs mb-1">Feedback final (Markdown)</span>
                  <MarkdownField
                    value={editingNode.feedback ?? ''}
                    onChange={v => updateNode(editingNode.id, { feedback: v })}
                    placeholder="Ex.: 'Boa escolha — escutar antes de aconselhar é essencial.'"
                    height={140}
                    preview="live"
                  />
                </label>
              )}

              {!editingNode.is_end && editingNode.choices && editingNode.choices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-base-content/60">Escolhas deste nó:</p>
                  {editingNode.choices.map(ch => (
                    <div key={ch.id} className="flex items-center gap-2">
                      <input
                        className="input input-bordered input-sm flex-1"
                        value={ch.label}
                        onChange={e => updateChoice(editingNode.id, ch.id, { label: e.target.value })}
                        placeholder="Label da escolha"
                      />
                      <span className="text-xs text-base-content/60">
                        → Nó {nodeIndexMap.get(ch.next_node_id)}
                      </span>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => removeChoice(editingNode.id, ch.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => setEditingId(null)}>
                Fechar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditingId(null)} />
        </div>
      )}

      {/* Modal: edita label de escolha (edge) */}
      {editingEdge && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-3">Editar texto da escolha</h3>
            <input
              autoFocus
              className="input input-bordered w-full"
              value={editingEdge.label}
              onChange={e => setEditingEdge({ ...editingEdge, label: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  updateChoice(editingEdge.parentId, editingEdge.edgeId, { label: editingEdge.label });
                  setEditingEdge(null);
                } else if (e.key === 'Escape') {
                  setEditingEdge(null);
                }
              }}
              placeholder="Ex.: Falar sobre oração"
            />
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setEditingEdge(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  updateChoice(editingEdge.parentId, editingEdge.edgeId, { label: editingEdge.label });
                  setEditingEdge(null);
                }}
              >
                Salvar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditingEdge(null)} />
        </div>
      )}

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
      {savedMsg && <div className="alert alert-success text-sm"><span>{savedMsg}</span></div>}

      <div className="flex justify-end">
        <button className="btn btn-primary gap-1" onClick={save} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar caso'}
        </button>
      </div>
    </div>
  );
}
