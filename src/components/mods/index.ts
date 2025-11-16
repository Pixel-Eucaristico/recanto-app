/**
 * Index Central dos Mods do CMS
 *
 * Importa e exporta todos os Mods disponíveis e suas configurações.
 * Quando criar um novo Mod, adicione-o aqui para disponibilizá-lo no editor.
 */

import Hero from './Hero/Hero';
import { HeroConfig } from './Hero/config';
import HeroMission from './HeroMission/HeroMission';
import { HeroMissionConfig } from './HeroMission/config';
import EventsSection from './EventsSection/EventsSection';
import { EventsSectionConfig } from './EventsSection/config';
import Testimonials from './Testimonials/Testimonials';
import { TestimonialsConfig } from './Testimonials/config';
import EvangelizationActions from './EvangelizationActions/EvangelizationActions';
import { EvangelizationActionsConfig } from './EvangelizationActions/config';
import ProjectsShowcase from './ProjectsShowcase/ProjectsShowcase';
import { ProjectsShowcaseConfig } from './ProjectsShowcase/config';
import { TextIntro } from './TextIntro/TextIntro';
import { textIntroConfig } from './TextIntro/config';
import { TextWithAnimation } from './TextWithAnimation/TextWithAnimation';
import { textWithAnimationConfig } from './TextWithAnimation/config';
import { PillarsGrid } from './PillarsGrid/PillarsGrid';
import { pillarsGridConfig } from './PillarsGrid/config';
import { CallToAction } from './CallToAction/CallToAction';
import { callToActionConfig } from './CallToAction/config';
import { OurLadyHeader } from './OurLadyHeader/OurLadyHeader';
import { ourLadyHeaderConfig } from './OurLadyHeader/config';
import { InfographicGrid } from './InfographicGrid/InfographicGrid';
import { infographicGridConfig } from './InfographicGrid/config';
import HeroWithAnimation from './HeroWithAnimation/HeroWithAnimation';
import { heroWithAnimationConfig } from './HeroWithAnimation/config';
import TextImageAnimation from './TextImageAnimation/TextImageAnimation';
import { textImageAnimationConfig } from './TextImageAnimation/config';
import { HeroStructure } from './HeroStructure/HeroStructure';
import { heroStructureConfig } from './HeroStructure/config';
import { SectionsGrid } from './SectionsGrid/SectionsGrid';
import { sectionsGridConfig } from './SectionsGrid/config';
import { ModConfig } from '@/types/cms-types';

// ============================================
// Mapeamento de Componentes
// ============================================

/**
 * ModComponents - Mapeamento de ID para componente React
 * Usado pelo renderizador dinâmico para instanciar Mods
 */
export const ModComponents = {
  Hero,
  HeroMission,
  HeroWithAnimation,
  HeroStructure,
  EventsSection,
  Testimonials,
  EvangelizationActions,
  ProjectsShowcase,
  TextIntro,
  TextWithAnimation,
  TextImageAnimation,
  PillarsGrid,
  SectionsGrid,
  CallToAction,
  OurLadyHeader,
  InfographicGrid,
  // Futuros Mods:
  // TeamGrid,
  // Gallery,
  // ChartBlock,
  // ContactForm,
} as const;

// ============================================
// Mapeamento de Configurações
// ============================================

/**
 * ModConfigs - Mapeamento de ID para configuração do Mod
 * Usado pelo editor admin para renderizar formulários
 */
export const ModConfigs: Record<string, ModConfig> = {
  Hero: HeroConfig,
  HeroMission: HeroMissionConfig,
  HeroWithAnimation: heroWithAnimationConfig,
  HeroStructure: heroStructureConfig,
  EventsSection: EventsSectionConfig,
  Testimonials: TestimonialsConfig,
  EvangelizationActions: EvangelizationActionsConfig,
  ProjectsShowcase: ProjectsShowcaseConfig,
  TextIntro: textIntroConfig,
  TextWithAnimation: textWithAnimationConfig,
  TextImageAnimation: textImageAnimationConfig,
  PillarsGrid: pillarsGridConfig,
  SectionsGrid: sectionsGridConfig,
  CallToAction: callToActionConfig,
  OurLadyHeader: ourLadyHeaderConfig,
  InfographicGrid: infographicGridConfig,
  // Futuros Configs...
};

/**
 * availableMods - Alias para ModConfigs (compatibilidade)
 */
export const availableMods = ModConfigs;

// ============================================
// Types
// ============================================

/**
 * ModId - Union type de todos os IDs de Mods disponíveis
 */
export type ModId = keyof typeof ModComponents;

/**
 * Lista de categorias de Mods
 */
export const ModCategories = {
  hero: 'Hero',
  content: 'Conteúdo',
  chart: 'Gráficos',
  gallery: 'Galeria',
  form: 'Formulários',
  testimonial: 'Depoimentos',
  cta: 'Call-to-Action',
  other: 'Outros'
} as const;
