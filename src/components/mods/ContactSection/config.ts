import { ModConfig } from '@/types/cms-types';
import { Mail } from 'lucide-react';

export const contactSectionConfig: ModConfig = {
  id: 'ContactSection',
  name: 'Seção de Contato',
  description: 'Formulário de contato e informações laterais (WhatsApp, Telefone)',
  category: 'form',
  icon: Mail,
  defaultProps: {
    title: 'Fale Conosco',
    subtitle: 'Nossa equipe está pronta para te ouvir',
    bgColor: 'base-100',
    paddingY: 'lg',
    formTitle: 'Envie uma mensagem',
    showName: true,
    showEmail: true,
    showPhone: true,
    showSubject: true,
    showMessage: true,
    buttonText: 'Enviar',
    buttonColor: 'primary',
    infoTitle: 'Outros Canais',
    whatsappText: 'Atendimento rápido pelo WhatsApp',
    whatsappButtonText: 'Conversar Agora',
    phoneTitle: 'Telefone',
    phoneText: '(00) 0000-0000',
    scheduleText: 'Seg-Sex 8h às 17h',
  },
  fields: [
    // Seção Geral
    {
      name: 'title',
      label: 'Título da Página',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      label: 'Subtítulo',
      type: 'text',
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
    
    // Formulário
    {
      name: 'formTitle',
      label: 'Título do Formulário',
      type: 'text',
    },
    {
      name: 'showSubject',
      label: 'Mostrar Campo Assunto',
      type: 'boolean',
      default: true,
    },
    {
      name: 'buttonText',
      label: 'Texto do Botão',
      type: 'text',
      default: 'Enviar Mensagem',
    },
    
    // Informações Laterais
    {
      name: 'infoTitle',
      label: 'Título Lateral',
      type: 'text',
      default: 'Outros Canais',
    },
    {
      name: 'whatsappText',
      label: 'Texto do WhatsApp',
      type: 'text',
    },
    {
      name: 'whatsappButtonText',
      label: 'Botão do WhatsApp',
      type: 'text',
    },
    {
      name: 'whatsappLink',
      label: 'Link do WhatsApp',
      type: 'url',
      placeholder: 'https://wa.me/55...',
    },
    {
      name: 'phoneTitle',
      label: 'Título Telefone',
      type: 'text',
    },
    {
      name: 'phoneText',
      label: 'Número de Telefone',
      type: 'text',
    },
    {
      name: 'scheduleText',
      label: 'Horário de Atendimento',
      type: 'text',
    },
  ],
};
