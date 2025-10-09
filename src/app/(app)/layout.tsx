"use client";

import { AuthProvider } from "@/features/dashboard/contexts/AuthContext";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}