'use client';

import RoleProtectedRoute from "@/components/common/RoleProtectedRoute";

export default function AcompanhamentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedRoute allowedRoles={['admin', 'missionario', 'pai']} fallbackPath="/app/dashboard">
      {children}
    </RoleProtectedRoute>
  );
}