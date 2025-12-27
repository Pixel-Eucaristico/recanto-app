'use client';

import RoleProtectedRoute from "@/components/common/RoleProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedRoute allowedRoles={['admin']} fallbackPath="/app/dashboard">
      {children}
    </RoleProtectedRoute>
  );
}