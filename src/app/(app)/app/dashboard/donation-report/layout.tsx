'use client';

import RoleProtectedRoute from "@/components/common/RoleProtectedRoute";

export default function DonationReportLayout({
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