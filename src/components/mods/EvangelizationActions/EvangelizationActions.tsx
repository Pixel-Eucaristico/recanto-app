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

const defaultActions: EvangelizationItem[] = [
  {
    title: 'Catequese Infantil',
    description: 'Formação catequética para crianças, preparando para os sacramentos.',
    icon: 'BookOpen',
    audience: 'Crianças de 7 a 12 anos',
  },
  {
    title: 'Grupos de Jovens',
    description: 'Encontros semanais para jovens com partilhas, orações e atividades.',
    icon: 'Users',
    audience: 'Jovens de 13 a 25 anos',
  },
  {
    title: 'Pastoral Familiar',
    description: 'Acompanhamento e formação para famílias, fortalecendo os laços na fé.',
    icon: 'Heart',
    audience: 'Famílias e casais',
  },
];

export default function EvangelizationActions({
  title = 'Nossa Evangelização',
  subtitle = 'Conheça as formas como levamos a Palavra de Deus a diferentes públicos',
  actions,
  ctaText = 'Conheça Todas as Ações',
  ctaLink = '/acoes-projetos-evangelizacao'
}: EvangelizationActionsProps) {
  // Parse actions from JSON string or use default
  let parsedActions: EvangelizationItem[] = defaultActions;

  if (actions) {
    try {
      parsedActions = JSON.parse(actions);
    } catch (error) {
      console.error('Failed to parse actions:', error);
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 bg-base-200">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-base-content mb-4">
          {title}
        </h2>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {parsedActions.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Sparkles;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300"
            >
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                <h3 className="card-title text-xl text-base-content mb-3">
                  {item.title}
                </h3>
                <p className="text-base-content/80 leading-relaxed mb-4">
                  {item.description}
                </p>
                <div className="badge badge-outline badge-lg">
                  {item.audience}
                </div>
              </div>
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
