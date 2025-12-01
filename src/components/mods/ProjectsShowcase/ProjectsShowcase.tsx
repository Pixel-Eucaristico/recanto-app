'use client';

import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';

interface Project {
  id?: number;
  title: string;
  description: string;
  image: string;
  category: string;
  link?: string;
}

interface ProjectsShowcaseProps {
  title?: string;
  subtitle?: string;
  projects?: string; // JSON string
}

const categoryColors: Record<string, string> = {
  formacao: 'badge-primary',
  evangelizacao: 'badge-secondary',
  social: 'badge-accent',
  retiro: 'badge-info',
  outro: 'badge-neutral',
};

const categoryLabels: Record<string, string> = {
  formacao: 'formacao',
  evangelizacao: 'evangelizacao',
  social: 'social',
  retiro: 'retiro',
  outro: 'outro',
};

const defaultProjects: Project[] = [
  {
    title: 'Retiros Espirituais',
    description: 'Retiros de fim de semana promovendo encontro com Cristo e renovação espiritual.',
    image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400',
    category: 'retiro',
    link: '/sobre',
  },
  {
    title: 'Formação Continuada',
    description: 'Encontros semanais de formação humana e espiritual para todas as idades.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400',
    category: 'formacao',
    link: '/espritualidade',
  },
  {
    title: 'Evangelização de Rua',
    description: 'Ações missionárias levando a Palavra de Deus e o amor misericordioso.',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400',
    category: 'evangelizacao',
  },
];

export default function ProjectsShowcase({
  title = "",
  subtitle = "",
  projects
}: ProjectsShowcaseProps) {
  // Parse projects from JSON string or use default
  let parsedProjects: Project[] = [];

  if (projects) {
    try {
      parsedProjects = JSON.parse(projects);
    } catch (error) {
      console.error('Failed to parse projects:', error);
    }
  }

  // Não renderizar se não tiver conteúdo essencial
  if (!title && !subtitle && parsedProjects.length === 0) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 bg-base-100">
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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {parsedProjects.map((project, index) => (
          <motion.div
            key={index}
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
                  {categoryLabels[project.category] || project.category}
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
}
