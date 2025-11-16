import { ModConfig } from '@/types/cms-types';
import { BookOpen } from 'lucide-react';

export const heroWithAnimationConfig: ModConfig = {
  id: 'HeroWithAnimation',
  name: 'Hero com Animação',
  description: 'Seção hero de página inteira com imagem de fundo, animação Lottie e ícone sobreposto',
  category: 'hero',
  icon: BookOpen,
  defaultProps: {
    title: 'Título do Hero',
    subtitle: 'Subtítulo inspirador aqui...',
    backgroundImage: 'https://cdn2.picryl.com/photo/1672/12/31/santa-teresa-doutora-mistica-inspirada-pelo-espirito-santo-c-1672-josefa-de-73ffbc-640.png',
    lottieUrl: '/animations/reward-light-effect.json',
    icon: 'BookOpen',
    iconColor: 'primary',
    gradientFrom: 'accent',
    gradientTo: 'base-100',
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
