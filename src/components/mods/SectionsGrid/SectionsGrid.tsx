'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import * as FontAwesomeIcons from 'react-icons/fa';

export interface InfoSection {
  icon: string;
  title: string;
  content: string;
  iconColor?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
}

export interface SectionsGridProps {
  sections: InfoSection[];
  columns?: '1' | '2' | '3';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * SectionsGrid - Grade de seções informativas com ícones
 * Perfeito para apresentar informações institucionais, história, valores
 */
export function SectionsGrid({
  sections = [],
  columns = '1',
  bgColor = 'base-100',
  maxWidth = '6xl',
  spacing = 'lg',
}: SectionsGridProps) {
  // Não renderizar se não tiver seções
  if (sections.length === 0) {
    return null;
  }
  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const bgColorClasses = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
    'base-300': 'bg-base-300',
  };

  const columnClasses = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  const spacingClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10',
  };

  const paddingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-20',
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
    <section className={`w-full ${paddingClasses[spacing]} px-6 ${bgColorClasses[bgColor]}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        <div className={`grid ${columnClasses[columns]} ${spacingClasses[spacing]}`}>
          {sections.map((section, index) => {
            // Suporta tanto Lucide quanto Font Awesome
            const IconComponent = section.icon.startsWith('Fa')
              ? (FontAwesomeIcons as any)[section.icon] // Font Awesome (ex: FaHeart)
              : (LucideIcons as any)[section.icon];     // Lucide (ex: Heart)

            // Fallback se ícone não for encontrado
            const FinalIcon = IconComponent || LucideIcons.HelpCircle;

            // Log warning se ícone não for encontrado
            if (!IconComponent) {
              console.warn(`⚠️ [SectionsGrid] Ícone "${section.icon}" não encontrado.`, {
                sectionTitle: section.title,
              });
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-base-100 rounded-box shadow-lg p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow"
              >
                {/* Cabeçalho com ícone e título */}
                <div className="flex items-center gap-3">
                  <FinalIcon
                    size={24}
                    className={iconColorClasses[section.iconColor || 'primary']}
                    strokeWidth={2}
                  />
                  <h3 className={`text-lg md:text-xl font-semibold ${iconColorClasses[section.iconColor || 'primary']}`}>
                    {section.title}
                  </h3>
                </div>

                {/* Conteúdo */}
                <div
                  className="text-base text-base-content/90 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
