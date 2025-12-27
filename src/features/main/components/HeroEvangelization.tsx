'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Evangelization } from '@/types/main-content';
import { BookOpen, Users, Heart, UserPlus, Home, Sparkles } from 'lucide-react';

const defaultEvangelization: Evangelization[] = [
  {
    id: 1,
    title: 'Catequese Infantil',
    description: 'Formação catequética para crianças de 7 a 12 anos, preparando para os sacramentos da Eucaristia e Crisma.',
    icon: 'BookOpen',
    audience: 'Crianças de 7 a 12 anos',
  },
  {
    id: 2,
    title: 'Grupos de Jovens',
    description: 'Encontros semanais para jovens de 13 a 25 anos, com partilhas, orações e atividades recreativas.',
    icon: 'Users',
    audience: 'Jovens de 13 a 25 anos',
  },
  {
    id: 3,
    title: 'Pastoral Familiar',
    description: 'Acompanhamento e formação para famílias, fortalecendo os laços conjugais e a educação dos filhos na fé.',
    icon: 'Heart',
    audience: 'Famílias e casais',
  },
];

// Mapeamento de ícones
const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Users,
  Heart,
  UserPlus,
  Home,
  Sparkles,
};

const HeroEvangelization = () => {
  const [evangelization, setEvangelization] = useState<Evangelization[]>(defaultEvangelization);

  useEffect(() => {
    const loadEvangelization = async () => {
      try {
        const response = await fetch('/api/main-content');
        if (response.ok) {
          const data = await response.json();
          if (data.evangelization && data.evangelization.length > 0) {
            setEvangelization(data.evangelization);
          }
        }
      } catch (error) {
        console.error('Failed to load evangelization:', error);
        // Usa os dados padrão em caso de erro
      }
    };
    loadEvangelization();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 bg-base-200">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-base-content mb-4">
          Nossa Evangelização
        </h2>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          Conheça as formas como levamos a Palavra de Deus a diferentes públicos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {evangelization.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Sparkles;

          return (
            <motion.div
              key={item.id}
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

      <div className="text-center mt-12">
        <motion.a
          href="/acoes-projetos-evangelizacao"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary btn-lg gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Conheça Todas as Ações
        </motion.a>
      </div>
    </section>
  );
};

export default HeroEvangelization;
