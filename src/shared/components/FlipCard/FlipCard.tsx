'use client';

import { useEffect, useState, ReactNode } from 'react';

/**
 * Carta com flip 3D + tilt hover-3d (DaisyUI) + suporte a imagens de fundo frente/verso.
 * Reutilizável para: flashcards de estudo, santinhos, trading cards, etc.
 *
 * Recursos:
 * - Detecta aspect natural de cada imagem via onLoad e ajusta container.
 * - Quando orientações diferem (ex: frente landscape + verso portrait), anima rotação
 *   combinada Y 180° + Z 90° pra manter imagem upright após flip.
 * - `width` sempre cabe na tela (usa `min(max, vw, vh*ratio)`).
 * - Cada face é um card DaisyUI com hover-3d separado pro efeito tilt.
 * - Badge opcional por face ("Frente"/"Verso" ou custom).
 * - Texto overlay opcional por face (com gradient pra legibilidade).
 */

export interface FlipCardProps {
  /** Conteúdo textual/react da frente (opcional quando imagem presente). */
  frontContent?: ReactNode;
  /** Conteúdo textual/react do verso (opcional quando imagem presente). */
  backContent?: ReactNode;
  /** URL imagem de fundo da frente (estilo carta colecionável). */
  frontImageUrl?: string;
  /** URL imagem de fundo do verso. */
  backImageUrl?: string;
  /** Label exibido na badge da frente. */
  frontTitle?: string;
  /** Label exibido na badge do verso. */
  backTitle?: string;
  /** Chave pra resetar flip (útil quando troca entre múltiplas cartas). */
  resetKey?: string;
  /** Callback disparado ao flipar. */
  onFlip?: (flipped: boolean) => void;
  /** Máximo de largura em rem (default 28). */
  maxWidthRem?: number;
  /** Máximo de altura em vh (default 75). */
  maxHeightVh?: number;
}

function useImageAspect(url?: string): number | null {
  const [ratio, setRatio] = useState<number | null>(null);
  useEffect(() => {
    setRatio(null);
    if (!url) return;
    const img = new Image();
    img.onload = () => setRatio(img.naturalWidth / img.naturalHeight);
    img.src = url;
  }, [url]);
  return ratio;
}

const TEXT_RATIO = 4 / 3;

export function FlipCard({
  frontContent,
  backContent,
  frontImageUrl,
  backImageUrl,
  frontTitle = 'Frente',
  backTitle = 'Verso',
  resetKey,
  onFlip,
  maxWidthRem = 28,
  maxHeightVh = 75,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const frontRatio = useImageAspect(frontImageUrl) ?? TEXT_RATIO;
  const backRatio = useImageAspect(backImageUrl) ?? TEXT_RATIO;

  useEffect(() => {
    setFlipped(false);
  }, [resetKey]);

  const frontLandscape = frontRatio >= 1;
  const backLandscape = backRatio >= 1;
  const sameOrientation = frontLandscape === backLandscape;

  const currentRatio = flipped ? backRatio : frontRatio;

  const flipTransform = flipped
    ? sameOrientation
      ? 'rotateY(180deg)'
      : 'rotateY(180deg) rotateZ(90deg)'
    : 'rotateY(0deg)';

  const backFaceTransform = sameOrientation
    ? 'rotateY(180deg)'
    : 'rotateY(180deg) rotateZ(90deg)';

  const widthStyle: React.CSSProperties = {
    aspectRatio: currentRatio,
    width: `min(${maxWidthRem}rem, 90vw, calc(${maxHeightVh}vh * ${currentRatio}))`,
    transition: 'aspect-ratio 700ms, width 700ms',
  };

  function toggle() {
    setFlipped(f => {
      const next = !f;
      onFlip?.(next);
      return next;
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
        aria-label={flipped ? `Ver ${frontTitle.toLowerCase()}` : `Ver ${backTitle.toLowerCase()}`}
      >
        <div className="[perspective:1500px]" style={widthStyle}>
          <div
            className="relative w-full h-full [transform-style:preserve-3d]"
            style={{ transform: flipTransform, transition: 'transform 700ms' }}
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <FlipCardFace
                title={frontTitle}
                accent="primary"
                imageUrl={frontImageUrl}
                content={frontContent}
              />
            </div>
            <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: backFaceTransform }}>
              <FlipCardFace
                title={backTitle}
                accent="secondary"
                imageUrl={backImageUrl}
                content={backContent}
              />
            </div>
          </div>
        </div>
      </button>
      <p className="text-xs text-base-content/50">Clique para virar</p>
    </div>
  );
}

function FlipCardFace({
  title,
  accent,
  imageUrl,
  content,
}: {
  title: string;
  accent: 'primary' | 'secondary';
  imageUrl?: string;
  content?: ReactNode;
}) {
  const bgClass = accent === 'primary' ? 'bg-base-100' : 'bg-base-200';
  const badgeClass = accent === 'primary' ? 'badge-primary' : 'badge-secondary';
  const hasContent = !!content;
  const showChrome = hasContent || !imageUrl;

  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
  }, [imageUrl]);

  return (
    <div className="hover-3d w-full h-full">
      <div
        className={`relative w-full h-full flex flex-col rounded-2xl overflow-hidden border border-base-300 shadow-xl ${bgClass}`}
      >
        {imageUrl && (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-base-200 animate-pulse flex items-center justify-center" aria-hidden>
                <span className="loading loading-spinner loading-md text-base-content/30" />
              </div>
            )}
            <img
              src={imageUrl}
              alt=""
              onLoad={() => setImgLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden
            />
            {hasContent && imgLoaded && (
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
            )}
          </>
        )}

        {showChrome && (
          <div className="relative z-10 flex flex-col h-full p-4">
            <span className={`text-xs font-semibold self-start badge ${badgeClass} badge-sm`}>{title}</span>
            {hasContent && (
              <div
                className={`flex-1 flex items-end justify-center overflow-auto text-center text-sm ${
                  imageUrl ? 'text-white drop-shadow-lg' : ''
                }`}
              >
                {content}
              </div>
            )}
          </div>
        )}
      </div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
