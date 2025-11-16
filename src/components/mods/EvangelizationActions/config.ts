import { ModConfig } from '@/types/cms-types';

export const EvangelizationActionsConfig: ModConfig = {
  id: 'EvangelizationActions',
  name: 'Ações de Evangelização',
  description: 'Seção mostrando as diferentes ações de evangelização da comunidade',
  category: 'content',
  props: [
    {
      name: 'title',
      label: 'Título da Seção',
      type: 'string',
      required: true,
      default: 'Nossa Evangelização',
      placeholder: 'Digite o título...'
    },
    {
      name: 'subtitle',
      label: 'Subtítulo',
      type: 'string',
      multiline: true,
      required: true,
      default: 'Conheça as formas como levamos a Palavra de Deus a diferentes públicos',
      placeholder: 'Descrição da seção...'
    },
    {
      name: 'actions',
      label: 'Ações de Evangelização',
      type: 'evangelization-actions-editor',
      required: false,
      description: 'Editor visual para adicionar e organizar ações de evangelização',
      default: JSON.stringify([
        {
          id: 1,
          title: 'Catequese Infantil',
          description: 'Formação catequética para crianças, preparando para os sacramentos.',
          icon: 'BookOpen',
          audience: 'Crianças de 7 a 12 anos',
        },
        {
          id: 2,
          title: 'Grupos de Jovens',
          description: 'Encontros semanais para jovens com partilhas, orações e atividades.',
          icon: 'Users',
          audience: 'Jovens de 13 a 25 anos',
        },
        {
          id: 3,
          title: 'Pastoral Familiar',
          description: 'Acompanhamento e formação para famílias, fortalecendo os laços na fé.',
          icon: 'Heart',
          audience: 'Famílias e casais',
        },
      ], null, 2)
    },
    {
      name: 'ctaText',
      label: 'Texto do Botão',
      type: 'string',
      required: false,
      default: 'Conheça Todas as Ações',
      placeholder: 'Texto do call-to-action...'
    },
    {
      name: 'ctaLink',
      label: 'Link do Botão',
      type: 'string',
      required: false,
      default: '/acoes-projetos-evangelizacao',
      placeholder: '/acoes, /sobre, etc...'
    }
  ]
};
