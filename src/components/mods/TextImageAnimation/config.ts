import { ModConfig } from '@/types/cms-types';
import { FileText } from 'lucide-react';

export const textImageAnimationConfig: ModConfig = {
  id: 'TextImageAnimation',
  name: 'Texto + Imagem + Animação',
  description: 'Seção com texto (parágrafos HTML), imagem e animação Lottie em layout de duas colunas',
  category: 'content',
  icon: FileText,
  defaultProps: {
    title: 'Título da Seção',
    titleColor: 'primary',
    paragraphs: [
      '<p>Primeiro parágrafo com texto <strong>em negrito</strong> e <em>itálico</em>.</p>',
      '<p>Segundo parágrafo com mais informações.</p>',
    ],
    image: 'https://cdn2.picryl.com/photo/1672/12/31/santa-teresa-doutora-mistica-inspirada-pelo-espirito-santo-c-1672-josefa-de-73ffbc-640.png',
    imageAlt: 'Descrição da imagem',
    lottieUrl: '/animations/mudar.json',
    layout: 'text-left',
    animationDirection: 'left',
  },
  fields: [
    {
      name: 'props',
      label: 'Configurações do Texto + Imagem',
      type: 'text-image-animation-editor',
      required: true,
    },
  ],
};
