'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';

/**
 * Hook para proteger rotas/páginas com base em permissões.
 * 
 * @param feature A permissão necessária para acessar a página.
 * @param redirectTo O caminho para onde redirecionar caso não tenha acesso (default: /app/dashboard).
 */
export function useRequireFeature(feature: string, redirectTo: string = '/app/dashboard') {
  const { can, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só verifica quando terminar de carregar o usuário
    if (!loading) {
      if (!user || !can(feature)) {
        console.warn(`Acesso negado para a feature "${feature}". Redirecionando...`);
        router.push(redirectTo);
      }
    }
  }, [loading, user, feature, can, router, redirectTo]);

  return { isLoading: loading, hasAccess: can(feature) };
}
