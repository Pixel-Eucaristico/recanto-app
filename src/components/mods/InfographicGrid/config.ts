import { ModConfig } from '@/types/cms-types';

export const infographicGridConfig: ModConfig = {
  id: 'InfographicGrid',
  name: 'Grid Infográfico',
  description: 'Grid de cards informativos com animações Lottie',
  icon: 'Grid',
  category: 'content',
  props: [
    {
      name: 'cards',
      label: 'Cards do Infográfico',
      type: 'infographic-cards-editor',
      required: true,
      default: [
        {
          id: `card-${Date.now()}`,
          title: 'Novo Card',
          body: '<p>Conteúdo do card...</p>',
          imagePosition: 'float-start',
        },
      ],
      description: 'Adicione, remova e reorganize os cards usando drag-and-drop',
    },
    {
      name: 'titleFont',
      label: 'Fonte dos Títulos',
      type: 'font-family',
      default: 'Montserrat',
      description: 'Fonte para os títulos de todos os cards',
    },
    {
      name: 'bodyFont',
      label: 'Fonte do Conteúdo',
      type: 'font-family',
      default: 'Lora',
      description: 'Fonte para o texto do corpo dos cards',
    },
    {
      name: 'columns',
      label: 'Número de Colunas',
      type: 'select',
      default: '2',
      options: [
        { label: '1 Coluna', value: '1' },
        { label: '2 Colunas', value: '2' },
      ],
      description: 'Escolha exibir o grid em 1 ou 2 colunas no desktop',
    },
  ],
};
