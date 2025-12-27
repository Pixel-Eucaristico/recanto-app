/**
 * Firebase Services - Centralized exports
 *
 * Serviços Firebase para todas as entidades do sistema
 * seguindo o roadmap da Fase 1 (MVP Essencial)
 */

export { userService } from './UserService';
export { materialService } from './MaterialService';
export { donationService } from './DonationService';
export { forumTopicService, forumPostService } from './ForumService';
export { eventService } from './EventService';
export { acompanhamentoService } from './AcompanhamentoService';
export { desafioService, desafioRegistroService } from './DesafioService';

// CMS Services (Fase 4)
export { contentPageService } from './ContentPageService';
// Note: contentPageServerService is NOT exported here to avoid bundling Admin SDK in client
// Import directly: import { contentPageServerService } from '@/services/firebase/ContentPageService.server'
export { modConfigService } from './ModConfigService';
export { menuConfigService } from './MenuConfigService';

// Re-export types
export type {
  FirebaseUser,
  Material,
  Donation,
  ForumTopic,
  ForumPost,
  Event,
  AcompanhamentoRecantiano,
  Desafio,
  DesafioRegistro,
} from '@/types/firebase-entities';

// CMS Types
export type {
  CMSPage,
  CMSBlock,
  ModConfig,
  ModPropConfig,
  MenuConfig,
  MenuItem,
} from '@/types/cms-types';
