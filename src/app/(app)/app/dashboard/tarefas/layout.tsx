'use client';

import RoleProtectedRoute from "@/components/common/RoleProtectedRoute";

export default function TarefasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedRoute allowedRoles={['colaborador']} fallbackPath="/app/dashboard">
      {children}
    </RoleProtectedRoute>
  );
}