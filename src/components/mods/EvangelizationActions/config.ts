import { ModConfig } from '@/types/cms-types';

export const EvangelizationActionsConfig: ModConfig = {
  id: 'EvangelizationActions',
  name: 'Ações de Evangelização',
  description: 'Grid de cards com ícones, descrição e público-alvo. Perfeito para evangelização.',
  category: 'content',
  icon: 'Sparkles',
  defaultProps: {
    title: "",
    subtitle: "",
    actions: "[]",
    ctaText: "",
    ctaLink: "",
    bgColor: 'base-200',
  },
  fields: [
    {
      name: 'all',
      label: 'Configuração das Ações de Evangelização',
      type: 'evangelization-actions-editor',
      description: 'Configure título, subtítulo, ações e botão CTA',
    },
  ],
};
