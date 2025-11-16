import { Role } from '@/features/auth/types/user';
import { LucideIcon } from 'lucide-react';

// ============================================
// CMS Types - Sistema Modular Headless
// ============================================

/**
 * Bloco de conteúdo em uma página CMS
 * Cada bloco representa um Mod (componente) com suas props
 */
export interface CMSBlock {
  id: string;                      // ID único do bloco
  modId: string;                   // ID do Mod (ex: "Hero", "Gallery")
  props: Record<string, any>;      // Props dinâmicas do Mod
  order: number;                   // Ordem de renderização
}

/**
 * Página gerenciada pelo CMS
 * Contém metadados e array de blocos
 */
export interface CMSPage {
  id: string;
  slug: string;                    // URL da página (ex: "/sobre", "/")
  title: string;
  description?: string;
  blocks: CMSBlock[];              // Array de blocos
  is_published: boolean;
  target_audience?: Role[];        // Controle de acesso (opcional)
  seo?: {
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
  };
  // Campos de menu navbar
  show_in_menu?: boolean;                // Se aparece no menu de navegação
  menu_order?: number;                   // Ordem no menu (0 = primeiro)
  menu_parent_id?: string | null;        // ID da página pai (para submenu)
  menu_icon?: string;                    // Ícone Lucide (para submenus)
  menu_description?: string;             // Descrição no submenu
  menu_url_type?: 'page' | 'external';   // Tipo de URL: página CMS ou externa
  menu_external_url?: string;            // URL externa (se menu_url_type = 'external')
  is_menu_container?: boolean;           // Se é apenas container de submenu (não tem página)
  // Temas da página
  theme_light?: string;                  // Tema para modo claro (ex: 'recanto-light', 'cupcake')
  theme_dark?: string;                   // Tema para modo escuro (ex: 'recanto-dark', 'dracula')
  // Estilos da página
  font_family?: string;                  // Fonte Google Fonts (ex: 'Inter', 'Roboto', 'Lora')
  bg_color?: string;                     // Cor de fundo DaisyUI (ex: 'base-100', 'primary')
  created_at: string;
  updated_at?: string;
}

/**
 * Configuração de um Mod
 * Define como o Mod será renderizado no editor admin
 */
export interface ModConfig {
  id: string;                      // ID único do Mod
  name: string;                    // Nome amigável
  description?: string;
  icon?: string | LucideIcon;      // Ícone Lucide (string ou componente)
  category: 'hero' | 'content' | 'chart' | 'gallery' | 'form' | 'testimonial' | 'cta' | 'other';
  props?: ModPropConfig[];         // Definição das props editáveis (opcional)
  fields?: ModPropConfig[];        // Alias para props (compatibilidade)
  defaultProps?: Record<string, any>; // Props padrão do Mod
  preview?: string;                // URL de preview
}

/**
 * Opção de select com value e label
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Configuração de uma prop de Mod
 * Define como cada prop será editada no admin
 */
export interface ModPropConfig {
  key?: string;                    // Nome da prop (legacy)
  name?: string;                   // Nome da prop (novo padrão)
  label: string;                   // Label no editor
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'json-editor' | 'image' | 'color' | 'date' | 'string' | 'url' | 'testimonials-editor' | 'paragraphs-editor' | 'animation-picker' | 'pillars-editor' | 'buttons-editor' | 'evangelization-actions-editor' | 'projects-editor' | 'our-lady-header-editor' | 'infographic-cards-editor' | 'html-editor' | 'wysiwyg-editor' | 'font-family' | 'bg-color' | 'hero-with-animation-editor' | 'text-image-animation-editor' | 'animation' | 'icon' | 'array';
  options?: (string | SelectOption)[];  // Para type="select" - suporta strings simples ou {value, label}
  required?: boolean;
  default?: any;                   // Valor padrão (novo)
  defaultValue?: any;              // Valor padrão (legacy)
  placeholder?: string;
  description?: string;            // Descrição da prop (novo)
  helpText?: string;               // Texto de ajuda (legacy)
  multiline?: boolean;             // Para textarea (string multiline)
  itemType?: string;               // Para arrays: tipo dos itens ('html', 'text', etc)
}

// ============================================
// Our Lady Page Types
// ============================================

/**
 * Header da página Nossa Senhora
 */
export interface OurLadyHeader {
  imageUrl: string;              // URL da imagem (Nossa Senhora)
  title: string;                 // Título principal
  subtitle: string;              // Subtítulo
}

/**
 * Card do infográfico Nossa Senhora
 */
export interface InfographicCard {
  id: string;                    // ID único do card
  title: string;                 // Título do card
  body: string;                  // Corpo do card (HTML permitido)
  iconName?: string;             // Nome do ícone Lucide (ex: 'Heart', 'Cross')
  lottieFile?: string;           // Arquivo Lottie (ex: 'church.json')
  imagePosition: 'float-start' | 'float-end' | 'float-left' | 'float-right';
}

// ============================================
// Menu Configuration Types
// ============================================

/**
 * Item de menu (pode conter subitems)
 */
export interface MenuItem {
  id: string;                      // ID único do item
  title: string;                   // Título exibido no menu
  url: string;                     // URL de destino
  description?: string;            // Descrição (para submenus)
  icon?: string;                   // Nome do ícone Lucide (ex: "Sunset", "Crown")
  order: number;                   // Ordem de exibição
  items?: MenuItem[];              // Subitens (submenu)
}

/**
 * Configuração completa do menu navbar
 */
export interface MenuConfig {
  id: string;                      // Sempre "main_menu" (singleton)
  items: MenuItem[];               // Array de itens principais
  is_published: boolean;           // Se o menu CMS está ativo
  created_at: string;
  updated_at?: string;
}
