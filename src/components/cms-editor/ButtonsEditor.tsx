'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface Button {
  text: string;
  url: string;
  style: string;
}

interface ButtonsEditorProps {
  value: Button[];
  onChange: (value: Button[]) => void;
}

const BUTTON_STYLES = [
  { value: 'primary', label: 'Principal (muda com o tema)', class: 'btn-primary' },
  { value: 'secondary', label: 'Secundário (muda com o tema)', class: 'btn-secondary' },
  { value: 'accent', label: 'Destaque (muda com o tema)', class: 'btn-accent' },
  { value: 'outline', label: 'Contorno (muda com o tema)', class: 'btn-outline' },
  { value: 'ghost', label: 'Fantasma (transparente)', class: 'btn-ghost' },
];

/**
 * Editor visual de botões com estilo, texto e URL
 * Substitui o editor JSON para melhor UX
 */
export function ButtonsEditor({ value = [], onChange }: ButtonsEditorProps) {
  // Garantir que value seja sempre um array
  const normalizeValue = (val: any): Button[] => {
    if (Array.isArray(val)) {
      return val.length > 0 ? val : [
        {
          text: '',
          url: '/',
          style: 'primary',
        }
      ];
    }
    return [
      {
        text: '',
        url: '/',
        style: 'primary',
      }
    ];
  };

  const [buttons, setButtons] = useState<Button[]>(normalizeValue(value));

  const handleAdd = () => {
    const newButtons = [
      ...buttons,
      {
        text: '',
        url: '/',
        style: 'primary',
      }
    ];
    setButtons(newButtons);
    onChange(newButtons);
  };

  const handleRemove = (index: number) => {
    if (buttons.length === 1) return; // Manter pelo menos 1
    const newButtons = buttons.filter((_, i) => i !== index);
    setButtons(newButtons);
    onChange(newButtons);
  };

  const handleChange = (index: number, field: keyof Button, value: string) => {
    const newButtons = [...buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setButtons(newButtons);
    onChange(newButtons);
  };

  return (
    <div className="space-y-3">
      {buttons.map((button, index) => (
        <div key={index} className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            {/* Cabeçalho com indicador e botão remover */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-base-content/40" />
                <span className="text-xs font-semibold text-base-content/60">
                  Botão {index + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="btn btn-ghost btn-sm btn-square text-error"
                disabled={buttons.length === 1}
                title="Remover botão"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Texto do Botão */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">Texto do Botão</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="Ex: Apoie nossa missão"
                  value={button.text}
                  onChange={(e) => handleChange(index, 'text', e.target.value)}
                />
              </div>

              {/* URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">Link (URL)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="Ex: /doacoes"
                  value={button.url}
                  onChange={(e) => handleChange(index, 'url', e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Use / para páginas internas (ex: /contatos) ou URL completa (ex: https://...)
                  </span>
                </label>
              </div>

              {/* Estilo */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">Estilo do Botão</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={button.style}
                  onChange={(e) => handleChange(index, 'style', e.target.value)}
                >
                  {BUTTON_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
                {/* Preview do botão */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-base-content/60">Preview:</span>
                  <button
                    type="button"
                    className={`btn btn-sm ${BUTTON_STYLES.find(s => s.value === button.style)?.class || 'btn-primary'}`}
                  >
                    {button.text || 'Texto do botão'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Botão adicionar */}
      <button
        type="button"
        onClick={handleAdd}
        className="btn btn-outline btn-sm gap-2 w-full"
      >
        <Plus className="w-4 h-4" />
        Adicionar Botão
      </button>

      {/* Contador */}
      <div className="text-xs text-base-content/60 text-center">
        {buttons.length} {buttons.length === 1 ? 'botão' : 'botões'}
      </div>
    </div>
  );
}
