import { ModConfig } from '@/types/cms-types';

export const ProjectsShowcaseConfig: ModConfig = {
  id: 'ProjectsShowcase',
  name: 'Vitrine de Projetos',
  description: 'Grid de projetos com cards categorizados, imagem, descrição e botão "Saiba Mais"',
  category: 'Conteúdo',
  icon: 'LayoutGrid',
  defaultProps: {
    title: "",
    subtitle: "",
    projects: "[]",
  },
  fields: [
    {
      name: 'all',
      label: 'Configuração da Vitrine de Projetos',
      type: 'projects-showcase-editor',
      description: 'Configure título, subtítulo e adicione os projetos',
    },
  ],
};
