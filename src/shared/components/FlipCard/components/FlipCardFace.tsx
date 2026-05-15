'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface FlipCardFaceProps {
  title: string;
  accent: 'primary' | 'secondary';
  imageUrl?: string;
  content?: ReactNode;
}

export function FlipCardFace({ title, accent, imageUrl, content }: FlipCardFaceProps) {
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
      <div className={`relative w-full h-full flex flex-col rounded-2xl overflow-hidden border border-base-300 shadow-xl ${bgClass}`}>
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
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
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
              <div className={`flex-1 flex items-end justify-center overflow-auto text-center text-sm ${imageUrl ? 'text-white drop-shadow-lg' : ''}`}>
                {content}
              </div>
            )}
          </div>
        )}
      </div>
      {/* hover-3d shim divs required by DaisyUI */}
      <div /><div /><div /><div /><div /><div /><div /><div />
    </div>
  );
}
