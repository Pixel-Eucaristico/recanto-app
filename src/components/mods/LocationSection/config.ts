import { ModConfig } from '@/types/cms-types';
import { MapPin } from 'lucide-react';

export const locationSectionConfig: ModConfig = {
  id: 'LocationSection',
  name: 'Seção de Localização',
  description: 'Exibe endereço e mapa do Google Maps',
  category: 'content',
  icon: MapPin,
  defaultProps: {
    title: 'Nossa Casa é Sua Casa',
    address: 'Rua Exemplo, 123\nBairro, Cidade - UF',
    visitInfo: 'Para visitar, agende conosco previamente.',
    mapEmbedUrl: '',
    bgColor: 'base-100',
    paddingY: 'lg',
  },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      label: 'Endereço Completo',
      type: 'textarea',
      multiline: true,
      description: 'Use quebras de linha para formatar o endereço',
    },
    {
      name: 'visitInfo',
      label: 'Informação de Visita',
      type: 'text',
      description: 'Avisos sobre agendamento ou horários',
    },
    {
      name: 'mapEmbedUrl',
      label: 'URL de Incorporação do Google Maps',
      type: 'url',
      description: 'Cole aqui o link "src" do embed do Google Maps (iframe)',
      placeholder: 'https://www.google.com/maps/embed?...',
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
