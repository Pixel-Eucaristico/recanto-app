"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Role } from "@/features/auth/types/user";
import type { FirebaseUser } from "@/types/firebase-entities";
import { useAuthProvider } from "./hooks/useAuthProvider";

interface AuthContextProps {
  user: FirebaseUser | null;
  authProviders: string[];
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: Role, birthdate?: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'facebook' | 'twitter') => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  createLocalPassword: (password: string) => Promise<void>;
  loginAs: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  can: (feature: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = useAuthProvider();

  return (
    <AuthContext.Provider value={value}>
      {value.loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
