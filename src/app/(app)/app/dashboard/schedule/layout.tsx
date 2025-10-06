import React from 'react';
import RoleProtectedRoute from '@/components/common/RoleProtectedRoute';

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'missionario', 'recantiano']} 
      fallbackPath="/app/dashboard"
    >
      {children}
    </RoleProtectedRoute>
  );
}