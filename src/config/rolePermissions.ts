import type { Role } from '@/features/auth/types/user';

export const DEFAULT_ROLE_PERMISSIONS: Record<Exclude<Role, null>, string[]> = {
  admin: ['*'],
  missionario: [
    'read:content', 'create:content', 'update:content',
    'read:calendar', 'manage:calendar',
    'read:forum', 'create:forum_topic', 'create:forum_post',
    'manage:followup', 'manage:challenges',
    'read:formation', 'complete:formation', 'manage:formation', 'review:formation',
    'log:habits',
    'read:prayer',
    'read:community', 'post:community', 'manage:community',
    'read:library', 'manage:library', 'download:library',
  ],
  recantiano: [
    'read:content', 'read:calendar', 'read:forum', 'create:forum_post',
    'read:formation', 'complete:formation',
    'log:habits', 'read:prayer',
    'read:community', 'post:community',
    'read:library', 'download:library',
  ],
  pai: [
    'read:content', 'read:calendar', 'read:parent_zone',
    'read:formation', 'log:habits', 'read:prayer',
    'read:community', 'post:community',
    'read:library', 'download:library',
  ],
  colaborador: [
    'read:content', 'read:calendar',
    'read:formation', 'log:habits', 'read:prayer',
    'read:community', 'post:community',
    'read:library',
  ],
  benfeitor: [
    'read:content', 'read:gratitude_corner',
    'read:formation', 'read:prayer',
    'read:community', 'read:library',
  ],
  visitante: ['read:public_content', 'read:public_calendar'],
};
