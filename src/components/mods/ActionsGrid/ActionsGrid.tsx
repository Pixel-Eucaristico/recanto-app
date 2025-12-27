'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export interface ActionCard {
  title: string;
  description: string;
  image: string;
}

export interface ActionsGridProps {
  title?: string;
  actions?: ActionCard[];
  titleColor?: 'primary' | 'secondary' | 'accent';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  columns?: '1' | '2' | '3' | '4';
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl';
}

/**
 * ActionsGrid - Grid de cards de ações com imagem, título e descrição
 * Perfeito para mostrar ações, serviços, projetos
 */
export function ActionsGrid({
  title = "",
  actions = [],
  titleColor = "primary",
  bgColor = "base-100",
  columns = "2",
  maxWidth = "5xl",
}: ActionsGridProps) {
  // Não renderizar se não tiver conteúdo essencial
  if (!title && actions.length === 0) {
    return null;
  }

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

  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  const columnClasses = {
    '1': 'md:grid-cols-1',
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
  };

  return (
    <section className={`card py-16 px-6 ${bgColorClasses[bgColor]} w-full ${maxWidthClasses[maxWidth]} mx-auto flex flex-col items-center`}>
      {title && (
        <motion.h3 className={`text-3xl font-semibold ${titleColorClasses[titleColor]} mb-8 text-center`}>
          {title}
        </motion.h3>
      )}

      <div className={`grid ${columnClasses[columns]} gap-8`}>
        {actions.map((action, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center text-center space-y-4"
          >
            {action.image && (
              <Image
                src={action.image}
                alt={action.title}
                width={300}
                height={200}
                className="rounded-lg shadow-md"
              />
            )}
            {action.title && (
              <h4 className="text-xl font-semibold">{action.title}</h4>
            )}
            {action.description && (
              <p>{action.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
