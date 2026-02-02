'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

interface HeroMissionProps {
  title?: string;
  description?: string;
  titleSize?: 'sm' | 'md' | 'lg' | 'xl';
  titleColor?: 'white' | 'primary' | 'secondary' | 'accent';
  descSize?: 'sm' | 'md' | 'lg';
  descColor?: 'white' | 'white-calm';
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  overlayOpacity?: '90' | '80' | '70' | '60' | '50' | '40' | '30' | '20' | '10';
}

const titleSizeClasses = {
  sm: 'text-3xl md:text-4xl',
  md: 'text-4xl md:text-5xl', // padrão
  lg: 'text-5xl md:text-6xl',
  xl: 'text-6xl md:text-7xl',
};

const titleColorClasses = {
  white: 'text-white',
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
};

const descSizeClasses = {
  sm: 'text-base',
  md: 'text-lg', // padrão
  lg: 'text-xl md:text-2xl',
};

const descColorClasses = {
  white: 'text-white',
  'white-calm': 'text-white/90',
};

export default function HeroMission({
  title = "",
  description = "",
  titleSize = "md",
  titleColor = "white",
  descSize = "md",
  descColor = "white-calm",
  buttonText = "",
  buttonLink = "",
  backgroundImage = "",
  overlayOpacity = '50'
}: HeroMissionProps) {
  // Não renderizar se não tiver conteúdo essencial
  if (!title && !description) {
    return null;
  }
  const overlayOpacityClasses = {
    '90': 'bg-black/90',
    '80': 'bg-black/80',
    '70': 'bg-black/70',
    '60': 'bg-black/60',
    '50': 'bg-black/50',
    '40': 'bg-black/40',
    '30': 'bg-black/30',
    '20': 'bg-black/20',
    '10': 'bg-black/10',
  };

  return (
    <div
      className="hero min-h-screen relative"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className={`hero-overlay ${overlayOpacityClasses[overlayOpacity]}`} />

      <div className="hero-content text-neutral-content text-center z-10">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
        >
          {title && (
            <h1 className={`mb-5 font-bold drop-shadow-lg ${titleSizeClasses[titleSize]} ${titleColorClasses[titleColor]}`}>
              <MarkdownRenderer content={title} />
            </h1>
          )}
          {description && (
            <div className={`mb-8 drop-shadow-md ${descSizeClasses[descSize]} ${descColorClasses[descColor]}`}>
              <MarkdownRenderer content={description} />
            </div>
          )}
          {buttonText && buttonLink && (
            <Link href={buttonLink}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-lg text-white shadow-lg"
              >
                {buttonText}
              </motion.button>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
