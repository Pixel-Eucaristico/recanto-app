'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyChapterProps {
  /** ID estável pra debug + chave. */
  chapterId: string;
  /** Altura estimada antes do mount (px). */
  estimatedHeight?: number;
  /** Distância antes do viewport pra começar a montar (px). */
  preloadMargin?: number;
  /** Quando true, monta imediatamente (deep-link, initialRef target). */
  forceMount?: boolean;
  children: ReactNode;
}

/**
 * Monta um capítulo só quando se aproxima da viewport.
 * Reduz custo de markdown parse + DOM nodes pra livros grandes (500+ capítulos).
 *
 * Estratégia:
 * - Placeholder com altura estimada
 * - IntersectionObserver com rootMargin = preloadMargin
 * - Uma vez montado, FICA montado (evita unmount/remount thrash durante scroll)
 *
 * Pra unmount agressivo seria preciso lidar com scroll restoration + flicker.
 * v1 prefere correção a perfeição.
 */
export function LazyChapter({
  chapterId,
  estimatedHeight = 800,
  preloadMargin = 1200,
  forceMount = false,
  children,
}: LazyChapterProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(forceMount);

  useEffect(() => {
    if (forceMount && !mounted) setMounted(true);
  }, [forceMount, mounted]);

  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: `${preloadMargin}px 0px ${preloadMargin}px 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted, preloadMargin]);

  if (mounted) {
    return <div ref={ref} data-chapter-lazy={chapterId}>{children}</div>;
  }
  return (
    <div
      ref={ref}
      data-chapter-lazy={chapterId}
      style={{ minHeight: estimatedHeight, contentVisibility: 'auto', containIntrinsicSize: `auto ${estimatedHeight}px` }}
      aria-hidden="true"
    />
  );
}
