"use client";

import { Role, User } from "@/features/auth/types/user";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authService } from "@/services/firebase/AuthService";
import { FirebaseUser } from "@/types/firebase-entities";
import { isFirebaseConfigured } from "@/domains/auth/services/firebaseClient";

interface AuthContextProps {
  user: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: Role) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'facebook' | 'twitter') => Promise<void>;
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
        const tempRole = localStorage.getItem('dev_temp_role');
        if (tempRole && tempRole !== 'null' && process.env.NODE_ENV !== 'production') {
          // Apenas se o usuário real for admin
          if (firebaseUser.role === 'admin') {
            setUser({
              ...firebaseUser,
              role: tempRole as Role
            });
            setLoading(false);
            return;
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
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: Role = null) => {
    try {
      const firebaseUser = await authService.register(email, password, name, role);
      setUser(firebaseUser);
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  };

  const loginWithProvider = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      const firebaseUser = await authService.loginWithProvider(provider);
      setUser(firebaseUser);
    } catch (error) {
      console.error('Erro ao fazer login com provedor:', error);
      throw error;
    }
  };

  // Função temporária para desenvolvimento - simula login com role
  const loginAs = async (role: Role) => {
    const testEmail = `test-${role}@recanto.com`;
    const testPassword = 'test123456';
    const testName = `Usuário ${role || 'Visitante'}`;

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
      window.location.href = "/";
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  // Se Firebase não está configurado, mostra mensagem informativa
  if (!isFirebaseConfigured) {
    return (
      <AuthContext.Provider value={{ user: null, login, register, loginWithProvider, loginAs, logout, loading: false }}>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Firebase não configurado
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              As variáveis de ambiente do Firebase não estão configuradas. 
              Configure-as para usar a autenticação.
            </p>
            <div className="text-xs text-gray-500">
              <p>Consulte o arquivo <code>.env.example</code> para mais informações.</p>
            </div>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithProvider, loginAs, logout, loading }}>
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
