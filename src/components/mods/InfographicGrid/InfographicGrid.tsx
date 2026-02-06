'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import * as LucideIcons from 'lucide-react';
import type { InfographicCard } from '@/types/cms-types';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface InfographicGridProps {
  cards?: InfographicCard[];
  titleFont?: string;
  bodyFont?: string;
  columns?: number;
}

/**
 * Mod: Grid de cards do infográfico Nossa Senhora
 * Exibe cards em layout de colunas com animações
 */
export function InfographicGrid({ 
  cards = [], 
  titleFont = 'Montserrat', 
  bodyFont = 'Lora',
  columns = 2
}: InfographicGridProps) {
  // Garantir que columns seja um número (o CMS pode passar como string)
  const numCols = Number(columns);

  // Não renderizar se não tiver cards
  if (!cards || cards.length === 0) {
    return null;
  }
  return (
    <div className="px-6 pb-12 max-w-4xl mx-auto font-nossa-senhora-body">
      <main 
        className={`grid gap-6 transition-all duration-500 ease-in-out ${
          numCols === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {cards.map((card, index) => (
          <CardInfografico
            key={card.id}
            card={card}
            index={index}
            titleFont={titleFont}
            bodyFont={bodyFont}
          />
        ))}
      </main>
    </div>
  );
}

interface CardInfograficoProps {
  card: InfographicCard;
  index: number;
  titleFont: string;
  bodyFont: string;
}

import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

function CardInfografico({ card, index, titleFont, bodyFont }: CardInfograficoProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    if (card.lottieFile && card.lottieFile !== 'none') {
      const { getLottieUrl } = require("@/utils/lottie-utils");
      const finalUrl = getLottieUrl(card.lottieFile);

      fetch(finalUrl)
        .then((res) => res.json())
        .then((data) => setAnimationData(data))
        .catch(() => setAnimationData(null));
    }
  }, [card.lottieFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      className="flex flex-col items-start gap-4 bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 h-full"
    >
      <h3
        className="w-full bg-primary rounded-lg px-3 py-1 text-xl text-secondary font-semibold leading-tight"
        style={{ fontFamily: titleFont === 'system-ui' ? 'system-ui' : `'${titleFont}', sans-serif` }}
      >
        <MarkdownRenderer content={`${index + 1}. ${card.title}`} />
      </h3>
      <div className="w-full">
        {/* Animação Lottie ou Ícone */}
        {animationData || (card.iconName && card.iconName !== 'none') ? (
          <div className={`w-14 h-14 flex-shrink-0 mb-3 ${card.imagePosition === 'float-start' || card.imagePosition === 'float-left' ? 'float-start mr-4' : 'float-end ml-4'}`}>
            {animationData ? (
              <Lottie
                autoplay
                loop
                animationData={animationData}
                style={{ height: '100%', width: '100%' }}
              />
            ) : card.iconName ? (
              <div className="w-full h-full flex items-center justify-center">
                {(() => {
                  const IconComponent = LucideIcons[card.iconName as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; className?: string }>;
                  return IconComponent ? <IconComponent size={56} className="text-accent" /> : null;
                })()}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Corpo do Card */}
        <div
          className="text-base text-base-content leading-relaxed"
          style={{ fontFamily: bodyFont === 'system-ui' ? 'system-ui' : `'${bodyFont}', serif` }}
        >
          <MarkdownRenderer content={card.body} />
        </div>
      </div>
    </motion.div>
  );
}
