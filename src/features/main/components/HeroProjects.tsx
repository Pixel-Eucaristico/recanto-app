'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Project } from '@/types/main-content';

const defaultProjects: Project[] = [
  {
    id: 1,
    title: 'Retiros Espirituais',
    description: 'Retiros de fim de semana para crianças, jovens e famílias, promovendo encontro com Cristo e renovação espiritual.',
    image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400',
    category: 'retiro',
    link: '/sobre',
  },
  {
    id: 2,
    title: 'Formação Continuada',
    description: 'Encontros semanais de formação humana e espiritual para todas as idades, focando no desenvolvimento de virtudes.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400',
    category: 'formacao',
    link: '/espritualidade',
  },
  {
    id: 3,
    title: 'Evangelização de Rua',
    description: 'Ações missionárias nas ruas de Sumaré, levando a Palavra de Deus e o amor misericordioso às pessoas.',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400',
    category: 'evangelizacao',
  },
];

const categoryColors: Record<string, string> = {
  formacao: 'badge-primary',
  evangelizacao: 'badge-secondary',
  social: 'badge-accent',
  retiro: 'badge-info',
};

const HeroProjects = () => {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/api/main-content');
        if (response.ok) {
          const data = await response.json();
          if (data.projects && data.projects.length > 0) {
            setProjects(data.projects);
          }
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        // Usa os projetos padrão em caso de erro
      }
    };
    loadProjects();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 bg-base-100">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-base-content mb-4">
          Nossos Projetos
        </h2>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          Conheça as iniciativas que transformam vidas e fortalecem nossa comunidade
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <figure className="relative h-48 overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </figure>
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <h3 className="card-title text-base-content">{project.title}</h3>
                <span className={`badge ${categoryColors[project.category] || 'badge-neutral'}`}>
                  {project.category}
                </span>
              </div>
              <p className="text-base-content/80 leading-relaxed">
                {project.description}
              </p>
              {project.link && (
                <div className="card-actions justify-end mt-4">
                  <a
                    href={project.link}
                    className="btn btn-primary btn-sm"
                  >
                    Saiba Mais
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HeroProjects;
