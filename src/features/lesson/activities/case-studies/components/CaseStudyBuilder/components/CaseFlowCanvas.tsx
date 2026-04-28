'use client';

import { Plus } from 'lucide-react';
import {
  ReactFlow, Background, Controls, MiniMap,
  type Edge, type Node, type Connection,
  type OnNodesChange, type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CaseFlowNode';
import type { NodeData } from '../utils/caseStudyFlowUtils';

interface CaseFlowCanvasProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<NodeData>>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: (conn: Connection) => void;
  onNodeDragStop: (node: Node) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeDoubleClick: (event: React.MouseEvent, edge: Edge) => void;
  onEdgesDelete: (deleted: Edge[]) => void;
  onAddNode: () => void;
}

export function CaseFlowCanvas({
  nodes, edges, onNodesChange, onEdgesChange, onConnect,
  onNodeDragStop, onEdgeClick, onEdgeDoubleClick, onEdgesDelete, onAddNode,
}: CaseFlowCanvasProps) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-0 gap-0">
        <div className="flex items-center justify-between p-3 border-b border-base-300">
          <div className="text-sm text-base-content/70">
            Arraste nós • Conecte ⬇→⬆ • Duplo-clique na seta: editar texto • Ctrl+clique na seta: remover
          </div>
          <button className="btn btn-primary btn-sm gap-1" onClick={onAddNode}>
            <Plus className="w-4 h-4" /> Adicionar nó
          </button>
        </div>
        <div style={{ height: 520 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onNodeDragStop={(_, node) => onNodeDragStop(node)}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={['Delete', 'Backspace']}
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
  );
}
