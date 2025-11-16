'use client';

interface BgColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

// Cores semânticas do DaisyUI que mudam com o tema
const DAISYUI_BG_COLORS = [
  { value: 'base-100', label: 'Fundo Claro (muda com tema)', preview: 'bg-base-100' },
  { value: 'base-200', label: 'Fundo Médio (muda com tema)', preview: 'bg-base-200' },
  { value: 'base-300', label: 'Fundo Escuro (muda com tema)', preview: 'bg-base-300' },
  { value: 'primary', label: 'Principal (muda com tema)', preview: 'bg-primary' },
  { value: 'secondary', label: 'Secundário (muda com tema)', preview: 'bg-secondary' },
  { value: 'accent', label: 'Destaque (muda com tema)', preview: 'bg-accent' },
  { value: 'neutral', label: 'Neutro (muda com tema)', preview: 'bg-neutral' },
  { value: 'info', label: 'Informação (azul fixo)', preview: 'bg-info' },
  { value: 'success', label: 'Sucesso (verde fixo)', preview: 'bg-success' },
  { value: 'warning', label: 'Aviso (amarelo fixo)', preview: 'bg-warning' },
  { value: 'error', label: 'Erro (vermelho fixo)', preview: 'bg-error' },
];

/**
 * Seletor de cor de fundo DaisyUI
 * IMPORTANTE: Usa cores semânticas que se adaptam aos temas
 */
export function BgColorPicker({ value = 'base-100', onChange }: BgColorPickerProps) {
  const selectedColor = DAISYUI_BG_COLORS.find((c) => c.value === value) || DAISYUI_BG_COLORS[0];

  return (
    <div className="space-y-3">
      {/* Grid de cores com preview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {DAISYUI_BG_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`card border-2 transition-all p-3 ${
              value === color.value ? 'border-primary ring-2 ring-primary' : 'border-base-300'
            }`}
          >
            {/* Preview da cor */}
            <div className={`w-full h-12 rounded-lg ${color.preview} border border-base-content/20 mb-2`} />

            {/* Label */}
            <div className="text-xs font-semibold text-center">{color.label}</div>

            {/* Badge se selecionado */}
            {value === color.value && (
              <div className="badge badge-primary badge-sm mt-2 w-full">Selecionada</div>
            )}
          </button>
        ))}
      </div>

      {/* Info sobre cores semânticas */}
      <div className="alert alert-info text-xs">
        <div>
          <strong>💡 Cores Semânticas:</strong>
          <br />
          Cores como "Principal", "Secundário" e "Fundo Claro" mudam automaticamente com o tema escolhido.
          <br />
          Cores como "Informação (azul)" e "Erro (vermelho)" são fixas em todos os temas.
        </div>
      </div>

      {/* Preview da cor selecionada */}
      <div className="card bg-base-200 p-4">
        <div className="text-xs text-base-content/60 mb-2">Preview no tema atual:</div>
        <div className={`w-full h-24 rounded-lg ${selectedColor.preview} border border-base-content/20 flex items-center justify-center`}>
          <span className="text-base-content font-semibold drop-shadow-lg">
            {selectedColor.label}
          </span>
        </div>
      </div>
    </div>
  );
}
