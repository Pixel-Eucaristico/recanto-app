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
      required: true,
      default: 'Participe de um Retiro',
      placeholder: 'Texto do botão...'
    },
    {
      name: 'buttonLink',
      label: 'Link do Botão',
      type: 'string',
      required: true,
      default: '/sobre',
      placeholder: '/sobre, /contatos, etc...'
    },
    {
      name: 'backgroundImage',
      label: 'Imagem de Fundo (URL)',
      type: 'url',
      required: false,
      default: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200',
      placeholder: 'https://...'
    }
  ]
};
