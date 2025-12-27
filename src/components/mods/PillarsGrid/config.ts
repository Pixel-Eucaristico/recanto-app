import { ModConfig } from '@/types/cms-types';

export const pillarsGridConfig: ModConfig = {
  id: 'PillarsGrid',
  name: 'Grade de Pilares',
  description: 'Grade de pilares/features com ícones e descrições',
  icon: 'Grid3x3',
  category: 'content',
  props: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      placeholder: 'Nossos Pilares',
      description: 'Título da seção',
    },
    {
      name: 'pillars',
      label: 'Pilares',
      type: 'pillars-editor',
      required: true,
      default: [
        {
          icon: 'Book',
          title: 'Educação',
          description: 'Formação cristã integral de crianças e jovens.',
          iconColor: 'primary',
        },
        {
          icon: 'Heart',
          title: 'Cura Interior',
          description: 'Acompanhamento espiritual e confiança.',
          iconColor: 'secondary',
        },
      ],
      description: 'Use os botões +/- para adicionar ou remover pilares. Escolha ícone, cor, título e descrição visualmente.',
    },
    {
      name: 'columns',
      label: 'Colunas na Grade',
      type: 'select',
      options: [
        { value: '2', label: '2 Colunas (ideal para poucos itens)' },
        { value: '3', label: '3 Colunas' },
        { value: '4', label: '4 Colunas (recomendado)' },
      ],
      default: '4',
      description: 'Quantas colunas de pilares mostrar lado a lado',
    },
    {
      name: 'titleColor',
      label: 'Cor do Título',
      type: 'select',
      options: [
        { value: 'primary', label: 'Principal (muda com o tema)' },
        { value: 'secondary', label: 'Secundário (muda com o tema)' },
        { value: 'accent', label: 'Destaque (muda com o tema)' },
      ],
      default: 'primary',
      description: 'Cor semântica que se adapta ao tema escolhido',
    },
    {
      name: 'bgColor',
      label: 'Cor de Fundo',
      type: 'select',
      options: [
        { value: 'base-100', label: 'Fundo Claro' },
        { value: 'base-200', label: 'Fundo Médio' },
        { value: 'base-300', label: 'Fundo Escuro' },
      ],
      default: 'base-100',
      description: 'Cor de fundo da seção (muda com o tema)',
    },
    {
      name: 'maxWidth',
      label: 'Largura da Seção',
      type: 'select',
      options: [
        { value: '4xl', label: 'Estreita' },
        { value: '5xl', label: 'Média-Estreita' },
        { value: '6xl', label: 'Média (recomendado)' },
        { value: '7xl', label: 'Larga' },
        { value: 'full', label: 'Largura Total' },
      ],
      default: '6xl',
      description: 'Largura máxima do conteúdo',
    },
  ],
};
