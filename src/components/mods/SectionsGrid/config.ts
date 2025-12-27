import { ModConfig } from '@/types/cms-types';

export const sectionsGridConfig: ModConfig = {
  id: 'SectionsGrid',
  name: 'Grade de Seções Informativas',
  description: 'Grade de seções com ícones e conteúdo rico, ideal para história, carisma, valores',
  icon: 'LayoutGrid',
  category: 'content',
  props: [
    {
      name: 'sections',
      label: 'Seções',
      type: 'sections-editor',
      required: true,
      default: [
        {
          icon: 'FaPrayingHands',
          title: 'Nossa História',
          content: 'Fundado em 2011 pelo Padre Pio Angelotti, o Recanto do Amor Misericordioso nasceu para ser um espaço de amor, perdão e cura interior.',
          iconColor: 'primary',
        },
        {
          icon: 'FaHeart',
          title: 'Nosso Carisma',
          content: 'Vivemos o Amor e o Perdão. Imolamo-nos diante do sofrimento da humanidade por amor às almas. Nossa missão é curar e salvar.',
          iconColor: 'secondary',
        },
        {
          icon: 'FaHandsHelping',
          title: 'Nossa Espiritualidade',
          content: 'Caminhamos sob o olhar de Nossa Senhora Mãe do Amor Misericordioso, guiados por São Rafael Arcanjo.',
          iconColor: 'accent',
        },
      ],
      description: 'Use os botões +/- para adicionar ou remover seções. Editor visual completo: escolha ícone, cor, e formate o texto com negrito, itálico, listas, etc.',
    },
    {
      name: 'columns',
      label: 'Colunas na Grade',
      type: 'select',
      options: [
        { value: '1', label: '1 Coluna (recomendado para textos longos)' },
        { value: '2', label: '2 Colunas' },
        { value: '3', label: '3 Colunas' },
      ],
      default: '1',
      description: 'Quantas colunas de seções mostrar lado a lado',
    },
    {
      name: 'spacing',
      label: 'Espaçamento',
      type: 'select',
      options: [
        { value: 'sm', label: 'Pequeno' },
        { value: 'md', label: 'Médio' },
        { value: 'lg', label: 'Grande (recomendado)' },
        { value: 'xl', label: 'Extra Grande' },
      ],
      default: 'lg',
      description: 'Espaçamento entre seções e ao redor',
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
