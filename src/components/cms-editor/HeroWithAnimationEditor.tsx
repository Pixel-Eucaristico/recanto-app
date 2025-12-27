'use client';

import { HeroWithAnimationProps } from '@/components/mods/HeroWithAnimation';
import { AnimationPicker } from './AnimationPicker';
import { BgColorPicker } from './BgColorPicker';

interface HeroWithAnimationEditorProps {
  value: HeroWithAnimationProps;
  onChange: (value: HeroWithAnimationProps) => void;
}

/**
 * Editor visual para HeroWithAnimation
 * Todos os campos com labels claras e previews visuais
 */
export function HeroWithAnimationEditor({ value, onChange }: HeroWithAnimationEditorProps) {
  const updateField = <K extends keyof HeroWithAnimationProps>(
    field: K,
    newValue: HeroWithAnimationProps[K]
  ) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="space-y-6">
      {/* Variante do Hero */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Estilo do Hero</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={value.variant || 'fullscreen'}
          onChange={(e) => updateField('variant', e.target.value as any)}
        >
          <option value="fullscreen">Tela Cheia (com background e gradiente)</option>
          <option value="compact">Compacto (simples, sem background)</option>
        </select>
        <label className="label">
          <span className="label-text-alt">
            Fullscreen = hero grande com imagem de fundo | Compact = hero limpo e simples
          </span>
        </label>
      </div>

      {/* Título */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Título Principal</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Ex: Espiritualidade e Carisma"
          value={value.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
      </div>

      {/* Subtítulo */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Subtítulo</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Ex: Seja um Recanto para Deus, e Ele será um Recanto para ti."
          value={value.subtitle}
          onChange={(e) => updateField('subtitle', e.target.value)}
          rows={3}
        />
      </div>

      {/* Cor do Título */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Cor do Título</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={value.titleColor || 'primary'}
          onChange={(e) => updateField('titleColor', e.target.value as any)}
        >
          <option value="primary">Principal (muda com o tema)</option>
          <option value="secondary">Secundário (muda com o tema)</option>
          <option value="accent">Destaque (muda com o tema)</option>
          <option value="base-content">Texto Padrão</option>
        </select>
      </div>

      {/* Espaçamento Vertical (Compact variant) */}
      {value.variant === 'compact' && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Espaçamento Vertical</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={value.paddingY || 'lg'}
            onChange={(e) => updateField('paddingY', e.target.value as any)}
          >
            <option value="sm">Pequeno (py-8)</option>
            <option value="md">Médio (py-12)</option>
            <option value="lg">Grande (py-16)</option>
            <option value="xl">Extra Grande (py-24)</option>
          </select>
        </div>
      )}

      {/* Imagem de Fundo (Fullscreen variant) */}
      {value.variant === 'fullscreen' && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">URL da Imagem de Fundo</span>
          </label>
          <input
            type="url"
            className="input input-bordered w-full"
            placeholder="https://cdn2.picryl.com/..."
            value={value.backgroundImage || ''}
            onChange={(e) => updateField('backgroundImage', e.target.value)}
          />
          {value.backgroundImage && (
            <div className="mt-2">
              <img
                src={value.backgroundImage}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* Animação Lottie */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Animação Lottie (Fundo)</span>
        </label>
        <AnimationPicker
          value={value.lottieUrl}
          onChange={(newValue) => {
            // Converter de ID para URL se necessário
            if (newValue === 'none') {
              updateField('lottieUrl', '');
            } else if (newValue.startsWith('http')) {
              updateField('lottieUrl', newValue);
            } else {
              updateField('lottieUrl', `/animations/${newValue}`);
            }
          }}
        />
      </div>

      {/* Ícone Sobreposto */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Ícone Sobreposto (Opcional)</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={value.icon || ''}
          onChange={(e) => updateField('icon', e.target.value || undefined)}
        >
          <option value="">Sem ícone</option>
          <optgroup label="Ícones Lucide">
            <option value="Heart">Coração</option>
            <option value="Cross">Cruz</option>
            <option value="Church">Igreja</option>
            <option value="Book">Livro</option>
            <option value="BookOpen">Livro Aberto</option>
            <option value="Sparkles">Brilhos</option>
            <option value="Star">Estrela</option>
            <option value="Sun">Sol</option>
            <option value="Moon">Lua</option>
            <option value="Crown">Coroa</option>
            <option value="Flame">Chama</option>
          </optgroup>
          <optgroup label="Ícones Font Awesome">
            <option value="FaBookBible">Bíblia</option>
            <option value="FaPray">Oração</option>
            <option value="FaDove">Pomba</option>
            <option value="FaCross">Cruz (FA)</option>
            <option value="FaChurch">Igreja (FA)</option>
            <option value="FaHeart">Coração (FA)</option>
            <option value="FaHandsPraying">Mãos em Oração</option>
          </optgroup>
        </select>
        <label className="label">
          <span className="label-text-alt">O ícone aparece centralizado sobre a animação Lottie</span>
        </label>
      </div>

      {/* Cor do Ícone */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Cor do Ícone</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={value.iconColor || 'primary'}
          onChange={(e) => updateField('iconColor', e.target.value as any)}
        >
          <option value="primary">Principal (muda com o tema)</option>
          <option value="secondary">Secundário (muda com o tema)</option>
          <option value="accent">Destaque (muda com o tema)</option>
          <option value="info">Informação (azul fixo)</option>
          <option value="success">Sucesso (verde fixo)</option>
          <option value="warning">Aviso (amarelo fixo)</option>
          <option value="error">Erro (vermelho fixo)</option>
        </select>
      </div>

      {/* Gradiente - Cor Inicial (Fullscreen variant) */}
      {value.variant === 'fullscreen' && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Gradiente - Cor Inicial</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={value.gradientFrom || 'accent'}
            onChange={(e) => updateField('gradientFrom', e.target.value as any)}
          >
            <option value="primary">Principal (muda com o tema)</option>
            <option value="secondary">Secundário (muda com o tema)</option>
            <option value="accent">Destaque (muda com o tema)</option>
            <option value="neutral">Neutro (muda com o tema)</option>
          </select>
        </div>
      )}

      {/* Gradiente - Cor Final (Fullscreen variant) */}
      {value.variant === 'fullscreen' && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Gradiente - Cor Final</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={value.gradientTo || 'base-100'}
            onChange={(e) => updateField('gradientTo', e.target.value as any)}
          >
            <option value="base-100">Fundo Principal</option>
            <option value="base-200">Fundo Médio</option>
            <option value="base-300">Fundo Escuro</option>
          </select>
        </div>
      )}

      {/* Preview */}
      <div className="alert alert-info">
        <span className="text-sm">
          💡 <strong>Dica:</strong>{' '}
          {value.variant === 'fullscreen'
            ? 'Fullscreen: Hero ocupa a tela inteira (100vh) com gradiente de fundo e imagem com 20% de opacidade.'
            : 'Compact: Hero simples e limpo, sem background, ideal para páginas institucionais.'}
        </span>
      </div>
    </div>
  );
}
