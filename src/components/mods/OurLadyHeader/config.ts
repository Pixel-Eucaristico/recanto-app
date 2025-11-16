import { ModConfig } from '@/types/cms-types';

export const ourLadyHeaderConfig: ModConfig = {
  id: 'OurLadyHeader',
  name: 'Header Nossa Senhora',
  description: 'Header da página Nossa Senhora com imagem, título e subtítulo',
  icon: 'Crown',
  category: 'hero',
  props: [
    {
      name: 'header',
      label: 'Configurações do Header',
      type: 'our-lady-header-editor',
      required: true,
      default: {
        imageUrl: '/images/NSenhoraAM.svg',
        title: 'Nossa Senhora Mãe do Amor Misericordioso',
        subtitle: 'Mãe, Mestra e Formadora do Amor Misericordioso',
      },
      description: 'Configure a imagem, título e subtítulo do header',
    },
    {
      name: 'titleFont',
      label: 'Fonte do Título',
      type: 'font-family',
      default: 'Playfair Display',
      description: 'Escolha a fonte para o título principal',
    },
    {
      name: 'subtitleFont',
      label: 'Fonte do Subtítulo',
      type: 'font-family',
      default: 'Lora',
      description: 'Escolha a fonte para o subtítulo',
    },
  ],
};
