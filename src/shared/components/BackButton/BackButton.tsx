'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface BackButtonProps {
  /** Fallback href quando não há histórico anterior (acesso direto via URL). */
  fallbackHref: string;
  children?: ReactNode;
  className?: string;
  iconOnly?: boolean;
}

/**
 * Botão de voltar que usa router.back() respeitando histórico do browser.
 * Se não houver histórico (entrou direto via link), navega pra fallbackHref.
 */
export function BackButton({
  fallbackHref,
  children = 'Voltar',
  className = 'btn btn-ghost btn-sm gap-1',
  iconOnly = false,
}: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className} aria-label={typeof children === 'string' ? children : 'Voltar'}>
      <ArrowLeft className="w-4 h-4" />
      {!iconOnly && children}
    </button>
  );
}
