import {
  Home,
  Users,
  BookOpen,
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
  Boxes
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Role } from "@/features/auth/types/user";

export interface AppRoute {
  name: string;
  href: string;
  description?: string;
  icon: LucideIcon; 
  roles: Role[];
}

export const appRoutes: AppRoute[] = [
  {
    name: 'Início',
    href: '/app/dashboard',
    icon: Home,
    roles: ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor']
  },
  /*
  {
    name: 'Formação',
    href: '/app/dashboard/formation',
    icon: BookOpen,
    roles: ['admin', 'missionario', 'recantiano']
  },
  {
    name: 'Fórum',
    href: '/app/dashboard/forum',
    icon: MessageCircle,
    roles: ['admin', 'missionario', 'recantiano']
  },
  {
    name: 'Acompanhamentos',
    href: '/app/dashboard/follow-up',
    icon: Users,
    roles: ['admin', 'missionario', 'pai']
  },
  */
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
    roles: ['admin', 'missionario']
  },
  {
    name: 'Minhas Tarefas',
    href: '/app/dashboard/tarefas',
    icon: ListTodo,
    roles: ['colaborador']
  },
  {
    name: 'Gerenciar Site',
    href: '/app/dashboard/cms',
    icon: FileEdit,
    roles: ['admin', 'missionario']
  },
  {
    name: 'Admin',
    href: '/app/dashboard/admin',
    icon: UserCog,
    roles: ['admin']
  },
  {
    name: 'Relatório Doações',
    href: '/app/dashboard/donation-report',
    icon: DollarSign,
    roles: ['admin']
  },
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
