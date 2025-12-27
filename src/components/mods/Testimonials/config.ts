import { ModConfig } from '@/types/cms-types';

export const TestimonialsConfig: ModConfig = {
  id: 'Testimonials',
  name: 'Depoimentos da Comunidade',
  description: 'Seção de depoimentos e feedbacks dos membros (editável diretamente no CMS)',
  category: 'testimonial',
  props: [
    {
      name: 'title',
      label: 'Título da Seção',
      type: 'string',
      required: true,
      default: 'O que nossa comunidade fala',
      placeholder: 'Digite o título...'
    },
    {
      name: 'testimonials',
      label: 'Depoimentos',
      type: 'testimonials-editor',
      required: false,
      default: JSON.stringify([
        {
          id: 1,
          name: 'Maria Silva',
          role: 'Membro da Comunidade',
          avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
          comment: 'Participar da comunidade mudou minha vida. Os retiros são transformadores!',
          date: 'Mar 2024'
        },
        {
          id: 2,
          name: 'João Santos',
          role: 'Participante dos Retiros',
          avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
          comment: 'A formação espiritual que recebo aqui fortalece minha fé e minha família.',
          date: 'Fev 2024'
        },
        {
          id: 3,
          name: 'Ana Costa',
          role: 'Voluntária',
          avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
          comment: 'Servir nesta comunidade é uma bênção. Vejo Cristo nos irmãos a cada dia.',
          date: 'Jan 2024'
        }
      ], null, 2),
      description: 'Gerencie os depoimentos da comunidade visualmente'
    }
  ]
};
