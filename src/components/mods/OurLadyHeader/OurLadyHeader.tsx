'use client';

import Image from 'next/image';
import type { OurLadyHeader as OurLadyHeaderType } from '@/types/cms-types';

interface OurLadyHeaderProps {
  header?: OurLadyHeaderType;
  titleFont?: string;
  subtitleFont?: string;
}

/**
 * Mod: Header da página Nossa Senhora
 * Exibe imagem, título e subtítulo centralizados
 */
export function OurLadyHeader({ header, titleFont = 'Playfair Display', subtitleFont = 'Lora' }: OurLadyHeaderProps) {
  // Não renderizar se não tiver header ou conteúdo essencial
  if (!header || (!header.title && !header.subtitle)) {
    return null;
  }
  return (
    <div className="px-6 py-12 max-w-4xl mx-auto font-nossa-senhora-body">
      <header className="text-center mb-10">
        {header.imageUrl && (
          <Image
            src={header.imageUrl}
            alt={header.title || "Imagem"}
            width={150}
            height={150}
            className="mx-auto mb-4 drop-shadow-lg"
          />
        )}
        {header.title && (
          <h1
            className="text-4xl md:text-5xl font-semibold text-primary"
            style={{ fontFamily: titleFont === 'system-ui' ? 'system-ui' : `'${titleFont}', serif` }}
          >
            {header.title}
          </h1>
        )}
        {header.subtitle && (
          <p
            className="mt-4 text-2xl text-primary"
            style={{ fontFamily: subtitleFont === 'system-ui' ? 'system-ui' : `'${subtitleFont}', serif` }}
          >
            {header.subtitle}
          </p>
        )}
      </header>
    </div>
  );
}
