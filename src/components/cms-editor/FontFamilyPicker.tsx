'use client';

interface FontFamilyPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

// Lista de Google Fonts populares e profissionais
const GOOGLE_FONTS = [
  { value: 'Inter', label: 'Inter (Sans-serif moderna)' },
  { value: 'Roboto', label: 'Roboto (Sans-serif clássica)' },
  { value: 'Open Sans', label: 'Open Sans (Sans-serif legível)' },
  { value: 'Lato', label: 'Lato (Sans-serif elegante)' },
  { value: 'Montserrat', label: 'Montserrat (Sans-serif geométrica)' },
  { value: 'Poppins', label: 'Poppins (Sans-serif moderna)' },
  { value: 'Raleway', label: 'Raleway (Sans-serif elegante)' },
  { value: 'Nunito', label: 'Nunito (Sans-serif arredondada)' },
  { value: 'Playfair Display', label: 'Playfair Display (Serif elegante)' },
  { value: 'Merriweather', label: 'Merriweather (Serif legível)' },
  { value: 'Lora', label: 'Lora (Serif clássica)' },
  { value: 'PT Serif', label: 'PT Serif (Serif tradicional)' },
  { value: 'Source Serif Pro', label: 'Source Serif Pro (Serif profissional)' },
  { value: 'Crimson Text', label: 'Crimson Text (Serif literária)' },
  { value: 'EB Garamond', label: 'EB Garamond (Serif antiga)' },
  { value: 'Cormorant', label: 'Cormorant (Serif sofisticada)' },
  { value: 'Dancing Script', label: 'Dancing Script (Cursiva)' },
  { value: 'Pacifico', label: 'Pacifico (Cursiva descontraída)' },
  { value: 'system-ui', label: 'Sistema (Padrão do dispositivo)' },
];

/**
 * Seletor de fonte Google Fonts
 * Carrega fontes dinamicamente do Google Fonts
 */
export function FontFamilyPicker({ value = 'Inter', onChange }: FontFamilyPickerProps) {
  const selectedFont = GOOGLE_FONTS.find((f) => f.value === value) || GOOGLE_FONTS[0];

  const handleChange = (newValue: string) => {
    onChange(newValue);

    // Carregar a fonte do Google Fonts dinamicamente
    if (newValue !== 'system-ui' && !document.querySelector(`link[href*="${newValue}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${newValue.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  };

  return (
    <div className="space-y-3">
      {/* Select */}
      <select
        className="select select-bordered w-full"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      >
        {GOOGLE_FONTS.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>

      {/* Preview da fonte */}
      <div className="card bg-base-200 p-4">
        <div className="text-xs text-base-content/60 mb-2">Preview:</div>
        <p
          className="text-lg"
          style={{ fontFamily: value === 'system-ui' ? 'system-ui' : `'${value}', sans-serif` }}
        >
          O rato roeu a roupa do rei de Roma
        </p>
        <p
          className="text-sm text-base-content/70 mt-2"
          style={{ fontFamily: value === 'system-ui' ? 'system-ui' : `'${value}', sans-serif` }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
        <p
          className="text-2xl font-bold mt-2"
          style={{ fontFamily: value === 'system-ui' ? 'system-ui' : `'${value}', sans-serif` }}
        >
          1234567890
        </p>
      </div>

      {/* Info */}
      <div className="text-xs text-base-content/60">
        💡 <strong>Fonte Google Fonts:</strong> {selectedFont.label}
        <br />
        Será carregada automaticamente do Google Fonts
      </div>
    </div>
  );
}
