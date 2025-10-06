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
