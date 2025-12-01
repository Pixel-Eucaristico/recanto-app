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
}

/**
 * Mod: Grid de cards do infográfico Nossa Senhora
 * Exibe cards em layout de colunas com animações
 */
export function InfographicGrid({ cards = [], titleFont = 'Montserrat', bodyFont = 'Lora' }: InfographicGridProps) {
  // Não renderizar se não tiver cards
  if (!cards || cards.length === 0) {
    return null;
  }
  return (
    <div className="px-6 pb-12 max-w-4xl mx-auto font-nossa-senhora-body">
      <main className="columns-1 md:columns-2 gap-6">
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

function CardInfografico({ card, index, titleFont, bodyFont }: CardInfograficoProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    if (card.lottieFile && card.lottieFile !== 'none') {
      fetch(`/animations/${card.lottieFile}`)
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
      viewport={{ once: true, amount: 0.4 }}
      className="break-inside-avoid pl-4 flex flex-col items-start gap-4 bg-base-100 p-2"
    >
      <h3
        className="w-full bg-primary rounded-lg px-3 text-xl text-secondary font-semibold"
        style={{ fontFamily: titleFont === 'system-ui' ? 'system-ui' : `'${titleFont}', sans-serif` }}
      >
        {index + 1}. {card.title}
      </h3>
      <div>
        {/* Animação Lottie ou Ícone */}
        {animationData ? (
          <div className={`w-12 h-12 flex-shrink-0 ${card.imagePosition} mr-3`}>
            <Lottie
              autoplay
              loop
              animationData={animationData}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        ) : card.iconName ? (
          <div className={`w-12 h-12 flex-shrink-0 ${card.imagePosition} mr-3 flex items-center justify-center`}>
            {(() => {
              const IconComponent = LucideIcons[card.iconName as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; className?: string }>;
              return IconComponent ? <IconComponent size={48} className="text-accent" /> : null;
            })()}
          </div>
        ) : null}

        {/* Corpo do Card */}
        <p
          className="mt-1 text-base text-base-content"
          style={{ fontFamily: bodyFont === 'system-ui' ? 'system-ui' : `'${bodyFont}', serif` }}
          dangerouslySetInnerHTML={{ __html: card.body }}
        />
      </div>
    </motion.div>
  );
}
