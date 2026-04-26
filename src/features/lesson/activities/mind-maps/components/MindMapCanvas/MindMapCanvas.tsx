'use client';

import { Plus, Save } from 'lucide-react';
import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { MindMapState } from '@/domain/mind-maps/types';
import { nodeTypes } from './components/MindMapFlowNode';
import { LabelEditModal } from './components/LabelEditModal';
import { useMindMapCanvas } from './hooks/useMindMapCanvas';

interface MindMapCanvasProps {
  state: MindMapState;
  onChange: (next: MindMapState) => void;
  onSave?: () => void;
  saving?: boolean;
  allowRootToggle?: boolean;
}

export function MindMapCanvas({ state, onChange, onSave, saving, allowRootToggle }: MindMapCanvasProps) {
  const {
    editingId, setEditingId,
    editingEdgeId, setEditingEdgeId,
    modalLabel, setModalLabel,
    editingNode, editingEdge,
    nodes, edges,
    onNodesChange, onEdgesChange,
    onConnect, addNode,
    updateNode, removeEdge, updateEdge,
  } = useMindMapCanvas(state, onChange, allowRootToggle);

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
                onChange({ ...state, positions: { ...state.positions, [node.id]: { x: node.position.x, y: node.position.y } } });
              }}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={(event, edge) => { if (event.ctrlKey || event.metaKey) removeEdge(edge.id); }}
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

      {editingNode && (
        <LabelEditModal
          title="Editar nó"
          label={modalLabel}
          placeholder="Texto do nó..."
          onChange={setModalLabel}
          onSave={() => { updateNode(editingNode.id, { label: modalLabel }); setEditingId(null); }}
          onClose={() => setEditingId(null)}
        />
      )}

      {editingEdge && (
        <LabelEditModal
          title="Editar texto da ligação"
          label={modalLabel}
          placeholder="Relação entre os conceitos..."
          onChange={setModalLabel}
          onSave={() => { updateEdge(editingEdge.id, { label: modalLabel }); setEditingEdgeId(null); }}
          onClose={() => setEditingEdgeId(null)}
        />
      )}
    </div>
  );
}
