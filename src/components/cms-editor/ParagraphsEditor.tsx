'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface ParagraphsEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Editor visual de parágrafos com botões +/-
 * Muito mais intuitivo que pedir JSON!
 */
export function ParagraphsEditor({ value = [], onChange }: ParagraphsEditorProps) {
  // Garantir que value seja sempre um array
  const normalizeValue = (val: any): string[] => {
    if (Array.isArray(val)) return val.length > 0 ? val : [''];
    if (typeof val === 'string') return [val];
    return [''];
  };

  const [paragraphs, setParagraphs] = useState<string[]>(normalizeValue(value));

  const handleAdd = () => {
    const newParagraphs = [...paragraphs, ''];
    setParagraphs(newParagraphs);
    onChange(newParagraphs);
  };

  const handleRemove = (index: number) => {
    if (paragraphs.length === 1) return; // Manter pelo menos 1
    const newParagraphs = paragraphs.filter((_, i) => i !== index);
    setParagraphs(newParagraphs);
    onChange(newParagraphs);
  };

  const handleChange = (index: number, text: string) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index] = text;
    setParagraphs(newParagraphs);
    onChange(newParagraphs);
  };

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => (
        <div key={index} className="flex gap-2 items-start">
          {/* Indicador de ordem */}
          <div className="flex items-center gap-1 pt-3">
            <GripVertical className="w-4 h-4 text-base-content/40" />
            <span className="text-xs font-semibold text-base-content/60">
              {index + 1}
            </span>
          </div>

          {/* Textarea */}
          <textarea
            className="textarea textarea-bordered flex-1 min-h-[100px]"
            placeholder={`Parágrafo ${index + 1}...`}
            value={paragraph}
            onChange={(e) => handleChange(index, e.target.value)}
          />

          {/* Botão remover */}
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="btn btn-ghost btn-sm btn-square text-error mt-2"
            disabled={paragraphs.length === 1}
            title="Remover parágrafo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Botão adicionar */}
      <button
        type="button"
        onClick={handleAdd}
        className="btn btn-outline btn-sm gap-2 w-full"
      >
        <Plus className="w-4 h-4" />
        Adicionar Parágrafo
      </button>

      {/* Contador */}
      <div className="text-xs text-base-content/60 text-center">
        {paragraphs.length} {paragraphs.length === 1 ? 'parágrafo' : 'parágrafos'}
      </div>
    </div>
  );
}
