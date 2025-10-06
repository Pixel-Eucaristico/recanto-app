"use client";

import { AuthProvider } from "@/features/dashboard/contexts/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
