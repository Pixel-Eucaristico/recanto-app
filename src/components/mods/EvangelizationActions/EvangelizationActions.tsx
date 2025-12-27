'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Heart, UserPlus, Home, Sparkles } from 'lucide-react';

interface EvangelizationItem {
  id?: number;
  title: string;
  description: string;
  icon: string;
  audience: string;
}

interface EvangelizationActionsProps {
  title?: string;
  subtitle?: string;
  actions?: string; // JSON string
  ctaText?: string;
  ctaLink?: string;
}

// Mapeamento de ícones
const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Users,
  Heart,
  UserPlus,
  Home,
  Sparkles,
};



export default function EvangelizationActions({
  title = "",
  subtitle = "",
  actions,
  ctaText = "",
  ctaLink = "",
  bgColor = "base-200"
}: EvangelizationActionsProps & { bgColor?: 'base-100' | 'base-200' | 'base-300' }) {
  // Parse actions from JSON string or use default
  let parsedActions: EvangelizationItem[] = [];

  if (actions) {
    try {
      parsedActions = JSON.parse(actions);
    } catch (error) {
      console.error('Failed to parse actions:', error);
    }
  }

  // Não renderizar se não tiver conteúdo essencial
  if (!title && !subtitle && parsedActions.length === 0) {
    return null;
  }

  const bgColorClasses = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
    'base-300': 'bg-base-300',
  };

  return (
    <section className={`max-w-5xl mx-auto px-6 py-16 ${bgColorClasses[bgColor] || 'bg-base-200'}`}>
      <div className="text-center mb-12">
        {title && (
          <h2 className="text-4xl font-bold text-base-content mb-4">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {parsedActions.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Sparkles;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="mb-6">
                <IconComponent className="w-16 h-16 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-3">
                {item.title}
              </h3>
              <p className="text-base-content/80 leading-relaxed max-w-xs">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {ctaText && ctaLink && (
        <div className="text-center mt-12">
          <motion.a
            href={ctaLink}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {ctaText}
          </motion.a>
        </div>
      )}
    </section>
  );
}
