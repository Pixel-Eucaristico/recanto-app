'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface Pillar {
  icon: string;
  title: string;
  description: string;
  iconColor: string;
}

interface PillarsEditorProps {
  value: Pillar[];
  onChange: (value: Pillar[]) => void;
}

// Lista dos ícones mais comuns para pilares/features
const COMMON_ICONS = [
  { name: 'Book', label: 'Livro' },
  { name: 'Heart', label: 'Coração' },
  { name: 'Users', label: 'Pessoas' },
  { name: 'Handshake', label: 'Aperto de Mão' },
  { name: 'Church', label: 'Igreja' },
  { name: 'Cross', label: 'Cruz' },
  { name: 'Sparkles', label: 'Brilho' },
  { name: 'HandHeart', label: 'Mão com Coração' },
  { name: 'Target', label: 'Alvo' },
  { name: 'Award', label: 'Prêmio' },
  { name: 'Shield', label: 'Escudo' },
  { name: 'Star', label: 'Estrela' },
  { name: 'Home', label: 'Casa' },
  { name: 'MessageCircle', label: 'Mensagem' },
  { name: 'Compass', label: 'Bússola' },
  { name: 'Globe', label: 'Globo' },
  { name: 'Music', label: 'Música' },
  { name: 'Sun', label: 'Sol' },
  { name: 'Moon', label: 'Lua' },
  { name: 'Zap', label: 'Raio' },
];

const COLOR_OPTIONS = [
  { value: 'primary', label: 'Principal (muda com o tema)', class: 'text-primary' },
  { value: 'secondary', label: 'Secundário (muda com o tema)', class: 'text-secondary' },
  { value: 'accent', label: 'Destaque (muda com o tema)', class: 'text-accent' },
  { value: 'info', label: 'Informação (azul)', class: 'text-info' },
  { value: 'success', label: 'Sucesso (verde)', class: 'text-success' },
  { value: 'warning', label: 'Aviso (amarelo)', class: 'text-warning' },
  { value: 'error', label: 'Erro (vermelho)', class: 'text-error' },
];

/**
 * Editor visual de pilares com seleção de ícones, cores e textos
 * Substitui o editor JSON para melhor UX
 */
export function PillarsEditor({ value = [], onChange }: PillarsEditorProps) {
  // Garantir que value seja sempre um array
  const normalizeValue = (val: any): Pillar[] => {
    if (Array.isArray(val)) {
      return val.length > 0 ? val : [
        {
          icon: 'Book',
          title: '',
          description: '',
          iconColor: 'primary',
        }
      ];
    }
    return [
      {
        icon: 'Book',
        title: '',
        description: '',
        iconColor: 'primary',
      }
    ];
  };

  const [pillars, setPillars] = useState<Pillar[]>(normalizeValue(value));
  const [iconPickerOpen, setIconPickerOpen] = useState<number | null>(null);

  const handleAdd = () => {
    const newPillars = [
      ...pillars,
      {
        icon: 'Book',
        title: '',
        description: '',
        iconColor: 'primary',
      }
    ];
    setPillars(newPillars);
    onChange(newPillars);
  };

  const handleRemove = (index: number) => {
    if (pillars.length === 1) return; // Manter pelo menos 1
    const newPillars = pillars.filter((_, i) => i !== index);
    setPillars(newPillars);
    onChange(newPillars);
  };

  const handleChange = (index: number, field: keyof Pillar, value: string) => {
    const newPillars = [...pillars];
    newPillars[index] = { ...newPillars[index], [field]: value };
    setPillars(newPillars);
    onChange(newPillars);
  };

  const handleIconSelect = (index: number, iconName: string) => {
    handleChange(index, 'icon', iconName);
    setIconPickerOpen(null);
  };

  // Renderizar ícone dinamicamente
  const renderIcon = (iconName: string, className: string = '') => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return <LucideIcons.HelpCircle className={className} />;
    return <IconComponent className={className} />;
  };

  return (
    <div className="space-y-4">
      {pillars.map((pillar, index) => (
        <div key={index} className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            {/* Cabeçalho com indicador e botão remover */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-base-content/40" />
                <span className="text-xs font-semibold text-base-content/60">
                  Pilar {index + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="btn btn-ghost btn-sm btn-square text-error"
                disabled={pillars.length === 1}
                title="Remover pilar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Seletor de Ícone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">Ícone</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIconPickerOpen(iconPickerOpen === index ? null : index)}
                  className="btn btn-outline btn-sm justify-start gap-2"
                >
                  {renderIcon(pillar.icon, 'w-4 h-4')}
                  <span>{COMMON_ICONS.find(i => i.name === pillar.icon)?.label || pillar.icon}</span>
                </button>

                {/* Modal do Icon Picker */}
                {iconPickerOpen === index && (
                  <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 shadow-lg">
                    <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                      {COMMON_ICONS.map((iconOption) => (
                        <button
                          key={iconOption.name}
                          type="button"
                          onClick={() => handleIconSelect(index, iconOption.name)}
                          className={`btn btn-sm btn-square ${
                            pillar.icon === iconOption.name ? 'btn-primary' : 'btn-ghost'
                          }`}
                          title={iconOption.label}
                        >
                          {renderIcon(iconOption.name, 'w-5 h-5')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Seletor de Cor */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">Cor do Ícone</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={pillar.iconColor}
                  onChange={(e) => handleChange(index, 'iconColor', e.target.value)}
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
                {/* Preview da cor */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-base-content/60">Preview:</span>
                  {renderIcon(
                    pillar.icon,
                    `w-6 h-6 ${COLOR_OPTIONS.find(c => c.value === pillar.iconColor)?.class || 'text-primary'}`
                  )}
                </div>
              </div>

              {/* Título */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text text-xs font-semibold">Título</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="Ex: Educação"
                  value={pillar.title}
                  onChange={(e) => handleChange(index, 'title', e.target.value)}
                />
              </div>

              {/* Descrição */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text text-xs font-semibold">Descrição</span>
                </label>
                <textarea
                  className="textarea textarea-bordered textarea-sm w-full"
                  placeholder="Ex: Formação cristã integral de crianças e jovens."
                  rows={2}
                  value={pillar.description}
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                />
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
        Adicionar Pilar
      </button>

      {/* Contador */}
      <div className="text-xs text-base-content/60 text-center">
        {pillars.length} {pillars.length === 1 ? 'pilar' : 'pilares'}
      </div>
    </div>
  );
}
