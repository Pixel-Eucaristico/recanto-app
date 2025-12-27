'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Heart', label: 'Coração' },
  { name: 'Cross', label: 'Cruz' },
  { name: 'Eye', label: 'Olho' },
  { name: 'HandHeart', label: 'Mãos com Coração' },
  { name: 'Lightbulb', label: 'Lâmpada' },
  { name: 'Star', label: 'Estrela' },
  { name: 'Compass', label: 'Bússola' },
  { name: 'Church', label: 'Igreja' },
  { name: 'Sparkles', label: 'Brilhos' },
  { name: 'Book', label: 'Livro' },
  { name: 'BookOpen', label: 'Livro Aberto' },
  { name: 'Flame', label: 'Chama' },
  { name: 'Sun', label: 'Sol' },
  { name: 'Moon', label: 'Lua' },
  { name: 'Crown', label: 'Coroa' },
  { name: 'Shield', label: 'Escudo' },
];

/**
 * Seletor visual de ícones Lucide
 * Modal com previews - usuário VÊ o ícone antes de escolher
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIcon = AVAILABLE_ICONS.find((i) => i.name === value);

  const handleSelect = (iconName: string | undefined) => {
    onChange(iconName);
    setIsOpen(false);
  };

  const renderIcon = (iconName: string, size: number = 24) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{
      size?: number;
      className?: string;
    }>;
    return IconComponent ? <IconComponent size={size} className="text-accent" /> : null;
  };

  return (
    <div>
      {/* Botão para abrir modal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-outline gap-2 w-full justify-start"
      >
        {value ? (
          <>
            <div className="w-6 h-6 flex items-center justify-center">
              {renderIcon(value)}
            </div>
            <span className="flex-1 text-left">{selectedIcon?.label || value}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span className="flex-1 text-left">Selecionar Ícone</span>
          </>
        )}
        <span className="badge badge-sm">{value ? 'Selecionado' : 'Nenhum'}</span>
      </button>

      {/* Preview do ícone selecionado */}
      {value && (
        <div className="mt-3 p-3 bg-base-200 rounded-lg flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center bg-base-100 rounded">
            {renderIcon(value)}
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold">{selectedIcon?.label}</span>
          </div>
          <button
            type="button"
            onClick={() => handleSelect(undefined)}
            className="btn btn-sm btn-ghost btn-circle"
            title="Remover ícone"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal de seleção */}
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Selecionar Ícone</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid de ícones */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto mb-4">
              {/* Opção "Sem Ícone" */}
              <button
                type="button"
                onClick={() => handleSelect(undefined)}
                className={`card bg-base-100 border-2 hover:border-primary transition-all p-4 ${
                  !value ? 'border-primary ring-2 ring-primary' : 'border-base-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 flex items-center justify-center">
                    <X className="w-8 h-8 text-base-content/40" />
                  </div>
                  <span className="text-xs font-semibold text-center">Sem Ícone</span>
                </div>
              </button>

              {/* Ícones disponíveis */}
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => handleSelect(icon.name)}
                  className={`card bg-base-100 border-2 hover:border-primary transition-all p-4 ${
                    value === icon.name ? 'border-primary ring-2 ring-primary' : 'border-base-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 flex items-center justify-center">
                      {renderIcon(icon.name, 32)}
                    </div>
                    <span className="text-xs font-semibold text-center">{icon.label}</span>
                    {value === icon.name && (
                      <div className="badge badge-primary badge-sm">Selecionado</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="modal-action">
              <button onClick={() => setIsOpen(false)} className="btn">
                Fechar
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
