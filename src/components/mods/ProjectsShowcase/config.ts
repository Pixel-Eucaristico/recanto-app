import { ModConfig } from '@/types/cms-types';

export const ProjectsShowcaseConfig: ModConfig = {
  id: 'ProjectsShowcase',
  name: 'Vitrine de Projetos',
  description: 'Seção mostrando os principais projetos e iniciativas da comunidade',
  category: 'content',
  props: [
    {
      name: 'title',
      label: 'Título da Seção',
      type: 'string',
      required: true,
      default: 'Nossos Projetos',
      placeholder: 'Digite o título...'
    },
    {
      name: 'subtitle',
      label: 'Subtítulo',
      type: 'string',
      multiline: true,
      required: true,
      default: 'Conheça as iniciativas que transformam vidas e fortalecem nossa comunidade',
      placeholder: 'Descrição da seção...'
    },
    {
      name: 'projects',
      label: 'Projetos',
      type: 'projects-editor',
      required: false,
      description: 'Editor visual para adicionar e organizar projetos da comunidade',
      default: JSON.stringify([
        {
          id: 1,
          title: 'Retiros Espirituais',
          description: 'Retiros de fim de semana promovendo encontro com Cristo e renovação espiritual.',
          image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400',
          category: 'retiro',
          link: '/sobre',
        },
        {
          id: 2,
          title: 'Formação Continuada',
          description: 'Encontros semanais de formação humana e espiritual para todas as idades.',
          image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400',
          category: 'formacao',
          link: '/espritualidade',
        },
        {
          id: 3,
          title: 'Evangelização de Rua',
          description: 'Ações missionárias levando a Palavra de Deus e o amor misericordioso.',
          image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400',
          category: 'evangelizacao',
        },
      ], null, 2)
    }
  ]
};
