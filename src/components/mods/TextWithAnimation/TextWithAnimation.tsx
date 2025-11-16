'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export interface TextWithAnimationProps {
  title: string;
  paragraphs: string[];
  animation?: string; // Nome do arquivo ou 'none'
  layout?: 'text-left' | 'text-right';
  titleColor?: 'primary' | 'secondary' | 'accent';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

/**
 * TextWithAnimation - Seção de texto com animação Lottie
 * Ideal para História, Carisma, Padroeira, etc.
 */
export function TextWithAnimation({
  title,
  paragraphs,
  animation,
  layout = 'text-left',
  titleColor = 'primary',
  bgColor = 'base-100',
  maxWidth = '6xl',
}: TextWithAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  // Carregar animação dinamicamente
  useEffect(() => {
    if (animation && animation !== 'none') {
      fetch(`/animations/${animation}`)
        .then((res) => res.json())
        .then((data) => setAnimationData(data))
        .catch((err) => console.error('Erro ao carregar animação:', err));
    }
  }, [animation]);
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

  return (
    <section className={`w-full py-20 px-6 ${bgColorClasses[bgColor]} ${maxWidthClasses[maxWidth]} mx-auto`}>
      <motion.h2
        initial={{ opacity: 0, x: layout === 'text-left' ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className={`text-3xl md:text-4xl font-semibold ${titleColorClasses[titleColor]} mb-6`}
      >
        {title}
      </motion.h2>

      <div className={`grid md:grid-cols-2 gap-10 items-center`}>
        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={`space-y-4 text-justify ${
            layout === 'text-right' ? 'order-2' : 'order-1'
          }`}
        >
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-base md:text-lg text-base-content">
              {paragraph}
            </p>
          ))}
        </motion.div>

        {/* Animação Lottie */}
        {animationData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className={`h-64 md:h-80 flex items-center justify-center ${
              layout === 'text-right' ? 'order-1' : 'order-2'
            }`}
          >
            <Lottie
              animationData={animationData}
              loop
              className="w-full h-full"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
