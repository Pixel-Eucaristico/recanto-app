'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon, Upload, X } from 'lucide-react';
import type { OurLadyHeader } from '@/types/cms-types';

interface OurLadyHeaderEditorProps {
  value: OurLadyHeader;
  onChange: (value: OurLadyHeader) => void;
}

/**
 * Editor visual do header da página Nossa Senhora
 * Usuário vê preview em tempo real do que está editando
 */
export function OurLadyHeaderEditor({ value, onChange }: OurLadyHeaderEditorProps) {
  const [header, setHeader] = useState<OurLadyHeader>(
    value || {
      imageUrl: '/images/NSenhoraAM.svg',
      title: 'Nossa Senhora Mãe do Amor Misericordioso',
      subtitle: 'Mãe, Mestra e Formadora do Amor Misericordioso',
    }
  );

  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  useEffect(() => {
    if (value) {
      setHeader(value);
    }
  }, [value]);

  const handleChange = (field: keyof OurLadyHeader, newValue: string) => {
    const newHeader = { ...header, [field]: newValue };
    setHeader(newHeader);
    onChange(newHeader);
  };

  const handleImageSelect = (url: string) => {
    handleChange('imageUrl', url);
    setIsImagePickerOpen(false);
    setCustomImageUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Preview do Header */}
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          <h4 className="font-semibold text-sm text-base-content/60 mb-4">
            Preview do Header
          </h4>
          <div className="text-center">
            {/* Imagem */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={header.imageUrl}
                alt={header.title}
                width={150}
                height={150}
                className="drop-shadow-lg"
              />
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-semibold text-primary">
              {header.title}
            </h1>

            {/* Subtítulo */}
            <p className="mt-3 text-xl text-primary">
              {header.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Campos de Edição */}
      <div className="space-y-4">
        {/* Seletor de Imagem */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Imagem</span>
          </label>
          <button
            type="button"
            onClick={() => setIsImagePickerOpen(true)}
            className="btn btn-outline gap-2 w-full justify-start"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="flex-1 text-left truncate">
              {header.imageUrl || 'Selecionar Imagem'}
            </span>
          </button>
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Clique para escolher ou inserir URL da imagem
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
            placeholder="Nossa Senhora Mãe do Amor Misericordioso"
            value={header.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Título exibido no topo da página
            </span>
          </label>
        </div>

        {/* Subtítulo */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Subtítulo</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Mãe, Mestra e Formadora do Amor Misericordioso"
            value={header.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Subtítulo exibido abaixo do título
            </span>
          </label>
        </div>
      </div>

      {/* Modal de Seleção de Imagem */}
      {isImagePickerOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Selecionar Imagem</h3>
              <button
                onClick={() => setIsImagePickerOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Opções de Imagens Disponíveis */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Imagens Disponíveis</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      url: '/images/NSenhoraAM.svg',
                      name: 'Nossa Senhora (Padrão)',
                    },
                  ].map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => handleImageSelect(img.url)}
                      className={`card bg-base-100 border-2 hover:border-primary transition-all ${
                        header.imageUrl === img.url
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-base-300'
                      }`}
                    >
                      <div className="card-body p-4">
                        <div className="relative h-32 flex items-center justify-center">
                          <Image
                            src={img.url}
                            alt={img.name}
                            width={100}
                            height={100}
                            className="object-contain"
                          />
                        </div>
                        <div className="text-center mt-2">
                          <span className="text-sm font-semibold">{img.name}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Personalizada */}
              <div className="divider">OU</div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    URL Personalizada
                  </span>
                </label>
                <div className="join w-full">
                  <input
                    type="url"
                    className="input input-bordered join-item flex-1"
                    placeholder="https://exemplo.com/imagem.png"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageSelect(customImageUrl)}
                    className="btn btn-primary join-item"
                    disabled={!customImageUrl}
                  >
                    <Upload className="w-4 h-4" />
                    Usar URL
                  </button>
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Cole a URL de uma imagem externa
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-action">
              <button
                onClick={() => setIsImagePickerOpen(false)}
                className="btn"
              >
                Fechar
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => setIsImagePickerOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
