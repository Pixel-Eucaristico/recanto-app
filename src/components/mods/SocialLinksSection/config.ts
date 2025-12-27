import { ModConfig } from '@/types/cms-types';
import { Share2 } from 'lucide-react';

export const socialLinksSectionConfig: ModConfig = {
  id: 'SocialLinksSection',
  name: 'Redes Sociais',
  description: 'Links para redes sociais com ícones',
  category: 'content',
  icon: Share2,
  defaultProps: {
    title: 'Conecte-se Conosco nas Redes',
    bgColor: 'base-100',
    paddingY: 'lg',
  },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      default: 'Conecte-se Conosco nas Redes',
    },
    {
      name: 'instagramUrl',
      label: 'Instagram URL',
      type: 'url',
      placeholder: 'https://instagram.com/...',
    },
    {
      name: 'facebookUrl',
      label: 'Facebook URL',
      type: 'url',
      placeholder: 'https://facebook.com/...',
    },
    {
      name: 'youtubeUrl',
      label: 'YouTube URL',
      type: 'url',
      placeholder: 'https://youtube.com/...',
    },
    {
      name: 'linkedinUrl',
      label: 'LinkedIn URL',
      type: 'url',
      placeholder: 'https://linkedin.com/...',
    },
    {
      name: 'whatsappUrl',
      label: 'WhatsApp Link',
      type: 'url',
      placeholder: 'https://wa.me/...',
    },
    {
      name: 'bgColor',
      label: 'Cor de Fundo',
      type: 'select',
      options: ['base-100', 'base-200', 'base-300'],
      default: 'base-100',
    },
    {
      name: 'paddingY',
      label: 'Espaçamento Vertical',
      type: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      default: 'lg',
    },
  ],
};
