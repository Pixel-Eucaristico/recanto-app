import { Role } from '@/features/auth/types/user';
import {
  Shield,
  Calendar,
  FileText,
  MessageCircle,
  Users,
  Heart
} from 'lucide-react';

/**
 * Mapeamento de Roles para Features padrão.
 * NOTA: Essas permissões devem estar sincronizadas com a collection permissions_config no Firestore.
 * Use a interface de Grupos de Acesso no admin para modificar as permissões.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<Exclude<Role, null>, string[]> = {
  admin: ['*'],
  missionario: [
    'read:content',
    'create:content',
    'update:content',
    'read:calendar',
    'manage:calendar',
    'read:forum',
    'create:forum_topic',
    'create:forum_post',
    'manage:followup',
    'manage:challenges'
  ],
  recantiano: [
    'read:content',
    'read:calendar',
    'read:forum',
    'create:forum_post'
  ],
  pai: [
    'read:content',
    'read:calendar',
    'read:parent_zone'
  ],
  colaborador: [
    'read:content',
    'read:calendar'
  ],
  benfeitor: [
    'read:content',
    'read:gratitude_corner'
  ],
  visitante: [
    'read:public_content',
    'read:public_calendar'
  ]
};

/**
 * Informações detalhadas sobre cada permissão para exibição amigável
 */
export interface FeatureInfo {
  id: string;
  label: string;
  description: string;
  category: 'admin' | 'calendar' | 'content' | 'forum' | 'users' | 'special';
}

export const FEATURE_CATEGORIES = {
  admin: { label: 'Administração', icon: Shield, color: 'error' },
  calendar: { label: 'Agenda', icon: Calendar, color: 'primary' },
  content: { label: 'Conteúdo e Materiais', icon: FileText, color: 'secondary' },
  forum: { label: 'Fórum', icon: MessageCircle, color: 'accent' },
  users: { label: 'Gestão de Usuários', icon: Users, color: 'info' },
  special: { label: 'Áreas Especiais', icon: Heart, color: 'success' },
} as const;

export const FEATURES_INFO: FeatureInfo[] = [
  // ===== ADMINISTRAÇÃO =====
  {
    id: '*',
    label: 'Acesso Total (Super Admin)',
    description: 'Permissão máxima - acesso a todas as funcionalidades do sistema',
    category: 'admin'
  },
  {
    id: 'manage:users',
    label: 'Gerenciar Usuários',
    description: 'Criar, editar e remover membros da comunidade',
    category: 'admin'
  },
  {
    id: 'manage:roles',
    label: 'Gerenciar Grupos de Acesso',
    description: 'Criar e editar grupos de permissões (RBAC)',
    category: 'admin'
  },
  {
    id: 'manage:donations',
    label: 'Gerenciar Doações',
    description: 'Ver e administrar relatórios de doações',
    category: 'admin'
  },
  {
    id: 'read:submissions',
    label: 'Ver Formulários Enviados',
    description: 'Acessar mensagens de contato e feedback',
    category: 'admin'
  },

  // ===== CMS / SITE =====
  {
    id: 'manage:cms',
    label: 'Gerenciar Páginas do Site',
    description: 'Criar, editar e publicar páginas do site',
    category: 'content'
  },
  {
    id: 'manage:menu',
    label: 'Gerenciar Menu',
    description: 'Editar itens do menu de navegação',
    category: 'content'
  },

  // ===== AGENDA =====
  {
    id: 'manage:calendar',
    label: 'Gerenciar Agenda',
    description: 'Criar, editar e publicar eventos na agenda',
    category: 'calendar'
  },
  {
    id: 'read:calendar',
    label: 'Ver Agenda Completa',
    description: 'Visualizar todos os eventos (públicos e privados)',
    category: 'calendar'
  },
  {
    id: 'read:public_calendar',
    label: 'Ver Agenda Pública',
    description: 'Visualizar apenas eventos públicos',
    category: 'calendar'
  },

  // ===== MATERIAIS DE FORMAÇÃO =====
  {
    id: 'manage:materials',
    label: 'Gerenciar Materiais',
    description: 'Criar, editar e excluir materiais de formação',
    category: 'content'
  },
  {
    id: 'create:content',
    label: 'Criar Conteúdo',
    description: 'Adicionar novos materiais de formação',
    category: 'content'
  },
  {
    id: 'read:content',
    label: 'Ver Conteúdo',
    description: 'Acessar materiais de formação',
    category: 'content'
  },
  {
    id: 'update:content',
    label: 'Editar Conteúdo',
    description: 'Modificar materiais existentes',
    category: 'content'
  },
  {
    id: 'delete:content',
    label: 'Excluir Conteúdo',
    description: 'Remover materiais de formação',
    category: 'content'
  },

  // ===== FÓRUM =====
  {
    id: 'read:forum',
    label: 'Ver Fórum',
    description: 'Acessar discussões da comunidade',
    category: 'forum'
  },
  {
    id: 'create:forum_topic',
    label: 'Criar Tópicos',
    description: 'Iniciar novas discussões no fórum',
    category: 'forum'
  },
  {
    id: 'create:forum_post',
    label: 'Comentar no Fórum',
    description: 'Responder em discussões existentes',
    category: 'forum'
  },

  // ===== ACOMPANHAMENTO =====
  {
    id: 'manage:followup',
    label: 'Gerenciar Acompanhamentos',
    description: 'Criar e editar registros de acompanhamento dos recantianos',
    category: 'users'
  },
  {
    id: 'manage:challenges',
    label: 'Gerenciar Desafios',
    description: 'Criar e editar desafios para os recantianos',
    category: 'users'
  },

  // ===== ÁREAS ESPECIAIS =====
  {
    id: 'read:parent_zone',
    label: 'Área dos Pais',
    description: 'Acesso à área exclusiva para pais e responsáveis',
    category: 'special'
  },
  {
    id: 'read:gratitude_corner',
    label: 'Cantinho da Gratidão',
    description: 'Acesso às mensagens de agradecimento dos benfeitores',
    category: 'special'
  },
];

/**
 * Helper para obter informações de uma feature
 */
export function getFeatureInfo(featureId: string): FeatureInfo | undefined {
  return FEATURES_INFO.find(f => f.id === featureId);
}

/**
 * Helper para obter features agrupadas por categoria
 */
export function getFeaturesByCategory(): Record<string, FeatureInfo[]> {
  const grouped: Record<string, FeatureInfo[]> = {};

  for (const feature of FEATURES_INFO) {
    if (!grouped[feature.category]) {
      grouped[feature.category] = [];
    }
    grouped[feature.category].push(feature);
  }

  return grouped;
}

/**
 * Lista de todas as features disponíveis (IDs apenas)
 */
export const AVAILABLE_FEATURES = FEATURES_INFO.map(f => f.id);

export type Feature = typeof AVAILABLE_FEATURES[number];
