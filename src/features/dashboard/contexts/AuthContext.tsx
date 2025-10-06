"use client";

import { Role, User } from "@/features/auth/types/user";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { authService } from "@/services/firebase/AuthService";
import { FirebaseUser } from "@/types/firebase-entities";

interface AuthContextProps {
  user: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: Role
  ) => Promise<void>;
  loginWithProvider: (
    provider: "google" | "facebook" | "twitter"
  ) => Promise<void>;
  loginAs: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Observa mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        // DESENVOLVIMENTO: Aplicar role temporário se existir
        if (typeof window !== "undefined") {
          const tempRole = localStorage.getItem("dev_temp_role");
          if (
            tempRole &&
            tempRole !== "null" &&
            process.env.NODE_ENV !== "production"
          ) {
            // Apenas se o usuário real for admin
            if (firebaseUser.role === "admin") {
              setUser({
                ...firebaseUser,
                role: tempRole as Role,
              });
              setLoading(false);
              return;
            }
          }
        }
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const firebaseUser = await authService.login(email, password);
      setUser(firebaseUser);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: Role = null
  ) => {
    try {
      const firebaseUser = await authService.register(
        email,
        password,
        name,
        role
      );
      setUser(firebaseUser);
    } catch (error) {
      console.error("Erro ao registrar:", error);
      throw error;
    }
  };

  const loginWithProvider = async (
    provider: "google" | "facebook" | "twitter"
  ) => {
    try {
      const firebaseUser = await authService.loginWithProvider(provider);
      setUser(firebaseUser);
    } catch (error) {
      console.error("Erro ao fazer login com provedor:", error);
      throw error;
    }
  };

  // Função temporária para desenvolvimento - simula login com role
  const loginAs = async (role: Role) => {
    const testEmail = `test-${role}@recanto.com`;
    const testPassword = "test123456";
    const testName = `Usuário ${role || "Visitante"}`;

    try {
      // Tenta fazer login
      await login(testEmail, testPassword);
    } catch {
      // Se falhar, registra novo usuário
      await register(testEmail, testPassword, testName, role);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginWithProvider,
        loginAs,
        logout,
        loading,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
