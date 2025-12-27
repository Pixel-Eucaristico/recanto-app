'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { Role } from '@/features/auth/types/user';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallbackPath?: string;
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = '/app/dashboard'
}: RoleProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Verificar autenticação e permissão de cargo
    const checkAuthAndRole = () => {
      if (!user) {
        // Redirecionar para login se não estiver autenticado
        router.push('/app/login');
        return;
      }

      // Verificar se o usuário tem um dos cargos permitidos
      let userHasPermission = false;

      // Se allowedRoles incluir null, qualquer usuário autenticado tem acesso
      if (allowedRoles.includes(null)) {
        userHasPermission = true;
      } else {
        // Verificar se o cargo do usuário está na lista de permitidos
        userHasPermission = allowedRoles.includes(user.role);
      }

      if (!userHasPermission) {
        // Redirecionar se não tiver permissão
        router.push(fallbackPath);
        return;
      }

      setHasAccess(true);
      setIsLoading(false);
    };

    checkAuthAndRole();
  }, [user, router, allowedRoles, fallbackPath]);

  // Mostrar estado de carregamento enquanto verifica autenticação e permissão
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Renderizar o conteúdo protegido apenas se tiver acesso
  return hasAccess ? <>{children}</> : null;
}