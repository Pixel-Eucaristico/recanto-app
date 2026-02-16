'use client';

import React from 'react';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';

interface FeatureGuardProps {
  /** A feature necessária para ver o conteúdo (ex: 'manage:calendar') */
  feature: string;
  /** O conteúdo a ser exibido se o usuário tiver a permissão */
  children: React.ReactNode;
  /** Conteúdo alternativo caso não tenha permissão (opcional) */
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza os filhos apenas se o usuário possuir a permissão especificada.
 * Útil para esconder botões, seções ou links de menu.
 */
export function FeatureGuard({ feature, children, fallback = null }: FeatureGuardProps) {
  const { can } = useAuth();

  if (can(feature)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
