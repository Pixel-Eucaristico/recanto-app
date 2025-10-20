'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { motion, TargetAndTransition } from 'framer-motion';
import { CommunityFeedback } from '@/types/main-content';

const defaultFeedbacks: CommunityFeedback[] = [
  {
    id: 1,
    name: 'Ana Silva',
    role: 'Participante do evento 2023',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    comment:
      'Participar da comunidade mudou minha forma de ver os jogos digitais. Os eventos são incríveis e muito inspiradores!',
    date: 'Mar 2024',
  },
  {
    id: 2,
    name: 'Carlos Pereira',
    role: 'Membro ativo da comunidade',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
    comment:
      'Os workshops e palestras ajudaram muito no meu desenvolvimento profissional. Ambiente super acolhedor!',
    date: 'Fev 2024',
  },
  {
    id: 3,
    name: 'Mariana Costa',
    role: 'Voluntária e entusiasta',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    comment:
      'A troca de experiências e o networking são os pontos altos da comunidade. Recomendo para todos que querem crescer.',
    date: 'Jan 2024',
  },
];

const variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: (i: number): TargetAndTransition => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: [0.42, 0, 0.58, 1] // easeInOut como array
    }
  })
};

const HeroCommunityFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<CommunityFeedback[]>(defaultFeedbacks);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const response = await fetch('/api/main-content');
        if (response.ok) {
          const data = await response.json();
          if (data.communityFeedbacks && data.communityFeedbacks.length > 0) {
            setFeedbacks(data.communityFeedbacks);
          }
        }
      } catch (error) {
        console.error('Failed to load feedbacks:', error);
        // Usa os feedbacks padrão em caso de erro
      }
    };
    loadFeedbacks();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-center mb-10 text-base-content">
        O que nossa comunidade fala
      </h2>

      <div className="grid gap-8 md:grid-cols-3">
        {feedbacks.map(({ id, name, role, avatar, comment, date }, i) => (
          <motion.article
            key={id}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={variants}
            className="bg-base-200 rounded-lg shadow-lg p-6 flex flex-col"
            role="region"
            aria-labelledby={`feedback-title-${id}`}
          >
            <div className="flex items-center mb-4">
              <Image
                src={avatar}
                alt={`Foto de ${name}`}
                className="w-14 h-14 rounded-full mr-4"
                width={56}
                height={56}
                loading="lazy"
              />
              <div>
                <h3
                  id={`feedback-title-${id}`}
                  className="text-lg font-semibold text-base-content"
                >
                  {name}
                </h3>
                <p className="text-sm text-base-content/70">{role}</p>
              </div>
            </div>
            <p className="flex-grow leading-relaxed text-base-content">
              “{comment}”
            </p>
            <time
              dateTime={date}
              className="mt-4 text-xs text-right text-base-content/60"
            >
              {date}
            </time>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default HeroCommunityFeedback;
