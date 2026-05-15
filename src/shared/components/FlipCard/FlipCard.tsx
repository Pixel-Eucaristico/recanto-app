'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useImageAspect } from './hooks/useImageAspect';
import { FlipCardFace } from './components/FlipCardFace';

export interface FlipCardProps {
  frontContent?: ReactNode;
  backContent?: ReactNode;
  frontImageUrl?: string;
  backImageUrl?: string;
  frontTitle?: string;
  backTitle?: string;
  resetKey?: string;
  onFlip?: (flipped: boolean) => void;
  maxWidthRem?: number;
  maxHeightVh?: number;
}

const TEXT_RATIO = 4 / 3;

export function FlipCard({
  frontContent, backContent,
  frontImageUrl, backImageUrl,
  frontTitle = 'Frente', backTitle = 'Verso',
  resetKey, onFlip,
  maxWidthRem = 28, maxHeightVh = 75,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const frontRatio = useImageAspect(frontImageUrl) ?? TEXT_RATIO;
  const backRatio = useImageAspect(backImageUrl) ?? TEXT_RATIO;

  useEffect(() => { setFlipped(false); }, [resetKey]);

  const frontLandscape = frontRatio >= 1;
  const backLandscape = backRatio >= 1;
  const sameOrientation = frontLandscape === backLandscape;
  const currentRatio = flipped ? backRatio : frontRatio;

  const flipTransform = flipped
    ? sameOrientation ? 'rotateY(180deg)' : 'rotateY(180deg) rotateZ(90deg)'
    : 'rotateY(0deg)';

  const backFaceTransform = sameOrientation ? 'rotateY(180deg)' : 'rotateY(180deg) rotateZ(90deg)';

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
              <FlipCardFace title={frontTitle} accent="primary" imageUrl={frontImageUrl} content={frontContent} />
            </div>
            <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: backFaceTransform }}>
              <FlipCardFace title={backTitle} accent="secondary" imageUrl={backImageUrl} content={backContent} />
            </div>
          </div>
        </div>
      </button>
      <p className="text-xs text-base-content/50">Clique para virar</p>
    </div>
  );
}
