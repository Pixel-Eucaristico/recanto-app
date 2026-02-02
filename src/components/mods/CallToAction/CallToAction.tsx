'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

export interface CTAButton {
  text: string;
  url: string;
  style?: 'primary' | 'secondary' | 'accent' | 'outline';
}

export interface CallToActionProps {
  title: string;
  description: string;
  buttons: CTAButton[];
  titleColor?: 'primary' | 'secondary' | 'accent';
  titleSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * CallToAction - Seção de chamada para ação com botões
 * Perfeito para CTAs, convites, inscrições
 */
export function CallToAction({
  title = "",
  description = "",
  buttons = [],
  titleColor = 'primary',
  titleSize = 'xl',
  buttonSize = 'md',
  bgColor = 'base-100',
  textAlign = 'center',
  maxWidth = '6xl',
  paddingY = 'lg',
}: CallToActionProps) {
  // Não renderizar se não tiver título nem botões
  if (!title && buttons.length === 0) {
    return null;
  }
  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const titleColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  };

  const titleSizeClasses = {
    sm: 'text-xl md:text-2xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
    xl: 'text-4xl md:text-5xl',
    '2xl': 'text-5xl md:text-6xl',
  };

  const bgColorClasses = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
    'base-300': 'bg-base-300',
  };

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const paddingClasses = {
    sm: 'py-10',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24',
  };

  const buttonStyleClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    outline: 'btn-outline',
  };

  const buttonSizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  const justifyClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <section className={`w-full ${paddingClasses[paddingY]} px-6 ${bgColorClasses[bgColor]}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${textAlignClasses[textAlign]}`}>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`${titleSizeClasses[titleSize]} font-semibold ${titleColorClasses[titleColor]} mb-4`}
        >
          <MarkdownRenderer content={title} />
        </motion.h2>

        {description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-base-content/80 mb-8 font-md-container"
          >
            <MarkdownRenderer content={description} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className={`flex flex-wrap ${justifyClasses[textAlign]} gap-4`}
        >
          {buttons.map((button, index) => (
            <Link
              key={index}
              href={button.url}
              className={`btn ${buttonStyleClasses[button.style || 'primary']} ${buttonSizeClasses[buttonSize]}`}
            >
              {button.text}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
