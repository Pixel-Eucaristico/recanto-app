'use client';

import { useCallback, useMemo, useState } from 'react';
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
import { Pencil, Plus, Trash2, Save, Star } from 'lucide-react';
import { MindMapState, MindMapNode, MindMapEdge } from '@/domain/mind-maps/types';

interface MindMapCanvasProps {
  state: MindMapState;
  onChange: (next: MindMapState) => void;
  onSave?: () => void;
  saving?: boolean;
  /** Admin pode marcar raiz / criar template estruturado. */
  allowRootToggle?: boolean;
}

interface NodeData extends Record<string, unknown> {
  label: string;
  is_root?: boolean;
  color?: MindMapNode['color'];
  onEdit: () => void;
  onDelete: () => void;
  onToggleRoot?: () => void;
}

function gid(prefix = 'n') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function MindMapFlowNode({ data }: NodeProps<Node<NodeData>>) {
  const label = data.label?.trim() || '(clique ✏️)';
  const colorClass =
    data.color === 'secondary' ? 'border-secondary' :
    data.color === 'accent' ? 'border-accent' :
    data.color === 'info' ? 'border-info' :
    data.color === 'success' ? 'border-success' :
    data.color === 'warning' ? 'border-warning' :
    'border-primary';
  return (
    <div className={`bg-base-100 border-2 rounded-full shadow-md px-4 py-2 min-w-32 text-center ${
      data.is_root ? 'border-warning ring-2 ring-warning/30' : colorClass
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center justify-center gap-1 text-sm font-medium text-base-content">
        {data.is_root && <Star className="w-3.5 h-3.5 text-warning flex-shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="flex gap-1 justify-center mt-1">
        <button className="btn btn-xs btn-ghost" onClick={data.onEdit} title="Editar">
          <Pencil className="w-3 h-3" />
        </button>
        {data.onToggleRoot && (
          <button
            className={`btn btn-xs btn-ghost ${data.is_root ? 'text-warning' : ''}`}
            onClick={data.onToggleRoot}
            title={data.is_root ? 'Remover raiz' : 'Marcar como raiz'}
          >
            <Star className="w-3 h-3" />
          </button>
        )}
        {!data.is_root && (
          <button className="btn btn-xs btn-ghost text-error" onClick={data.onDelete} title="Excluir">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
}

const nodeTypes = { mindMapNode: MindMapFlowNode };

export function MindMapCanvas({ state, onChange, onSave, saving, allowRootToggle }: MindMapCanvasProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [modalLabel, setModalLabel] = useState('');

  function updateNode(id: string, patch: Partial<MindMapNode>) {
    onChange({
      ...state,
      nodes: { ...state.nodes, [id]: { ...state.nodes[id], ...patch } },
    });
  }

  function addNode() {
    const id = gid();
    onChange({
      ...state,
      nodes: { ...state.nodes, [id]: { id, label: '' } },
      positions: { ...state.positions, [id]: { x: 200, y: 200 } },
    });
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
    onChange({
      ...state,
      edges: { ...state.edges, [edgeId]: { ...existing, ...patch } },
    });
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
      id: e.id,
      source: e.source,
      target: e.target,
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

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target || conn.source === conn.target) return;
      // Evitar duplicata
      const duplicated = Object.values(state.edges).some(e => e.source === conn.source && e.target === conn.target);
      if (duplicated) return;
      const id = gid('e');
      const newEdge: MindMapEdge = { id, source: conn.source, target: conn.target };
      onChange({
        ...state,
        edges: { ...state.edges, [id]: newEdge },
      });
      setEdges(eds => addEdge({ ...conn, id }, eds));
    },
    [state, onChange, setEdges],
  );

  const editingNode = editingId ? state.nodes[editingId] : null;
  const editingEdge = editingEdgeId ? state.edges[editingEdgeId] : null;

  return (
    <div className="space-y-3">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          <div className="flex items-center justify-between p-3 border-b border-base-300">
            <div className="text-sm text-base-content/70">
              Arraste nós • Conecte ⬇→⬆ • Duplo-clique na seta: editar texto • Ctrl+clique: remover
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm gap-1" onClick={addNode}>
                <Plus className="w-4 h-4" /> Nó
              </button>
              {onSave && (
                <button className="btn btn-primary btn-sm gap-1" onClick={onSave} disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              )}
            </div>
          </div>
          <div style={{ height: 520 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onNodeDragStop={(_, node) => {
                onChange({
                  ...state,
                  positions: { ...state.positions, [node.id]: { x: node.position.x, y: node.position.y } },
                });
              }}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={(event, edge) => {
                if (event.ctrlKey || event.metaKey) removeEdge(edge.id);
              }}
              onEdgeDoubleClick={(event, edge) => {
                event.stopPropagation();
                setEditingEdgeId(edge.id);
                setModalLabel(String(edge.label ?? ''));
              }}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background />
              <Controls />
              <MiniMap
                style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)' }}
                nodeColor={() => 'var(--color-primary)'}
                maskColor="color-mix(in oklch, var(--color-base-300) 60%, transparent)"
              />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Modal editar nó */}
      {editingNode && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-3">Editar nó</h3>
            <input
              autoFocus
              className="input input-bordered w-full"
              value={modalLabel}
              onChange={e => setModalLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  updateNode(editingNode.id, { label: modalLabel });
                  setEditingId(null);
                } else if (e.key === 'Escape') setEditingId(null);
              }}
              placeholder="Texto do nó..."
            />
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setEditingId(null)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={() => { updateNode(editingNode.id, { label: modalLabel }); setEditingId(null); }}
              >
                Salvar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditingId(null)} />
        </div>
      )}

      {/* Modal editar edge label */}
      {editingEdge && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-3">Editar texto da ligação</h3>
            <input
              autoFocus
              className="input input-bordered w-full"
              value={modalLabel}
              onChange={e => setModalLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  updateEdge(editingEdge.id, { label: modalLabel });
                  setEditingEdgeId(null);
                } else if (e.key === 'Escape') setEditingEdgeId(null);
              }}
              placeholder="Relação entre os conceitos..."
            />
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setEditingEdgeId(null)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={() => { updateEdge(editingEdge.id, { label: modalLabel }); setEditingEdgeId(null); }}
              >
                Salvar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditingEdgeId(null)} />
        </div>
      )}
    </div>
  );
}
