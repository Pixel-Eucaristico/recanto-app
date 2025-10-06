'use client';

import RoleProtectedRoute from "@/components/common/RoleProtectedRoute";

export default function DesafiosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedRoute allowedRoles={['recantiano']} fallbackPath="/app/dashboard">
      {children}
    </RoleProtectedRoute>
  );
}