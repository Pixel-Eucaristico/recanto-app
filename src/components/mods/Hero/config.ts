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
      name: 'title',
      label: 'Título Principal',
      type: 'text',
      required: true,
      placeholder: 'Ex: Bem-vindo ao Recanto'
    },
    {
      name: 'subtitle',
      label: 'Subtítulo',
      type: 'textarea',
      required: true,
      description: 'Texto descritivo abaixo do título'
    },
    {
      name: 'theme',
      label: 'Cor do Tema',
      type: 'select',
      options: [
        { value: 'primary', label: 'Principal (muda com o tema)' },
        { value: 'secondary', label: 'Secundário (muda com o tema)' },
        { value: 'accent', label: 'Destaque (muda com o tema)' },
      ],
      default: 'primary',
      description: 'Cor semântica que se adapta ao tema escolhido'
    },
    {
      name: 'imageUrl',
      label: 'Imagem',
      type: 'url',
      description: 'URL da imagem'
    },
    {
      name: 'imageOpacity',
      label: 'Opacidade da Imagem',
      type: 'select',
      options: [
        { value: '100', label: 'Totalmente Visível (100%)' },
        { value: '80', label: 'Muito Visível (80%)' },
        { value: '60', label: 'Visível (60%)' },
        { value: '40', label: 'Meio Transparente (40%)' },
        { value: '20', label: 'Transparente (20%)' },
        { value: '10', label: 'Muito Transparente (10%)' },
      ],
      default: '40',
      description: 'Quanto a imagem fica destacada (menor = mais suave)'
    },
    {
      name: 'ctaText',
      label: 'Texto do Botão (CTA)',
      type: 'text',
      required: false,
      placeholder: 'Ex: Saiba Mais',
      description: 'Deixe em branco se não quiser mostrar botão'
    },
    {
      name: 'ctaLink',
      label: 'Link do Botão',
      type: 'text',
      required: false,
      placeholder: 'Ex: /sobre',
      description: 'URL para onde o botão vai levar'
    }
  ]
};
