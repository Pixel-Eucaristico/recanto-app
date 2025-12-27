import { ModConfig } from '@/types/cms-types';

export const textWithAnimationConfig: ModConfig = {
  id: 'TextWithAnimation',
  name: 'Texto com Animação',
  description: 'Seção de texto com animação Lottie ao lado',
  icon: 'Layout',
  category: 'content',
  props: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      placeholder: 'Nossa História',
      description: 'Título da seção',
    },
    {
      name: 'paragraphs',
      label: 'Parágrafos',
      type: 'paragraphs-editor',
      required: true,
      default: [
        'Primeiro parágrafo do texto...',
        'Segundo parágrafo do texto...',
      ],
      description: 'Use os botões + e - para adicionar ou remover parágrafos',
    },
    {
      name: 'animation',
      label: 'Animação Lottie',
      type: 'animation-picker',
      default: 'none',
      description: 'Clique para ver todas as animações disponíveis e escolher visualmente',
    },
    {
      name: 'layout',
      label: 'Posição do Texto',
      type: 'select',
      options: [
        { value: 'text-left', label: 'Texto à Esquerda | Animação à Direita' },
        { value: 'text-right', label: 'Animação à Esquerda | Texto à Direita' },
      ],
      default: 'text-left',
      description: 'Como o texto e a animação ficam posicionados',
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
