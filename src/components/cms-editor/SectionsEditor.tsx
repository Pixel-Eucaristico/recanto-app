'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FontAwesomeIcons from 'react-icons/fa';
import { WysiwygEditor } from './WysiwygEditor';

interface InfoSection {
  icon: string;
  title: string;
  content: string;
  iconColor: string;
}

interface SectionsEditorProps {
  value: InfoSection[];
  onChange: (value: InfoSection[]) => void;
  onOpenLibrary?: (callback: (modId: string) => void) => void;
}

// Lista dos ícones mais comuns para seções informativas
// Suporta tanto Lucide (ex: Heart) quanto Font Awesome (ex: FaHeart)
const COMMON_ICONS = [
  // Ícones do arquivo original (Font Awesome)
  { name: 'FaPrayingHands', label: 'Mãos Orando (FA)', library: 'fa' },
  { name: 'FaHeart', label: 'Coração (FA)', library: 'fa' },
  { name: 'FaHandsHelping', label: 'Mãos Ajudando (FA)', library: 'fa' },
  { name: 'FaPeopleArrows', label: 'Pessoas em Grupo (FA)', library: 'fa' },
  { name: 'FaUserFriends', label: 'Amigos (FA)', library: 'fa' },
  { name: 'FaHandHoldingHeart', label: 'Mão com Coração (FA)', library: 'fa' },

  // Ícones Lucide adicionais
  { name: 'Church', label: 'Igreja (Lucide)', library: 'lucide' },
  { name: 'Heart', label: 'Coração (Lucide)', library: 'lucide' },
  { name: 'HandHeart', label: 'Mão com Coração (Lucide)', library: 'lucide' },
  { name: 'Users', label: 'Pessoas (Lucide)', library: 'lucide' },
  { name: 'UsersRound', label: 'Grupo (Lucide)', library: 'lucide' },
  { name: 'HandHelping', label: 'Mão Ajudando (Lucide)', library: 'lucide' },
  { name: 'Cross', label: 'Cruz (Lucide)', library: 'lucide' },
  { name: 'BookOpen', label: 'Livro Aberto (Lucide)', library: 'lucide' },
  { name: 'Book', label: 'Livro (Lucide)', library: 'lucide' },
  { name: 'Sparkles', label: 'Brilho (Lucide)', library: 'lucide' },
  { name: 'Home', label: 'Casa (Lucide)', library: 'lucide' },
  { name: 'Calendar', label: 'Calendário (Lucide)', library: 'lucide' },
  { name: 'Gift', label: 'Presente (Lucide)', library: 'lucide' },
  { name: 'Star', label: 'Estrela (Lucide)', library: 'lucide' },
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
 * Editor visual de seções informativas com ícones, títulos e conteúdo rico
 * Ideal para páginas institucionais (história, carisma, valores, etc.)
 */
export function SectionsEditor({ value = [], onChange, onOpenLibrary }: SectionsEditorProps) {
  // Garantir que value seja sempre um array
  const normalizeValue = (val: any): InfoSection[] => {
    if (Array.isArray(val)) {
      return val.length > 0 ? val : [
        {
          icon: 'FaPrayingHands',
          title: '',
          content: '',
          iconColor: 'primary',
        }
      ];
    }
    return [
      {
        icon: 'FaPrayingHands',
        title: '',
        content: '',
        iconColor: 'primary',
      }
    ];
  };

  const [sections, setSections] = useState<InfoSection[]>(normalizeValue(value));
  const [iconPickerOpen, setIconPickerOpen] = useState<number | null>(null);

  const handleAdd = () => {
    const newSections = [
      ...sections,
      {
        icon: 'FaPrayingHands',
        title: '',
        content: '',
        iconColor: 'primary',
      }
    ];
    setSections(newSections);
    onChange(newSections);
  };

  const handleRemove = (index: number) => {
    if (sections.length === 1) return; // Manter pelo menos 1
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
    onChange(newSections);
  };

  const handleChange = (index: number, field: keyof InfoSection, value: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
    onChange(newSections);
  };

  const handleIconSelect = (index: number, iconName: string) => {
    handleChange(index, 'icon', iconName);
    setIconPickerOpen(null);
  };

  // Renderizar ícone dinamicamente (suporta Lucide e Font Awesome)
  const renderIcon = (iconName: string, className: string = '') => {
    // Detecta se é Font Awesome (começa com Fa) ou Lucide
    const IconComponent = iconName.startsWith('Fa')
      ? (FontAwesomeIcons as any)[iconName]
      : (LucideIcons as any)[iconName];

    if (!IconComponent) return <LucideIcons.HelpCircle className={className} />;
    return <IconComponent className={className} />;
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={index} className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            {/* Cabeçalho com indicador e botão remover */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-base-content/40" />
                <span className="text-xs font-semibold text-base-content/60">
                  Seção {index + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="btn btn-ghost btn-sm btn-square text-error"
                disabled={sections.length === 1}
                title="Remover seção"
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
                  {renderIcon(section.icon, 'w-4 h-4')}
                  <span>{COMMON_ICONS.find(i => i.name === section.icon)?.label || section.icon}</span>
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
                            section.icon === iconOption.name ? 'btn-primary' : 'btn-ghost'
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
                  value={section.iconColor}
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
                    section.icon,
                    `w-6 h-6 ${COLOR_OPTIONS.find(c => c.value === section.iconColor)?.class || 'text-primary'}`
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
                  placeholder="Ex: Nossa História"
                  value={section.title}
                  onChange={(e) => handleChange(index, 'title', e.target.value)}
                />
              </div>

              {/* Conteúdo */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text text-xs font-semibold">Conteúdo</span>
                </label>
                <WysiwygEditor
                  value={section.content}
                  onChange={(newContent) => handleChange(index, 'content', newContent)}
                  placeholder="Ex: Fundado em 2011 pelo Padre Pio Angelotti..."
                  minHeight="150px"
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
        Adicionar Seção
      </button>

      {/* Contador */}
      <div className="text-xs text-base-content/60 text-center">
        {sections.length} {sections.length === 1 ? 'seção' : 'seções'}
      </div>
    </div>
  );
}
