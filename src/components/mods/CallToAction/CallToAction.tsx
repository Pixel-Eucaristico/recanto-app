'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

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
  title,
  description,
  buttons,
  titleColor = 'primary',
  bgColor = 'base-100',
  textAlign = 'center',
  maxWidth = '6xl',
  paddingY = 'lg',
}: CallToActionProps) {
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
          className={`text-3xl md:text-4xl font-semibold ${titleColorClasses[titleColor]} mb-4`}
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg md:text-xl text-base-content/80 mb-8"
        >
          {description}
        </motion.p>

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
              className={`btn ${buttonStyleClasses[button.style || 'primary']} btn-lg`}
            >
              {button.text}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
