import { Shield, Calendar, FileText, MessageCircle, Users, Heart } from 'lucide-react';

export interface FeatureInfo {
  id: string;
  label: string;
  description: string;
  category: 'admin' | 'calendar' | 'content' | 'forum' | 'users' | 'special';
}

export const FEATURE_CATEGORIES = {
  admin:    { label: 'Administração',           icon: Shield,        color: 'error'     },
  calendar: { label: 'Agenda',                  icon: Calendar,      color: 'primary'   },
  content:  { label: 'Conteúdo e Materiais',    icon: FileText,      color: 'secondary' },
  forum:    { label: 'Fórum',                   icon: MessageCircle, color: 'accent'    },
  users:    { label: 'Gestão de Usuários',      icon: Users,         color: 'info'      },
  special:  { label: 'Áreas Especiais',         icon: Heart,         color: 'success'   },
} as const;

export const FEATURES_INFO: FeatureInfo[] = [
  // Administração
  { id: '*',                category: 'admin',    label: 'Acesso Total (Super Admin)',        description: 'Permissão máxima — acesso a todas as funcionalidades' },
  { id: 'manage:users',     category: 'admin',    label: 'Gerenciar Usuários',                description: 'Criar, editar e remover membros da comunidade' },
  { id: 'manage:roles',     category: 'admin',    label: 'Gerenciar Grupos de Acesso',        description: 'Criar e editar grupos de permissões (RBAC)' },
  { id: 'manage:donations', category: 'admin',    label: 'Gerenciar Doações',                 description: 'Ver e administrar relatórios de doações' },
  { id: 'read:submissions', category: 'admin',    label: 'Ver Formulários Enviados',          description: 'Acessar mensagens de contato e feedback' },
  // CMS
  { id: 'manage:cms',       category: 'content',  label: 'Gerenciar Páginas do Site',         description: 'Criar, editar e publicar páginas do site' },
  { id: 'manage:menu',      category: 'content',  label: 'Gerenciar Menu',                    description: 'Editar itens do menu de navegação' },
  // Agenda
  { id: 'manage:calendar',     category: 'calendar', label: 'Gerenciar Agenda',          description: 'Criar, editar e publicar eventos na agenda' },
  { id: 'read:calendar',       category: 'calendar', label: 'Ver Agenda Completa',       description: 'Visualizar todos os eventos (públicos e privados)' },
  { id: 'read:public_calendar',category: 'calendar', label: 'Ver Agenda Pública',        description: 'Visualizar apenas eventos públicos' },
  // Materiais
  { id: 'manage:materials', category: 'content',  label: 'Gerenciar Materiais',               description: 'Criar, editar e excluir materiais de formação' },
  { id: 'create:content',   category: 'content',  label: 'Criar Conteúdo',                    description: 'Adicionar novos materiais de formação' },
  { id: 'read:content',     category: 'content',  label: 'Ver Conteúdo',                      description: 'Acessar materiais de formação' },
  { id: 'update:content',   category: 'content',  label: 'Editar Conteúdo',                   description: 'Modificar materiais existentes' },
  { id: 'delete:content',   category: 'content',  label: 'Excluir Conteúdo',                  description: 'Remover materiais de formação' },
  // Fórum
  { id: 'read:forum',           category: 'forum', label: 'Ver Fórum',        description: 'Acessar discussões da comunidade' },
  { id: 'create:forum_topic',   category: 'forum', label: 'Criar Tópicos',    description: 'Iniciar novas discussões no fórum' },
  { id: 'create:forum_post',    category: 'forum', label: 'Comentar no Fórum',description: 'Responder em discussões existentes' },
  // Acompanhamento
  { id: 'manage:followup',   category: 'users', label: 'Gerenciar Acompanhamentos', description: 'Criar e editar registros de acompanhamento' },
  { id: 'manage:challenges', category: 'users', label: 'Gerenciar Desafios',         description: 'Criar e editar desafios para os recantianos' },
  // Formação
  { id: 'read:formation',     category: 'content', label: 'Ver Trilhas de Formação',   description: 'Acessar trilhas, módulos e aulas de formação' },
  { id: 'complete:formation', category: 'content', label: 'Completar Aulas',            description: 'Enviar reflexões, fazer quiz e marcar aulas como concluídas' },
  { id: 'manage:formation',   category: 'admin',   label: 'Gerenciar Trilhas e Aulas',  description: 'Criar, editar e publicar trilhas, módulos e aulas' },
  { id: 'review:formation',   category: 'users',   label: 'Revisar Progresso dos Alunos', description: 'Ver progresso e reflexões dos alunos no curso' },
  // Hábitos
  { id: 'log:habits',    category: 'special', label: 'Registrar Hábitos Diários', description: 'Marcar hábitos espirituais do dia' },
  { id: 'manage:habits', category: 'admin',   label: 'Gerenciar Hábitos',          description: 'Criar e editar hábitos obrigatórios por nível' },
  // Oração
  { id: 'read:prayer',    category: 'special', label: 'Acessar Central de Oração',   description: 'Abrir a Chapel com textos de oração da comunidade' },
  { id: 'manage:prayer',  category: 'admin',   label: 'Gerenciar Textos de Oração',  description: 'Criar e editar os textos da Central de Oração' },
  // Comunidade
  { id: 'read:community',    category: 'forum', label: 'Ver Comunidade',          description: 'Ver posts de fórum, enquetes e mural' },
  { id: 'post:community',    category: 'forum', label: 'Participar da Comunidade', description: 'Criar posts, responder, votar em enquetes' },
  { id: 'manage:community',  category: 'admin', label: 'Moderar Comunidade',       description: 'Editar/remover posts e respostas de qualquer usuário' },
  // Biblioteca
  { id: 'read:library',     category: 'content', label: 'Ver Biblioteca',          description: 'Acessar o catálogo e ler livros online' },
  { id: 'download:library', category: 'content', label: 'Baixar Livros',           description: 'Baixar livros em EPUB e PDF' },
  { id: 'manage:library',   category: 'content', label: 'Gerenciar Biblioteca',    description: 'Criar, editar e excluir livros, capítulos e categorias' },
  // Áreas especiais
  { id: 'read:parent_zone',     category: 'special', label: 'Área dos Pais',          description: 'Acesso à área exclusiva para pais e responsáveis' },
  { id: 'read:gratitude_corner',category: 'special', label: 'Cantinho da Gratidão',   description: 'Acesso às mensagens de agradecimento dos benfeitores' },
];
