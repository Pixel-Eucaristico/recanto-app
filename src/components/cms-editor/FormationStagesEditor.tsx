'use client';

import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AnimationPicker } from './AnimationPicker';

interface FormationStage {
  title: string;
  description: string;
  lottieUrl: string;
}

interface FormationStagesEditorProps {
  value: FormationStage[];
  onChange: (value: FormationStage[]) => void;
}

/**
 * Editor visual de etapas de formação com título, descrição e animação
 * Interface intuitiva com botões +/- e preview de animações
 */
export function FormationStagesEditor({ value = [], onChange }: FormationStagesEditorProps) {
  // Garantir que value seja sempre um array válido
  const normalizeValue = (val: any): FormationStage[] => {
    if (Array.isArray(val) && val.length > 0) return val;
    return [{
      title: '',
      description: '',
      lottieUrl: '/animations/glurtr-anmation.json',
    }];
  };

  const [stages, setStages] = useState<FormationStage[]>(normalizeValue(value));
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // Primeiro item expandido por padrão

  const handleAdd = () => {
    const newStages = [
      ...stages,
      {
        title: '',
        description: '',
        lottieUrl: '/animations/glurtr-anmation.json',
      }
    ];
    setStages(newStages);
    onChange(newStages);
    setExpandedIndex(newStages.length - 1); // Expandir o novo item
  };

  const handleRemove = (index: number) => {
    if (stages.length === 1) return; // Manter pelo menos 1
    const newStages = stages.filter((_, i) => i !== index);
    setStages(newStages);
    onChange(newStages);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const handleChange = (index: number, field: keyof FormationStage, value: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
    onChange(newStages);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const isExpanded = expandedIndex === index;

        return (
          <div key={index} className="card bg-base-200 border border-base-300">
            <div className="card-body p-3">
              {/* Header - Sempre visível */}
              <div className="flex items-center gap-2">
                {/* Indicador de ordem */}
                <div className="flex items-center gap-1">
                  <GripVertical className="w-4 h-4 text-base-content/40" />
                  <span className="badge badge-neutral badge-sm">
                    {index + 1}
                  </span>
                </div>

                {/* Título preview */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {stage.title || `Etapa ${index + 1}`}
                  </p>
                  {!isExpanded && stage.description && (
                    <p className="text-xs text-base-content/60 truncate">
                      {stage.description}
                    </p>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(index)}
                    className="btn btn-ghost btn-sm btn-square"
                    title={isExpanded ? 'Recolher' : 'Expandir'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="btn btn-ghost btn-sm btn-square text-error"
                    disabled={stages.length === 1}
                    title="Remover etapa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Formulário - Expandível */}
              {isExpanded && (
                <div className="space-y-3 mt-3 pt-3 border-t border-base-300">
                  {/* Título */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Título <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Ex: Encarnação"
                      value={stage.title}
                      onChange={(e) => handleChange(index, 'title', e.target.value)}
                    />
                  </div>

                  {/* Descrição */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Descrição <span className="text-error">*</span>
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full min-h-[80px]"
                      placeholder="Descreva esta etapa de formação..."
                      value={stage.description}
                      onChange={(e) => handleChange(index, 'description', e.target.value)}
                    />
                  </div>

                  {/* Animação Lottie */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Animação Lottie
                      </span>
                    </label>
                    <AnimationPicker
                      value={stage.lottieUrl}
                      onChange={(newValue) => handleChange(index, 'lottieUrl', newValue)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Botão adicionar */}
      <button
        type="button"
        onClick={handleAdd}
        className="btn btn-outline btn-sm gap-2 w-full"
      >
        <Plus className="w-4 h-4" />
        Adicionar Etapa
      </button>

      {/* Contador */}
      <div className="text-xs text-base-content/60 text-center">
        {stages.length} {stages.length === 1 ? 'etapa' : 'etapas'}
      </div>
    </div>
  );
}
