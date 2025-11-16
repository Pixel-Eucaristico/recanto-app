import { ModConfig } from '@/types/cms-types';

export const HeroMissionConfig: ModConfig = {
  id: 'HeroMission',
  name: 'Hero Missão Principal',
  description: 'Banner principal da home com missão e valores da comunidade',
  category: 'hero',
  props: [
    {
      name: 'title',
      label: 'Título',
      type: 'string',
      required: true,
      default: 'Recanto do Amor Misericordioso',
      placeholder: 'Digite o título principal...'
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'string',
      multiline: true,
      required: true,
      default: 'Somos uma comunidade católica em Sumaré dedicada a "vivenciar o Amor Misericordioso de Jesus Cristo", realizando retiros e encontros que avivam os corações e transformam histórias de vida.',
      placeholder: 'Descreva a missão da comunidade...'
    },
    {
      name: 'buttonText',
      label: 'Texto do Botão',
      type: 'string',
      required: false,
      default: 'Participe de um Retiro',
      placeholder: 'Texto do botão...',
      description: 'Deixe em branco se não quiser mostrar botão'
    },
    {
      name: 'buttonLink',
      label: 'Link do Botão',
      type: 'string',
      required: false,
      default: '/sobre',
      placeholder: '/sobre, /contatos, etc...',
      description: 'URL para onde o botão vai levar'
    },
    {
      name: 'backgroundImage',
      label: 'Imagem de Fundo (URL)',
      type: 'url',
      required: false,
      default: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200',
      placeholder: 'https://...'
    },
    {
      name: 'overlayOpacity',
      label: 'Escurecimento da Imagem',
      type: 'select',
      options: [
        { value: '90', label: 'Muito Escuro (90%)' },
        { value: '80', label: 'Bem Escuro (80%)' },
        { value: '70', label: 'Escuro (70%)' },
        { value: '60', label: 'Médio Escuro (60%)' },
        { value: '50', label: 'Meio Escuro (50% - padrão)' },
        { value: '40', label: 'Pouco Escuro (40%)' },
        { value: '30', label: 'Levemente Escuro (30%)' },
        { value: '20', label: 'Muito Leve (20%)' },
        { value: '10', label: 'Quase Transparente (10%)' },
      ],
      default: '50',
      description: 'Quanto a imagem fica escurecida para destacar o texto (maior = mais escuro)'
    }
  ]
};
