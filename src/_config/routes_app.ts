import {
  Home,
  Users,
  BookOpen,
  BookHeart,
  MessageCircle,
  Calendar,
  DollarSign,
  UserCog,
  Award,
  BookText,
  ListTodo,
  Settings,
  Database,
  FileEdit,
  Boxes,
  ArrowLeft,
  Library,
  Sparkles,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Role } from "@/features/auth/types/user";

export interface AppRoute {
  name: string;
  href: string;
  description?: string;
  icon: LucideIcon;
  roles: Role[];
  /** Feature necessária para ver/acessar esta rota (se não definida, usa apenas roles) */
  requiredFeature?: string;
}

export const appRoutes: AppRoute[] = [
  {
    name: 'Voltar para o Site',
    href: '/',
    icon: ArrowLeft,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor']
  },
  {
    name: 'Minha Jornada',
    href: '/app/dashboard/journey',
    description: 'Seu progresso, livros e cursos',
    icon: Sparkles,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor'],
  },
  /*
  {
    name: 'Início Dashboard',
    href: '/app/dashboard',
    icon: Home,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor']
  },
  */
  /*
  {
    name: 'Formação',
    href: '/app/dashboard/formation',
    icon: BookOpen,
    roles: ['admin', 'missionario', 'recantiano'],
    requiredFeature: 'read:content'
  },
  {
    name: 'Fórum',
    href: '/app/dashboard/forum',
    icon: MessageCircle,
    roles: ['admin', 'missionario', 'recantiano'],
    requiredFeature: 'read:forum'
  },
  {
    name: 'Acompanhamentos',
    href: '/app/dashboard/follow-up',
    icon: Users,
    roles: ['admin', 'missionario', 'pai'],
    requiredFeature: 'manage:followup'
  },
  */
  {
    name: 'Trilhas',
    href: '/app/dashboard/formation',
    icon: BookOpen,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor'],
    requiredFeature: 'read:formation'
  },
  {
    name: 'Fórum',
    href: '/app/dashboard/forum',
    icon: MessageCircle,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor'],
    requiredFeature: 'read:community'
  },
  {
    name: 'Biblioteca',
    href: '/app/dashboard/library',
    icon: Library,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor'],
    requiredFeature: 'read:library'
  },
  {
    name: 'Meus Desafios',
    href: '/app/dashboard/challenges',
    icon: Award,
    roles: ['recantiano']
  },
  {
    name: 'Agenda',
    href: '/app/dashboard/schedule',
    icon: Calendar,
    roles: ['admin', 'missionario'],
    requiredFeature: 'read:calendar'
  },
  {
    name: 'Gerenciar Site',
    href: '/app/dashboard/cms',
    icon: FileEdit,
    roles: ['admin'],
    requiredFeature: 'manage:cms'
  },
  {
    name: 'Admin',
    href: '/app/dashboard/admin',
    icon: UserCog,
    roles: ['admin'],
    requiredFeature: 'manage:users'
  },
  /*
  {
    name: 'Relatório Doações',
    href: '/app/dashboard/donation-report',
    icon: DollarSign,
    roles: ['admin']
  },
  */
  /*
  {
    name: 'Integração Omie',
    href: '/app/dashboard/omie',
    icon: Database,
    roles: ['admin']
  },
  {
    name: 'Apoiar a Obra',
    href: '/app/dashboard/donate',
    icon: DollarSign,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'benfeitor', 'colaborador', null]
  },
  {
    name: 'Feedback',
    href: '/app/dashboard/feedback',
    icon: Settings,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'benfeitor', 'colaborador']
  },
  {
    name: 'Sobre',
    href: '/app/dashboard/documentation',
    icon: BookText,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'benfeitor', 'colaborador', null]
  },
  {
    name: 'Exemplos UI',
    href: '/app/dashboard/examples',
    icon: Boxes,
    roles: ['admin']
  }
  */
];
