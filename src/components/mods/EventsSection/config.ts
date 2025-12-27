import { ModConfig } from '@/types/cms-types';

export const EventsSectionConfig: ModConfig = {
  id: 'EventsSection',
  name: 'Seção de Eventos',
  description: 'Lista de próximos eventos públicos da comunidade (busca automaticamente do banco de dados)',
  category: 'content',
  props: [
    {
      name: 'title',
      label: 'Título da Seção',
      type: 'string',
      required: true,
      default: 'Próximos Eventos',
      placeholder: 'Digite o título...'
    },
    {
      name: 'subtitle',
      label: 'Subtítulo',
      type: 'string',
      multiline: true,
      required: true,
      default: 'Venha participar dos nossos encontros comunitários de oração, formação e celebração',
      placeholder: 'Descrição da seção...'
    },
    {
      name: 'maxEvents',
      label: 'Número Máximo de Eventos',
      type: 'number',
      required: false,
      default: 6,
      description: 'Quantos eventos mostrar (padrão: 6)'
    },
    {
      name: 'ctaText',
      label: 'Texto do Botão',
      type: 'string',
      required: true,
      default: 'Entre em contato para participar',
      placeholder: 'Texto do call-to-action...'
    },
    {
      name: 'ctaLink',
      label: 'Link do Botão',
      type: 'string',
      required: true,
      default: '/contatos',
      placeholder: '/contatos, /sobre, etc...'
    }
  ]
};
