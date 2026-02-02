'use client';

import { TextImageAnimationProps } from '@/components/mods/TextImageAnimation';
import { AnimationPicker } from './AnimationPicker';
import { WysiwygEditor } from './WysiwygEditor';
import ImageUpload from './ImageUpload';
import { Plus, Trash2, GripVertical, FileText, Image as ImageIcon, Info, ArrowLeft, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';

interface TextImageAnimationEditorProps {
  value: TextImageAnimationProps;
  onChange: (value: TextImageAnimationProps) => void;
}

/**
 * Editor visual para TextImageAnimation
 * Editor de parágrafos com HTML, seletor de layout, etc.
 */
export function TextImageAnimationEditor({ value, onChange }: TextImageAnimationEditorProps) {
  // Garantir valores padrão
  const safeValue: Required<TextImageAnimationProps> = {
    title: value?.title || '',
    titleColor: value?.titleColor || 'primary',
    paragraphs: Array.isArray(value?.paragraphs) ? value.paragraphs : [],
    image: value?.image || '',
    imageAlt: value?.imageAlt || '',
    lottieUrl: value?.lottieUrl || '',
    layout: value?.layout || 'text-left',
    animationDirection: value?.animationDirection || 'left',
  };

  const updateField = <K extends keyof TextImageAnimationProps>(
    field: K,
    newValue: TextImageAnimationProps[K]
  ) => {
    onChange({ ...safeValue, [field]: newValue });
  };

  const addParagraph = () => {
    updateField('paragraphs', [...safeValue.paragraphs, '<p>Novo parágrafo aqui...</p>']);
  };

  const updateParagraph = (index: number, newValue: string) => {
    const newParagraphs = [...safeValue.paragraphs];
    newParagraphs[index] = newValue;
    updateField('paragraphs', newParagraphs);
  };

  const removeParagraph = (index: number) => {
    updateField('paragraphs', safeValue.paragraphs.filter((_, i) => i !== index));
  };

  const moveParagraph = (index: number, direction: 'up' | 'down') => {
    const newParagraphs = [...safeValue.paragraphs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newParagraphs.length) return;

    [newParagraphs[index], newParagraphs[targetIndex]] = [
      newParagraphs[targetIndex],
      newParagraphs[index],
    ];

    updateField('paragraphs', newParagraphs);
  };

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Título da Seção</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Ex: Nossa Espiritualidade"
          value={safeValue.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
      </div>

      {/* Cor do Título */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Cor do Título</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={safeValue.titleColor}
          onChange={(e) => updateField('titleColor', e.target.value as TextImageAnimationProps['titleColor'])}
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

      {/* Parágrafos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="label-text font-semibold">Parágrafos de Texto</label>
          <button
            type="button"
            onClick={addParagraph}
            className="btn btn-sm btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Parágrafo
          </button>
        </div>

        {safeValue.paragraphs.length === 0 && (
          <div className="alert">
            <span>Nenhum parágrafo adicionado. Clique em "Adicionar Parágrafo" acima.</span>
          </div>
        )}

        {safeValue.paragraphs.map((paragraph, index) => (
          <div key={index} className="card bg-base-200 border border-base-300">
            <div className="card-body p-4">
              {/* Header com controles */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm font-semibold">Parágrafo {index + 1}</span>
                </div>
                <div className="flex gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveParagraph(index, 'up')}
                      className="btn btn-xs btn-ghost"
                      title="Mover para cima"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  )}
                  {index < safeValue.paragraphs.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveParagraph(index, 'down')}
                      className="btn btn-xs btn-ghost"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeParagraph(index)}
                    className="btn btn-xs btn-error btn-ghost gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Editor WYSIWYG */}
              <WysiwygEditor
                value={paragraph}
                onChange={(newValue) => updateParagraph(index, newValue)}
                placeholder="Digite o texto do parágrafo aqui..."
                minHeight="120px"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Imagem */}
      <div className="form-control">
        <ImageUpload
          value={safeValue.image || ''}
          onChange={(url) => updateField('image', url)}
          label="Imagem da Seção"
          folder="content"
        />
        <label className="label">
          <span className="label-text-alt">Tamanho recomendado: 400x300px</span>
        </label>
      </div>

      {/* Alt Text da Imagem */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Texto Alternativo (Alt)</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Ex: Espiritualidade católica"
          value={safeValue.imageAlt}
          onChange={(e) => updateField('imageAlt', e.target.value)}
        />
        <label className="label">
          <span className="label-text-alt">
            Descreve a imagem para acessibilidade e SEO
          </span>
        </label>
      </div>

      {/* Animação Lottie */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Animação Lottie (Abaixo da Imagem)</span>
        </label>
        <AnimationPicker
          value={safeValue.lottieUrl || 'none'}
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

      {/* Layout */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Layout da Seção</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('layout', 'text-left')}
            className={`card bg-base-100 border-2 hover:border-primary transition-all ${
              safeValue.layout === 'text-left' ? 'border-primary ring-2 ring-primary' : 'border-base-300'
            }`}
          >
            <div className="card-body p-2 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FileText className="w-5 h-5" />
                <ImageIcon className="w-5 h-5 text-base-content/40" />
              </div>
              <div className="text-xs font-semibold">Texto à Esquerda</div>
              <div className="text-[10px] text-base-content/60 leading-tight">Imagem à direita</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('layout', 'text-right')}
            className={`card bg-base-100 border-2 hover:border-primary transition-all ${
              safeValue.layout === 'text-right' ? 'border-primary ring-2 ring-primary' : 'border-base-300'
            }`}
          >
            <div className="card-body p-2 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ImageIcon className="w-5 h-5 text-base-content/40" />
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold">Texto à Direita</div>
              <div className="text-[10px] text-base-content/60 leading-tight">Imagem à esquerda</div>
            </div>
          </button>
        </div>
      </div>

      {/* Direção da Animação do Título */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Direção da Animação do Título</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={safeValue.animationDirection}
          onChange={(e) => updateField('animationDirection', e.target.value as any)}
        >
          <option value="left">Da Esquerda ← </option>
          <option value="right">Da Direita →</option>
        </select>
      </div>

      {/* Preview Info */}
      <div className="alert alert-info">
        <Info className="w-5 h-5" />
        <span className="text-sm">
          <strong>Dica:</strong> A seção tem duas colunas em desktop e empilha em mobile.
          Use HTML nos parágrafos para formatação rica (negrito, itálico, links).
        </span>
      </div>
    </div>
  );
}
