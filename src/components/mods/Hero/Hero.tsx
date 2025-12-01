import Image from 'next/image';

interface HeroProps {
  title?: string;
  subtitle?: string;
  theme?: 'primary' | 'secondary' | 'accent';
  imageUrl?: string;
  imageOpacity?: '100' | '80' | '60' | '40' | '20' | '10';
  ctaText?: string;
  ctaLink?: string;
}

/**
 * Mod Hero - Seção de destaque com título, subtítulo e imagem
 * Usado em páginas principais para destacar conteúdo importante
 */
export default function Hero({
  title = "",
  subtitle = "",
  theme = 'primary',
  imageUrl,
  imageOpacity = '40',
  ctaText,
  ctaLink
}: HeroProps) {
  // Não renderizar se não tiver conteúdo essencial
  if (!title && !subtitle) {
    return null;
  }
  const opacityClasses = {
    '100': 'opacity-100',
    '80': 'opacity-80',
    '60': 'opacity-60',
    '40': 'opacity-40',
    '20': 'opacity-20',
    '10': 'opacity-10',
  };

  return (
    <div className={`hero min-h-screen bg-${theme}`}>
      <div className="hero-content flex-col lg:flex-row-reverse">
        {imageUrl && (
          <div className="relative w-full max-w-sm h-64 lg:h-96">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className={`rounded-lg shadow-2xl object-cover ${opacityClasses[imageOpacity]}`}
            />
          </div>
        )}
        <div>
          {title && <h1 className="text-5xl font-bold">{title}</h1>}
          {subtitle && <p className="py-6">{subtitle}</p>}
          {ctaText && ctaLink && (
            <a href={ctaLink} className="btn btn-primary">
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
