'use client';

import RoleProtectedRoute from "@/components/common/RoleProtectedRoute";

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedRoute allowedRoles={['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor']} fallbackPath="/app/dashboard">
      {children}
    </RoleProtectedRoute>
  );
}