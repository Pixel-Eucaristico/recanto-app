'use client';

import { motion } from 'framer-motion';

export interface TextIntroProps {
  content: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  textSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * TextIntro - Seção de introdução/texto centralizado
 * Perfeito para mensagens de boas-vindas e introduções
 */
export function TextIntro({
  content = "",
  maxWidth = '5xl',
  textSize = 'xl',
  bgColor = 'base-100',
  paddingY = 'lg',
}: TextIntroProps) {
  // Não renderizar se não tiver conteúdo
  if (!content) {
    return null;
  }
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  const textSizeClasses = {
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
  };

  const bgColorClasses = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
    'base-300': 'bg-base-300',
  };

  const paddingClasses = {
    sm: 'py-10',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24',
  };

  return (
    <section className={`w-full ${paddingClasses[paddingY]} px-6 ${bgColorClasses[bgColor]}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto text-center`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`${textSizeClasses[textSize]} text-base-content`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}
