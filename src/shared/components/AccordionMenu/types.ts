import type { ReactNode } from 'react';

/** Item folha — link clicável ou ação. */
export interface AccordionMenuLeaf {
  type?: 'leaf';
  label: ReactNode;
  /** URL pra navegação (usa next/link se presente). */
  href?: string;
  /** Handler de click. Ignorado se `href` estiver setado. */
  onClick?: () => void;
  /** Ícone Lucide (ou qualquer ReactNode). */
  icon?: ReactNode;
  /** Marcado como ativo (highlight DaisyUI). */
  active?: boolean;
  /** Classes extras no link/botão do item. */
  className?: string;
  /** Desabilita o item. */
  disabled?: boolean;
  /** Atributo aria-label, opcional. */
  ariaLabel?: string;
}

/** Item pai — agrupa filhos em `<details>` sanfona. */
export interface AccordionMenuParent {
  type: 'parent';
  label: ReactNode;
  icon?: ReactNode;
  /** Classes extras no `<summary>` do grupo. */
  className?: string;
  /** Estado inicial aberto/fechado. Default: false. */
  defaultOpen?: boolean;
  children: AccordionMenuItem[];
}

export type AccordionMenuItem = AccordionMenuLeaf | AccordionMenuParent;

/** Variantes de tamanho do menu (mapeiam `menu-xs`/`menu-sm`/`menu-md`/`menu-lg`). */
export type AccordionMenuSize = 'xs' | 'sm' | 'md' | 'lg';
