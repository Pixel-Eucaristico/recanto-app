'use client';

import Link from 'next/link';
import type { AccordionMenuItem, AccordionMenuLeaf, AccordionMenuParent, AccordionMenuSize } from './types';

interface AccordionMenuProps {
  /** Lista de itens (suporta aninhamento recursivo). */
  items: AccordionMenuItem[];
  /** Tamanho via classe DaisyUI. Default: 'md'. */
  size?: AccordionMenuSize;
  /** Largura do menu. Default: `w-56`. Passe '' pra width auto. */
  width?: string;
  /** Background DaisyUI. Default: `bg-base-200`. */
  background?: string;
  /** Classes extras no `<ul>` raiz. */
  className?: string;
}

const SIZE_CLASS: Record<AccordionMenuSize, string> = {
  xs: 'menu-xs',
  sm: 'menu-sm',
  md: '',
  lg: 'menu-lg',
};

/**
 * Menu DaisyUI sanfona — itens podem ser leaf (link/onClick) ou parent
 * (agrupa filhos via `<details>`). Recursão suporta níveis arbitrários.
 *
 * @example
 * <AccordionMenu items={[
 *   { label: 'Home', href: '/', icon: <Home /> },
 *   { type: 'parent', label: 'Library', defaultOpen: true, children: [
 *     { label: 'Books', href: '/library/books' },
 *     { type: 'parent', label: 'Categories', children: [
 *       { label: 'Spirituality', href: '/cat/spirituality' },
 *     ]},
 *   ]},
 * ]} />
 */
export function AccordionMenu({
  items,
  size = 'md',
  width = 'w-56',
  background = 'bg-base-200',
  className = '',
}: AccordionMenuProps) {
  const sizeClass = SIZE_CLASS[size];
  return (
    <ul className={`menu ${sizeClass} ${background} ${width} rounded-box ${className}`.trim()}>
      {items.map((item, idx) => (
        <MenuItem key={getItemKey(item, idx)} item={item} />
      ))}
    </ul>
  );
}

function MenuItem({ item }: { item: AccordionMenuItem }) {
  if (isParent(item)) {
    return <ParentItem item={item} />;
  }
  return <LeafItem item={item} />;
}

function ParentItem({ item }: { item: AccordionMenuParent }) {
  return (
    <li>
      <details open={item.defaultOpen ?? false}>
        <summary className={item.className}>
          {item.icon}
          <span className="min-w-0 flex-1">{item.label}</span>
        </summary>
        <ul>
          {item.children.map((child, idx) => (
            <MenuItem key={getItemKey(child, idx)} item={child} />
          ))}
        </ul>
      </details>
    </li>
  );
}

function LeafItem({ item }: { item: AccordionMenuLeaf }) {
  const inner = (
    <>
      {item.icon}
      <span className="min-w-0 flex-1">{item.label}</span>
    </>
  );

  const baseClass = item.active ? 'menu-active' : '';
  const disabledClass = item.disabled ? 'menu-disabled' : '';
  const finalClass = `${baseClass} ${disabledClass} ${item.className ?? ''}`.trim();

  if (item.disabled) {
    return (
      <li className="menu-disabled">
        <span aria-label={item.ariaLabel}>{inner}</span>
      </li>
    );
  }

  if (item.href) {
    return (
      <li>
        <Link href={item.href} className={finalClass} aria-label={item.ariaLabel}>
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={item.onClick}
        className={finalClass}
        aria-label={item.ariaLabel}
      >
        {inner}
      </button>
    </li>
  );
}

function isParent(item: AccordionMenuItem): item is AccordionMenuParent {
  return item.type === 'parent';
}

function getItemKey(item: AccordionMenuItem, idx: number): string {
  if (typeof item.label === 'string') return `${item.label}-${idx}`;
  if (isParent(item) === false && item.href) return `${item.href}-${idx}`;
  return `item-${idx}`;
}
