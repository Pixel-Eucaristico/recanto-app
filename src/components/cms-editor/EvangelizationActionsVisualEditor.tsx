'use client';

import { useState } from 'react';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';

interface EvangelizationItem {
  title: string;
  description: string;
  icon: string;
  audience: string;
}

interface EvangelizationActionsVisualEditorProps {
  value: any;
  onChange: (value: any) => void;
}

export function EvangelizationActionsVisualEditor({ value, onChange }: EvangelizationActionsVisualEditorProps) {
  // Parse actions from JSON string
  let initialActions: EvangelizationItem[] = [];
  if (value.actions && typeof value.actions === 'string') {
    try {
      initialActions = JSON.parse(value.actions);
    } catch (error) {
      console.error('Failed to parse actions:', error);
    }
  }

  const [actions, setActions] = useState<EvangelizationItem[]>(initialActions);

  const handleActionsChange = (newActions: EvangelizationItem[]) => {
    setActions(newActions);
    // Converte para JSON string ao salvar
    onChange({ ...value, actions: JSON.stringify(newActions) });
  };

  const addAction = () => {
    const newActions = [
      ...actions,
      { title: '', description: '', icon: 'Sparkles', audience: '' },
    ];
    handleActionsChange(newActions);
  };

  const removeAction = (index: number) => {
    const newActions = actions.filter((_, i) => i !== index);
    handleActionsChange(newActions);
  };

  const updateAction = (index: number, field: keyof EvangelizationItem, newValue: string) => {
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
      {/* Título */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Título da Seção</span>
        </label>
        <input
          type="text"
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          className="input input-bordered w-full"
          placeholder="Ex: Nossa Evangelização"
        />
      </div>

      {/* Subtítulo */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Subtítulo</span>
        </label>
        <textarea
          value={value.subtitle || ''}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
          className="textarea textarea-bordered w-full"
          rows={2}
          placeholder="Ex: Conheça as formas como levamos a Palavra de Deus a diferentes públicos"
        />
      </div>

      {/* Cor de Fundo */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Cor de Fundo</span>
        </label>
        <select
          value={value.bgColor || 'base-200'}
          onChange={(e) => onChange({ ...value, bgColor: e.target.value })}
          className="select select-bordered w-full"
        >
          <option value="base-100">Padrão (Base 100)</option>
          <option value="base-200">Cinza Claro (Base 200)</option>
          <option value="base-300">Cinza Escuro (Base 300)</option>
        </select>
      </div>

      {/* Editor de Ações */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label">
            <span className="label-text font-semibold">Ações de Evangelização</span>
          </label>
          <button
            type="button"
            onClick={addAction}
            className="btn btn-sm btn-primary gap-2"
          >
            <Plus size={16} />
            Adicionar Ação
          </button>
        </div>

        <div className="space-y-4">
          {actions.length === 0 ? (
            <div className="alert alert-info">
              <span>Nenhuma ação adicionada. Clique em "Adicionar Ação" para começar.</span>
            </div>
          ) : (
            actions.map((action, index) => (
              <div key={index} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Ação {index + 1}</h4>
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
                        title="Remover ação"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Título */}
                    <div>
                      <label className="label">
                        <span className="label-text">Título</span>
                      </label>
                      <input
                        type="text"
                        value={action.title}
                        onChange={(e) => updateAction(index, 'title', e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Ex: Catequese Infantil"
                      />
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="label">
                        <span className="label-text">Descrição</span>
                      </label>
                      <textarea
                        value={action.description}
                        onChange={(e) => updateAction(index, 'description', e.target.value)}
                        className="textarea textarea-bordered w-full"
                        rows={3}
                        placeholder="Ex: Formação catequética para crianças de 7 a 12 anos..."
                      />
                    </div>

                    {/* Ícone */}
                    <div>
                      <label className="label">
                        <span className="label-text">Ícone (Lucide React)</span>
                      </label>
                      <select
                        value={action.icon}
                        onChange={(e) => updateAction(index, 'icon', e.target.value)}
                        className="select select-bordered w-full"
                      >
                        <option value="BookOpen">📖 Livro (BookOpen)</option>
                        <option value="Users">👥 Pessoas (Users)</option>
                        <option value="Heart">❤️ Coração (Heart)</option>
                        <option value="UserPlus">➕ Adicionar Pessoa (UserPlus)</option>
                        <option value="Home">🏠 Casa (Home)</option>
                        <option value="Sparkles">✨ Estrelas (Sparkles)</option>
                      </select>
                    </div>

                    {/* Público-alvo */}
                    <div>
                      <label className="label">
                        <span className="label-text">Público-alvo</span>
                      </label>
                      <input
                        type="text"
                        value={action.audience}
                        onChange={(e) => updateAction(index, 'audience', e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Ex: Crianças de 7 a 12 anos"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botão CTA */}
      <div className="divider">Call-to-Action (opcional)</div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            <span className="label-text font-semibold">Texto do Botão</span>
          </label>
          <input
            type="text"
            value={value.ctaText || ''}
            onChange={(e) => onChange({ ...value, ctaText: e.target.value })}
            className="input input-bordered w-full"
            placeholder="Ex: Conheça Todas as Ações"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Link do Botão</span>
          </label>
          <input
            type="text"
            value={value.ctaLink || ''}
            onChange={(e) => onChange({ ...value, ctaLink: e.target.value })}
            className="input input-bordered w-full"
            placeholder="Ex: /acoes-projetos-evangelizacao"
          />
        </div>
      </div>
      <p className="text-sm text-base-content/60">
        Se deixar os campos vazios, o botão não aparecerá
      </p>
    </div>
  );
}
