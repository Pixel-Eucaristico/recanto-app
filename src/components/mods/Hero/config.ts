import { ModConfig } from '@/types/cms-types';

/**
 * Configuração do Mod Hero
 * Define as props editáveis no dashboard admin
 */
export const HeroConfig: ModConfig = {
  id: 'Hero',
  name: 'Seção Hero',
  description: 'Seção de destaque com título, subtítulo e imagem',
  icon: 'rocket',
  category: 'hero',
  props: [
    {
      key: 'title',
      label: 'Título Principal',
      type: 'text',
      required: true,
      placeholder: 'Ex: Bem-vindo ao Recanto'
    },
    {
      key: 'subtitle',
      label: 'Subtítulo',
      type: 'textarea',
      required: true,
      helpText: 'Texto descritivo abaixo do título'
    },
    {
      key: 'theme',
      label: 'Tema de Cor',
      type: 'select',
      options: ['primary', 'secondary', 'accent'],
      defaultValue: 'primary'
    },
    {
      key: 'imageUrl',
      label: 'Imagem',
      type: 'image',
      helpText: 'URL da imagem ou upload'
    },
    {
      key: 'ctaText',
      label: 'Texto do Botão (CTA)',
      type: 'text',
      placeholder: 'Ex: Saiba Mais'
    },
    {
      key: 'ctaLink',
      label: 'Link do Botão',
      type: 'text',
      placeholder: 'Ex: /sobre'
    }
  ]
};
