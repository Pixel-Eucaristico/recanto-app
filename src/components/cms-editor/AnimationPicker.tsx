'use client';

import { useState, useEffect } from 'react';
import { Film, X, Check } from 'lucide-react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface AnimationPickerProps {
  value: string;
  onChange: (value: string) => void;
}

interface Animation {
  id: string;
  name: string;
  file: string | null;
}

/**
 * Seletor visual de animações Lottie
 * Lista automaticamente os arquivos de public/animations/
 * Modal com previews - usuário VÊ o que está escolhendo!
 */
export function AnimationPicker({ value = 'none', onChange }: AnimationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [previewData, setPreviewData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [availableAnimations, setAvailableAnimations] = useState<Animation[]>([
    { id: 'none', name: 'Sem Animação', file: null },
  ]);
  const [loading, setLoading] = useState(true);

  // Carregar lista de animações disponíveis
  useEffect(() => {
    fetch('/api/animations')
      .then((res) => res.json())
      .then((data) => {
        setAvailableAnimations(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao carregar animações:', error);
        setLoading(false);
      });
  }, []);

  // Carregar preview da animação selecionada
  useEffect(() => {
    if (selected && selected !== 'none') {
      // Se for uma URL customizada (começa com http)
      if (selected.startsWith('http')) {
        fetch(selected)
          .then((res) => res.json())
          .then((data) => setPreviewData(data))
          .catch(() => setPreviewData(null));
      } else {
        // Se for um arquivo local
        fetch(`/animations/${selected}`)
          .then((res) => res.json())
          .then((data) => setPreviewData(data))
          .catch(() => setPreviewData(null));
      }
    } else {
      setPreviewData(null);
    }
  }, [selected]);

  const handleSelect = (animationId: string) => {
    setSelected(animationId);
    onChange(animationId);
    setIsOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar se é JSON
    if (!file.name.endsWith('.json')) {
      setUploadError('Por favor, selecione um arquivo JSON válido');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Ler o conteúdo do arquivo
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Validar se é uma animação Lottie válida (verifica se tem propriedades básicas)
      if (!jsonData.v || !jsonData.layers) {
        setUploadError('JSON não é uma animação Lottie válida');
        setUploading(false);
        return;
      }

      // Criar FormData para upload
      const formData = new FormData();
      formData.append('file', file);

      // Fazer upload para o servidor
      const response = await fetch('/api/animations/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const { filename } = await response.json();

      // Selecionar a animação recém-enviada
      setSelected(filename);
      onChange(filename);

      // Recarregar lista de animações
      fetch('/api/animations')
        .then((res) => res.json())
        .then((data) => setAvailableAnimations(data))
        .catch(console.error);

      setIsOpen(false);
      setUploadError(null);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadError(error instanceof Error ? error.message : 'Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const selectedAnimation = availableAnimations.find((a) => a.id === selected);
  const isCustomUrl = selected && selected !== 'none' && !selectedAnimation;

  return (
    <div>
      {/* Botão para abrir modal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-outline gap-2 w-full justify-start"
      >
        <Film className="w-4 h-4" />
        <span className="flex-1 text-left truncate">
          {isCustomUrl ? 'URL Personalizada' : (selectedAnimation?.name || 'Selecionar Animação')}
        </span>
        <span className="badge badge-sm">{selected === 'none' ? 'Nenhuma' : 'Selecionada'}</span>
      </button>

      {/* Preview da animação selecionada */}
      {previewData && (
        <div className="mt-3 p-3 bg-base-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold">Animação Selecionada:</span>
            <span className="text-sm truncate">
              {isCustomUrl ? selected : selectedAnimation?.name}
            </span>
          </div>
          <div className="w-full h-32 flex items-center justify-center bg-base-100 rounded">
            <Lottie animationData={previewData} loop className="h-full" />
          </div>
        </div>
      )}

      {/* Modal de seleção */}
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Selecionar Animação</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid de animações */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto mb-4">
              {loading ? (
                <div className="col-span-2 md:col-span-3 flex items-center justify-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                  <span className="ml-3">Carregando animações...</span>
                </div>
              ) : (
                availableAnimations.map((animation) => (
                <button
                  key={animation.id}
                  type="button"
                  onClick={() => handleSelect(animation.id)}
                  className={`card bg-base-100 border-2 hover:border-primary transition-all ${
                    selected === animation.id ? 'border-primary ring-2 ring-primary' : 'border-base-300'
                  }`}
                >
                  <div className="card-body p-4">
                    {/* Preview */}
                    {animation.file ? (
                      <AnimationPreview file={animation.file} />
                    ) : (
                      <div className="h-24 flex items-center justify-center bg-base-200 rounded">
                        <X className="w-8 h-8 text-base-content/40" />
                      </div>
                    )}

                    {/* Nome */}
                    <div className="text-center mt-2">
                      <span className="text-sm font-semibold">{animation.name}</span>
                      {selected === animation.id && (
                        <div className="badge badge-primary badge-sm mt-1">Selecionada</div>
                      )}
                    </div>
                  </div>
                </button>
              ))
              )}
            </div>

            {/* Opção de Upload de Arquivo */}
            <div className="divider">OU</div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Enviar Arquivo JSON</span>
              </label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="file-input file-input-bordered w-full"
                disabled={uploading}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Envie um arquivo JSON de animação Lottie (salvo em public/animations/)
                </span>
              </label>
              {uploading && (
                <div className="alert alert-info mt-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Enviando animação...</span>
                </div>
              )}
              {uploadError && (
                <div className="alert alert-error mt-2">
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Opção de URL customizada */}
            <div className="divider">OU</div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">URL Personalizada (JSON Lottie)</span>
              </label>
              <div className="join w-full">
                <input
                  type="url"
                  className="input input-bordered join-item flex-1"
                  placeholder="https://assets.lottiefiles.com/..."
                  value={selected.startsWith('http') ? selected : ''}
                  onChange={(e) => setSelected(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (selected.startsWith('http')) {
                      onChange(selected);
                      setIsOpen(false);
                    }
                  }}
                  className="btn btn-primary join-item"
                  disabled={!selected.startsWith('http')}
                >
                  Usar URL
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Cole a URL de uma animação Lottie (ex: LottieFiles.com)
                </span>
              </label>
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

/**
 * Componente auxiliar para preview de cada animação
 */
function AnimationPreview({ file }: { file: string }) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(`/animations/${file}`)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(() => setAnimationData(null));
  }, [file]);

  if (!animationData) {
    return (
      <div className="h-24 flex items-center justify-center bg-base-200 rounded animate-pulse">
        <span className="text-xs">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="h-24 flex items-center justify-center bg-base-200 rounded">
      <Lottie animationData={animationData} loop className="h-full" />
    </div>
  );
}
