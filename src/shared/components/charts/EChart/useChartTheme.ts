'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/components/ui/daisyui/theme-controller';
import { useSystemTheme } from '@/components/ui/daisyui/theme-controller/hooks/useSystemTheme';

export interface ChartTheme {
  /** 8 hues categóricos na ordem validada. Nunca gerar um 9º. */
  palette: string[];
  /** Cor do gráfico sobre a superfície — usada em gaps e anéis de marcador. */
  surface: string;
  /** Texto principal (valores, rótulos diretos). */
  ink: string;
  /** Texto secundário (eixos, legenda). */
  inkMuted: string;
  /** Linha de grade e eixo — hairline recessivo. */
  grid: string;
  /** Cinza de contexto: séries não enfatizadas. */
  muted: string;
  /** Cores de status. Só onde a cor SIGNIFICA estado, sempre com ícone/rótulo. */
  success: string;
  warning: string;
  error: string;
  /** 'light' | 'dark' — derivado do `color-scheme` do tema ativo. */
  scheme: 'light' | 'dark';
}

const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Fallback só para SSR/jsdom, onde não há estilo computado. */
const FALLBACK: ChartTheme = {
  palette: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  surface: '#f9f8f5',
  ink: '#1c1917',
  inkMuted: '#78716c',
  grid: '#e7e5e4',
  muted: '#d6d3d1',
  success: '#0ca30c',
  warning: '#fab219',
  error: '#d03b3b',
  scheme: 'light',
};

function read(styles: CSSStyleDeclaration, name: string): string {
  return styles.getPropertyValue(name).trim();
}

/**
 * Resolve os tokens do tema a partir de um elemento DO GRÁFICO.
 *
 * ⚠️ Nunca ler de `document.documentElement`: o tema DaisyUI real vive num
 * `<div data-theme>` (ver `theme.provider.tsx`), enquanto o `<html>` carrega os
 * temas genéricos `light`/`dark` do next-themes — cores completamente diferentes.
 * Custom properties herdam, então o próprio elemento já tem os valores certos.
 */
export function resolveChartTheme(element: HTMLElement | null): ChartTheme {
  if (!element || typeof window === 'undefined') return FALLBACK;

  let styles = window.getComputedStyle(element);

  // O DaisyUI declara `color-scheme` em cada tema — serve para qualquer um dos
  // temas carregados, sem precisar mapear nome por nome.
  const schemeOf = (s: CSSStyleDeclaration): 'light' | 'dark' =>
    read(s, 'color-scheme').includes('dark') ? 'dark' : 'light';

  const paletteOf = (s: CSSStyleDeclaration, scheme: 'light' | 'dark') =>
    SLOTS.map(i => read(s, `--chart-${scheme}-${i}`)).filter(Boolean);

  let scheme = schemeOf(styles);
  let palette = paletteOf(styles, scheme);

  // Custom properties herdam, então normalmente o próprio elemento já resolve. Se
  // não resolveu (borda de shadow DOM, ou o nó ainda não está no documento), sobe
  // até o container do tema — que é onde o provider grava o `data-theme`.
  if (palette.length !== SLOTS.length) {
    const themed = element.closest('[data-theme]');
    if (themed instanceof HTMLElement) {
      styles = window.getComputedStyle(themed);
      scheme = schemeOf(styles);
      palette = paletteOf(styles, scheme);
    }
  }

  const baseContent = read(styles, '--color-base-content');
  const base100 = read(styles, '--color-base-100');
  const base300 = read(styles, '--color-base-300');

  return {
    palette: palette.length === SLOTS.length ? palette : FALLBACK.palette,
    surface: base100 || FALLBACK.surface,
    ink: baseContent || FALLBACK.ink,
    // Texto de eixo/legenda: mesma tinta atenuada — nunca a cor da série.
    inkMuted: baseContent ? withAlpha(baseContent, 0.6) : FALLBACK.inkMuted,
    grid: base300 || FALLBACK.grid,
    muted: base300 || FALLBACK.muted,
    success: read(styles, '--color-success') || FALLBACK.success,
    warning: read(styles, '--color-warning') || FALLBACK.warning,
    error: read(styles, '--color-error') || FALLBACK.error,
    scheme,
  };
}

/**
 * Aplica opacidade a uma cor mantendo o espaço de cor original.
 *
 * Os tokens do projeto são `oklch(...)`; `color-mix` preserva isso sem precisar
 * converter para rgb à mão.
 */
function withAlpha(color: string, alpha: number): string {
  return `color-mix(in oklch, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

/**
 * Tokens do gráfico, reavaliados quando o tema muda.
 *
 * Depende de `useTheme` (Jotai, fonte da verdade) e `useSystemTheme` — mesmas
 * dependências que o próprio `ThemeProvider` usa para resolver o tema.
 */
export function useChartTheme(element: HTMLElement | null): ChartTheme {
  const [theme] = useTheme();
  const systemTheme = useSystemTheme();
  const [resolved, setResolved] = useState<ChartTheme>(FALLBACK);

  const recompute = useCallback(() => {
    setResolved(resolveChartTheme(element));
  }, [element]);

  useEffect(() => {
    if (!element) return;
    // Um frame de espera: o provider troca o `data-theme` no mesmo tick, e ler
    // antes disso devolveria os tokens do tema anterior.
    const raf = requestAnimationFrame(recompute);
    return () => cancelAnimationFrame(raf);
  }, [element, recompute, theme, systemTheme]);

  return resolved;
}
