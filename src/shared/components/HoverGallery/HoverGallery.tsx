'use client';

/**
 * HoverGallery — wrapper genérico do componente `hover-gallery` da DaisyUI.
 *
 * DaisyUI divide a largura em N segmentos iguais (uma por imagem) e mostra a imagem
 * correspondente à posição X do cursor. Sem hover, exibe a primeira.
 *
 * Reutilizável em qualquer feature: capa de livro (capa/contracapa), produtos,
 * ícones de santinhos, perfis com fotos múltiplas, etc.
 */

interface HoverGalleryImage {
  src: string;
  alt: string;
}

interface HoverGalleryProps {
  images: HoverGalleryImage[];
  /** Classes extras pro wrapper externo. */
  className?: string;
  /** Object-fit aplicado a todas as imagens. Default 'cover'. */
  objectFit?: 'cover' | 'contain';
}

export function HoverGallery({ images, className = 'w-full h-full', objectFit = 'cover' }: HoverGalleryProps) {
  if (images.length === 0) return null;
  const fitClass = objectFit === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div className={`hover-gallery ${className}`}>
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img.src}
          alt={img.alt}
          className={`w-full h-full ${fitClass}`}
        />
      ))}
    </div>
  );
}
