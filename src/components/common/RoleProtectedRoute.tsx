'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { Role } from '@/features/auth/types/user';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  /**
   * Quando definida, basta ter essa feature — mesmo que o role não esteja em
   * `allowedRoles`. Cobre permissões concedidas individualmente ou via
   * `permissions_config`, que a checagem por role sozinha não enxerga.
   */
  requiredFeature?: string;
  fallbackPath?: string;
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
  requiredFeature,
  fallbackPath = '/app/dashboard'
}: RoleProtectedRouteProps) {
  const { user, can, loading, permissionsLoaded } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Estabiliza a dependência: o array literal vindo do JSX muda de identidade a
  // cada render e reexecutaria o efeito em loop.
  const rolesKey = allowedRoles.map(r => r ?? 'null').join(',');
  const isAdmin = user?.role === 'admin' || (user?.features ?? []).includes('*');
  const featureOk = requiredFeature ? can(requiredFeature) : false;

  useEffect(() => {
    // Não decide nada enquanto auth/permissões carregam — negar aqui causaria
    // redirect indevido de quem tem acesso.
    if (loading || !permissionsLoaded) return;

    if (!user) {
      router.push('/app/login');
      return;
    }

    const roleOk = allowedRoles.includes(null) || allowedRoles.includes(user.role ?? null);

    if (!isAdmin && !roleOk && !featureOk) {
      router.push(fallbackPath);
      return;
    }

    setHasAccess(true);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, rolesKey, fallbackPath, loading, permissionsLoaded, isAdmin, featureOk]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return hasAccess ? <>{children}</> : null;
}
