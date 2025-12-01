import { ModConfig } from '@/types/cms-types';
import { BookOpen } from 'lucide-react';

export const heroWithAnimationConfig: ModConfig = {
  id: 'HeroWithAnimation',
  name: 'Hero com Animação',
  description: 'Seção hero de página inteira com imagem de fundo, animação Lottie e ícone sobreposto',
  category: 'hero',
  icon: BookOpen,
  defaultProps: {
    title: '',
    subtitle: '',
    backgroundImage: '',
    lottieUrl: '',
    icon: '',
    iconColor: 'primary',
    gradientFrom: 'accent',
    gradientTo: 'base-100',
    variant: 'fullscreen',
    titleColor: 'primary',
    paddingY: 'lg',
  },
  fields: [
    {
      name: 'props',
      label: 'Configurações do Hero',
      type: 'hero-with-animation-editor',
      required: true,
    },
  ],
};
