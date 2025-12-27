'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export interface Pillar {
  icon: string;
  lottie?: string;
  title: string;
  description: string;
  iconColor?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
  buttonLink?: string;
}

export interface PillarsGridProps {
  title?: string;
  pillars?: Pillar[];
  columns?: '2' | '3' | '4';
  titleColor?: 'primary' | 'secondary' | 'accent';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

/**
 * Componente interno para renderizar a animação Lottie
 */
function PillarLottie({ file }: { file: string }) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    if (file) {
      // Se for URL completa (ex: lottiefiles)
      if (file.startsWith('http')) {
        fetch(file)
          .then((res) => res.json())
          .then((data) => setAnimationData(data))
          .catch(console.error);
      } else {
        // Se for arquivo local
        fetch(`/animations/${file}`)
          .then((res) => res.json())
          .then((data) => setAnimationData(data))
          .catch(console.error);
      }
    }
  }, [file]);

  if (!animationData) return <div className="h-40 w-40 bg-base-200 rounded animate-pulse" />;

  return <Lottie animationData={animationData} loop className="h-40 mx-auto" />;
}

/**
 * PillarsGrid - Grade de pilares/features com ícones ou Lottie
 * Perfeito para mostrar valores, pilares, características
 */
export function PillarsGrid({
  title = "",
  pillars = [],
  columns = '4',
  titleColor = 'primary',
  bgColor = 'base-100',
  maxWidth = '6xl',
}: PillarsGridProps) {
  // Não renderizar se não tiver conteúdo essencial
  if (!title && pillars.length === 0) {
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

  const bgColorClasses = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
    'base-300': 'bg-base-300',
  };

  const columnClasses = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-2 lg:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-4',
  };

  const iconColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  };

  return (
    <section className={`w-full py-20 px-6 ${bgColorClasses[bgColor]} ${maxWidthClasses[maxWidth]} mx-auto`}>
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`text-3xl md:text-4xl font-semibold ${titleColorClasses[titleColor]} mb-10 text-center`}
        >
          {title}
        </motion.h2>
      )}

      <div className={`grid grid-cols-1 ${columnClasses[columns]} gap-8`}>
        {pillars.map((pillar, index) => {
          // Mapeamento de ícones antigos do Font Awesome para Lucide
          const iconMapping: Record<string, string> = {
            // Font Awesome -> Lucide
            'FaBook': 'Book',
            'FaHeart': 'Heart',
            'FaHandsHelping': 'HandHelping',
            'FaPray': 'HandHeart',
            'FaChurch': 'Home',
            'FaCross': 'Cross',
            'FaUsers': 'Users',
            'FaBible': 'BookOpen',
            // Adicione outros mapeamentos conforme necessário
          };

          // Tenta mapear o ícone antigo ou usa o valor direto
          const iconName = iconMapping[pillar.icon] || pillar.icon;
          const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card bg-base-100 shadow-xl p-6 items-center text-center hover:shadow-2xl transition-shadow h-full"
            >
              <div className="mb-4">
                {pillar.lottie && pillar.lottie !== 'none' ? (
                  <PillarLottie file={pillar.lottie} />
                ) : (
                  <IconComponent
                    size={40}
                    className={iconColorClasses[pillar.iconColor || 'primary']}
                    strokeWidth={2}
                  />
                )}
              </div>
              <h3 className="font-bold text-lg mb-2 text-base-content">
                {pillar.title}
              </h3>
              <p className="text-sm text-base-content/80 mb-4 flex-grow">{pillar.description}</p>
              
              {pillar.buttonText && pillar.buttonLink && (
                <Link href={pillar.buttonLink} className="btn btn-primary mt-auto">
                  {pillar.buttonText}
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
