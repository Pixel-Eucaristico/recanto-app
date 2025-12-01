'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface TextListEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Editor visual de lista de textos simples com botões +/-
 * Perfeito para listas de qualidades, requisitos, características, etc.
 */
export function TextListEditor({ value = [], onChange }: TextListEditorProps) {
  // Garantir que value seja sempre um array
  const normalizeValue = (val: any): string[] => {
    if (Array.isArray(val)) return val.length > 0 ? val : [''];
    if (typeof val === 'string') return [val];
    return [''];
  };

  const [items, setItems] = useState<string[]>(normalizeValue(value));

  const handleAdd = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    onChange(newItems);
  };

  const handleRemove = (index: number) => {
    if (items.length === 1) return; // Manter pelo menos 1
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  const handleChange = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index] = text;
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          {/* Indicador de ordem */}
          <div className="flex items-center gap-1">
            <GripVertical className="w-4 h-4 text-base-content/40" />
            <span className="badge badge-neutral badge-sm">
              {index + 1}
            </span>
          </div>

          {/* Input de texto */}
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder={`Item ${index + 1}...`}
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
          />

          {/* Botão remover */}
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="btn btn-ghost btn-sm btn-square text-error"
            disabled={items.length === 1}
            title="Remover item"
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
        Adicionar Item
      </button>

      {/* Contador */}
      <div className="text-xs text-base-content/60 text-center">
        {items.length} {items.length === 1 ? 'item' : 'itens'}
      </div>
    </div>
  );
}
