'use client';

import { Trash2 } from 'lucide-react';
import type { CaseNode } from '@/domain/case-studies/types';
import { MarkdownField } from '@/shared/components/MarkdownField';

interface NodeEditModalProps {
  node: CaseNode;
  nodeIndex: number | undefined;
  nodeIndexMap: Map<string, number>;
  onUpdateNode: (id: string, patch: Partial<CaseNode>) => void;
  onRemoveChoice: (parentNodeId: string, choiceId: string) => void;
  onClose: () => void;
}

export function NodeEditModal({
  node, nodeIndex, nodeIndexMap, onUpdateNode, onRemoveChoice, onClose,
}: NodeEditModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-3">Editar Nó {nodeIndex}</h3>
        <div className="space-y-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Texto do nó (Markdown)</span>
            <MarkdownField
              value={node.text}
              onChange={v => onUpdateNode(node.id, { text: v })}
              placeholder="Descreva a cena/cenário que o aluno irá ler..."
              height={200}
              preview="live"
            />
          </label>

          {node.is_end && (
            <label className="form-control">
              <span className="label-text text-xs mb-1">Feedback final (Markdown)</span>
              <MarkdownField
                value={node.feedback ?? ''}
                onChange={v => onUpdateNode(node.id, { feedback: v })}
                placeholder="Ex.: 'Boa escolha — escutar antes de aconselhar é essencial.'"
                height={140}
                preview="live"
              />
            </label>
          )}

          {!node.is_end && node.choices && node.choices.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-base-content/60">Escolhas deste nó:</p>
              {node.choices.map(ch => (
                <div key={ch.id} className="flex items-center gap-2">
                  <input
                    className="input input-bordered input-sm flex-1"
                    value={ch.label}
                    onChange={e => onUpdateNode(node.id, {
                      choices: node.choices?.map(c => c.id === ch.id ? { ...c, label: e.target.value } : c),
                    })}
                    placeholder="Label da escolha"
                  />
                  <span className="text-xs text-base-content/60">
                    → Nó {nodeIndexMap.get(ch.next_node_id)}
                  </span>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => onRemoveChoice(node.id, ch.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
