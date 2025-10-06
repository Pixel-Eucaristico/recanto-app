'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export default function ProtectedRoute({ children, fallbackPath = '/' }: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação
    const checkAuth = () => {
      const hasSession = localStorage.getItem('session');
      
      if (!user && !hasSession) {
        // Redirecionar para a página inicial se não estiver autenticado
        router.push(fallbackPath);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, router, fallbackPath]);

  // Mostrar estado de carregamento enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Renderizar o conteúdo protegido
  return <>{children}</>;
}