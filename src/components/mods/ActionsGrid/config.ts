import { ModConfig } from '@/types/cms-types';

export const actionsGridConfig: ModConfig = {
  id: 'ActionsGrid',
  name: 'Grade de Ações',
  description: 'Grid de cards com imagem, título e descrição. Ideal para mostrar ações, serviços ou projetos.',
  category: 'Conteúdo',
  icon: 'Grid3x3',
  defaultProps: {
    title: "",
    actions: [],
    titleColor: 'primary',
    bgColor: 'base-100',
    columns: '2',
    maxWidth: '5xl',
  },
  fields: [
    {
      name: 'all',
      label: 'Configuração da Grade de Ações',
      type: 'actions-grid-editor',
      description: 'Configure título, estilo e adicione os cards de ações',
    },
  ],
};
