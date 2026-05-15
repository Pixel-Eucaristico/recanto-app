'use client';

import { Trash2, X, ArrowLeft, Save } from 'lucide-react';
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
      <div className="modal-box max-w-none sm:max-w-2xl w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] rounded-none sm:rounded-2xl flex flex-col p-0">
        {/* Sticky header com Salvar visível */}
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-base-300 bg-base-100 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle shrink-0"
              onClick={onClose}
              aria-label="Fechar"
            >
              <ArrowLeft className="w-5 h-5 sm:hidden" />
              <X className="w-5 h-5 hidden sm:inline" />
            </button>
            <h3 className="font-bold text-sm sm:text-base truncate">Editar Nó {nodeIndex}</h3>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1 shrink-0"
            onClick={onClose}
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Salvar</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5">
          <div className="space-y-3">
            <div>
              <span className="label-text text-xs mb-1 block">Texto do nó (Markdown)</span>
              <MarkdownField
                value={node.text}
                onChange={v => onUpdateNode(node.id, { text: v })}
                placeholder="Descreva a cena/cenário que o aluno irá ler..."
                height={200}
                preview="edit"
              />
            </div>

            {node.is_end && (
              <div>
                <span className="label-text text-xs mb-1 block">Feedback final (Markdown)</span>
                <MarkdownField
                  value={node.feedback ?? ''}
                  onChange={v => onUpdateNode(node.id, { feedback: v })}
                  placeholder="Ex.: 'Boa escolha — escutar antes de aconselhar é essencial.'"
                  height={140}
                  preview="edit"
                />
              </div>
            )}

            {!node.is_end && node.choices && node.choices.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-base-content/60">Escolhas deste nó:</p>
                {node.choices.map(ch => (
                  <div key={ch.id} className="flex items-center gap-2 flex-wrap">
                    <input
                      className="input input-bordered input-sm flex-1 min-w-0"
                      value={ch.label}
                      onChange={e => onUpdateNode(node.id, {
                        choices: node.choices?.map(c => c.id === ch.id ? { ...c, label: e.target.value } : c),
                      })}
                      placeholder="Label da escolha"
                    />
                    <span className="text-xs text-base-content/60 shrink-0">
                      → Nó {nodeIndexMap.get(ch.next_node_id)}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error shrink-0"
                      onClick={() => onRemoveChoice(node.id, ch.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
