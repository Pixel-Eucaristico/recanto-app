'use client';

import { useState } from 'react';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';
import type { ActionCard } from '../mods/ActionsGrid/ActionsGrid';

interface ActionsGridEditorProps {
  value: any;
  onChange: (value: any) => void;
}

export function ActionsGridEditor({ value, onChange }: ActionsGridEditorProps) {
  const [actions, setActions] = useState<ActionCard[]>(value.actions || []);

  const handleActionsChange = (newActions: ActionCard[]) => {
    setActions(newActions);
    onChange({ ...value, actions: newActions });
  };

  const addAction = () => {
    const newActions = [
      ...actions,
      { title: '', description: '', image: '' },
    ];
    handleActionsChange(newActions);
  };

  const removeAction = (index: number) => {
    const newActions = actions.filter((_, i) => i !== index);
    handleActionsChange(newActions);
  };

  const updateAction = (index: number, field: keyof ActionCard, newValue: string) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], [field]: newValue };
    handleActionsChange(newActions);
  };

  const moveAction = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === actions.length - 1)
    ) {
      return;
    }

    const newActions = [...actions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newActions[index], newActions[targetIndex]] = [
      newActions[targetIndex],
      newActions[index],
    ];
    handleActionsChange(newActions);
  };

  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Título da Seção</span>
        </label>
        <input
          type="text"
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          className="input input-bordered w-full"
          placeholder="Ex: Nossas Ações"
        />
      </div>

      {/* Cor do Título */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Cor do Título</span>
        </label>
        <select
          value={value.titleColor || 'primary'}
          onChange={(e) => onChange({ ...value, titleColor: e.target.value })}
          className="select select-bordered w-full"
        >
          <option value="primary">Principal (muda com o tema)</option>
          <option value="secondary">Secundário (muda com o tema)</option>
          <option value="accent">Destaque (muda com o tema)</option>
        </select>
      </div>

      {/* Cor de Fundo */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Cor de Fundo</span>
        </label>
        <select
          value={value.bgColor || 'base-100'}
          onChange={(e) => onChange({ ...value, bgColor: e.target.value })}
          className="select select-bordered w-full"
        >
          <option value="base-100">Fundo 1 (mais claro)</option>
          <option value="base-200">Fundo 2 (médio)</option>
          <option value="base-300">Fundo 3 (mais escuro)</option>
        </select>
      </div>

      {/* Número de Colunas */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Número de Colunas</span>
        </label>
        <select
          value={value.columns || '2'}
          onChange={(e) => onChange({ ...value, columns: e.target.value })}
          className="select select-bordered w-full"
        >
          <option value="1">1 coluna</option>
          <option value="2">2 colunas</option>
          <option value="3">3 colunas</option>
          <option value="4">4 colunas</option>
        </select>
      </div>

      {/* Largura Máxima */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Largura Máxima</span>
        </label>
        <select
          value={value.maxWidth || '5xl'}
          onChange={(e) => onChange({ ...value, maxWidth: e.target.value })}
          className="select select-bordered w-full"
        >
          <option value="4xl">Pequena (4xl)</option>
          <option value="5xl">Média (5xl)</option>
          <option value="6xl">Grande (6xl)</option>
          <option value="7xl">Extra Grande (7xl)</option>
        </select>
      </div>

      {/* Editor de Ações/Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label">
            <span className="label-text font-semibold">Ações/Cards</span>
          </label>
          <button
            type="button"
            onClick={addAction}
            className="btn btn-sm btn-primary gap-2"
          >
            <Plus size={16} />
            Adicionar Card
          </button>
        </div>

        <div className="space-y-4">
          {actions.length === 0 ? (
            <div className="alert alert-info">
              <span>Nenhum card adicionado. Clique em "Adicionar Card" para começar.</span>
            </div>
          ) : (
            actions.map((action, index) => (
              <div key={index} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Card {index + 1}</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveAction(index, 'up')}
                        disabled={index === 0}
                        className="btn btn-xs btn-ghost"
                        title="Mover para cima"
                      >
                        <MoveUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAction(index, 'down')}
                        disabled={index === actions.length - 1}
                        className="btn btn-xs btn-ghost"
                        title="Mover para baixo"
                      >
                        <MoveDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="btn btn-xs btn-error"
                        title="Remover card"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Título do Card */}
                    <div>
                      <label className="label">
                        <span className="label-text">Título</span>
                      </label>
                      <input
                        type="text"
                        value={action.title}
                        onChange={(e) => updateAction(index, 'title', e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Ex: Acolhimento Fraterno"
                      />
                    </div>

                    {/* Descrição do Card */}
                    <div>
                      <label className="label">
                        <span className="label-text">Descrição</span>
                      </label>
                      <textarea
                        value={action.description}
                        onChange={(e) => updateAction(index, 'description', e.target.value)}
                        className="textarea textarea-bordered w-full"
                        rows={2}
                        placeholder="Ex: Oferecemos descanso e escuta sincera."
                      />
                    </div>

                    {/* URL da Imagem */}
                    <div>
                      <label className="label">
                        <span className="label-text">URL da Imagem</span>
                      </label>
                      <input
                        type="url"
                        value={action.image}
                        onChange={(e) => updateAction(index, 'image', e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="https://images.unsplash.com/..."
                      />
                      {action.image && (
                        <div className="mt-2">
                          <img
                            src={action.image}
                            alt="Preview"
                            className="w-full max-w-xs rounded-lg shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
