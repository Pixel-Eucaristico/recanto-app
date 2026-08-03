import React from 'react';
import RoleProtectedRoute from '@/components/common/RoleProtectedRoute';

/**
 * Guarda das rotas de acompanhamento (`students`, `approvals`, `writings`).
 *
 * Barreira grossa: quem entra é admin, missionário ou qualquer usuário com
 * `review:formation` concedida individualmente. O recorte fino — quais trilhas e
 * quais alunos — fica no `StudentWritingsService` e nas Firestore rules.
 */
export default function FormatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute
      allowedRoles={['admin', 'missionario']}
      requiredFeature="review:formation"
      fallbackPath="/app/dashboard/journey"
    >
      {children}
    </RoleProtectedRoute>
  );
}
