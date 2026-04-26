'use client';

import { Save } from 'lucide-react';
import type { CaseStudy } from '@/domain/case-studies/types';
import { CaseMetaForm } from './components/CaseMetaForm';
import { CaseFlowCanvas } from './components/CaseFlowCanvas';
import { NodeEditModal } from './components/NodeEditModal';
import { EdgeEditModal } from './components/EdgeEditModal';
import { useCaseStudyBuilder } from './hooks/useCaseStudyBuilder';

interface CaseStudyBuilderProps {
  lessonId: string;
  createdBy: string;
  initial?: CaseStudy | null;
  onSaved?: (cs: CaseStudy) => void;
}

export function CaseStudyBuilder({ lessonId, createdBy, initial, onSaved }: CaseStudyBuilderProps) {
  const {
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
  } = useCaseStudyBuilder({ lessonId, createdBy, initial, onSaved });

  const editingNode = editingId ? caseNodes[editingId] : null;

  return (
    <div className="space-y-5">
      <CaseMetaForm
        title={title}
        description={description}
        startNodeId={startNodeId}
        caseNodes={caseNodes}
        nodeIndexMap={nodeIndexMap}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onStartNodeChange={changeStartNode}
      />

      <CaseFlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onAddNode={addNode}
        onNodeDragStop={node => {
          setPositions(prev => {
            const next = { ...prev, [node.id]: { x: node.position.x, y: node.position.y } };
            persistPositions(next);
            return next;
          });
        }}
        onEdgeClick={(event, edge) => {
          const parentId = (edge.data as { parentNodeId?: string } | undefined)?.parentNodeId;
          if (parentId && (event.ctrlKey || event.metaKey)) removeChoice(parentId, edge.id);
        }}
        onEdgeDoubleClick={(event, edge) => {
          event.stopPropagation();
          const parentId = (edge.data as { parentNodeId?: string } | undefined)?.parentNodeId;
          if (parentId) setEditingEdge({ parentId, edgeId: edge.id, label: String(edge.label ?? '') });
        }}
        onEdgesDelete={deleted => {
          for (const e of deleted) {
            const parentId = (e.data as { parentNodeId?: string } | undefined)?.parentNodeId;
            if (parentId) removeChoice(parentId, e.id);
          }
        }}
      />

      {editingNode && (
        <NodeEditModal
          node={editingNode}
          nodeIndex={nodeIndexMap.get(editingNode.id)}
          nodeIndexMap={nodeIndexMap}
          onUpdateNode={updateNode}
          onRemoveChoice={removeChoice}
          onClose={() => setEditingId(null)}
        />
      )}

      {editingEdge && (
        <EdgeEditModal
          label={editingEdge.label}
          onChange={label => setEditingEdge({ ...editingEdge, label })}
          onSave={() => {
            updateChoice(editingEdge.parentId, editingEdge.edgeId, { label: editingEdge.label });
            setEditingEdge(null);
          }}
          onClose={() => setEditingEdge(null)}
        />
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
