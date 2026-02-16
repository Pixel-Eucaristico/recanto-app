"use client";

import { Role, User } from "@/features/auth/types/user";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authService } from "@/services/firebase/AuthService";
import { FirebaseUser } from "@/types/firebase-entities";
import { hasFeature } from "@/lib/permissions";
import { permissionsConfigService } from "@/entities/PermissionsConfig";

interface AuthContextProps {
  user: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: Role) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'facebook' | 'twitter') => Promise<void>;
  loginAs: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  can: (feature: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dynamicPermissions, setDynamicPermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  // Observa mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      console.log('🔄 [AuthContext] Recebido usuário do AuthService:', firebaseUser?.email, 'role:', firebaseUser?.role);

      if (firebaseUser) {
        // DESENVOLVIMENTO: Aplicar role temporário APENAS se for admin querendo testar outra role
        let finalUser = firebaseUser;
        const tempRole = localStorage.getItem('dev_temp_role');

        if (tempRole && tempRole !== 'null' && process.env.NODE_ENV !== 'production') {
          // Só permite override se o usuário REAL for admin (verificado pelo banco)
          if (firebaseUser.role === 'admin') {
            console.log(`🎭 [AuthContext] DEV: Simulando role "${tempRole}" (usuário real é admin)`);
            finalUser = { ...firebaseUser, role: tempRole as Role };
          } else {
            // Se não for admin, limpar o tempRole para evitar confusão
            localStorage.removeItem('dev_temp_role');
          }
        }

        // ✅ ATUALIZAR ESTADO LOCAL
        setUser(finalUser);
        setLoading(false);

        // ✅ SINCRONIZAR SESSÃO COM O SERVIDOR
        try {
          const { auth } = await import('@/domains/auth/services/firebaseClient');
          const currentUser = auth.currentUser;

          if (currentUser) {
            const token = await currentUser.getIdToken();

            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token })
            });

            if (response.ok) {
              console.log('✅ [AuthContext] Sessão sincronizada com o servidor.');
            } else {
              console.error('❌ [AuthContext] Erro ao sincronizar sessão:', await response.text());
            }
          }
        } catch (error) {
          console.error('❌ [AuthContext] Erro ao sincronizar sessão:', error);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Observa mudanças nas permissões dinâmicas dos grupos (Roles)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Atraso de 500ms para evitar INTERNAL ASSERTION FAILED no Firestore durante o mount
    const timer = setTimeout(() => {
      try {
        console.log('🔐 [AuthContext] Iniciando listener de permissões dinâmicas...');
        unsubscribe = permissionsConfigService.onValueChange((configs: any[]) => {
          if (!configs || configs.length === 0) {
            console.warn('⚠️ [AuthContext] Nenhuma configuração de permissão encontrada no Firestore.');
            return;
          }
          
          const map: Record<string, string[]> = {};
          configs.forEach(c => {
            if (c && c.id) map[c.id] = c.features || [];
          });
          
          console.log(`✅ [AuthContext] ${Object.keys(map).length} grupos de permissão carregados.`);
          setDynamicPermissions(map);
        });
      } catch (error) {
        console.error('❌ [AuthContext] Falha crítica ao iniciar listener de permissões:', error);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (unsubscribe) {
        console.log('🔕 [AuthContext] Removendo listener de permissões.');
        unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      // A sincronização de sessão ocorre no onAuthStateChange agora
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: Role = null) => {
    try {
      await authService.register(email, password, name, role);
      // A sincronização de sessão ocorre no onAuthStateChange agora
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  };

  const loginWithProvider = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      await authService.loginWithProvider(provider);
      // A sincronização de sessão ocorre no onAuthStateChange agora
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

  const can = (feature: string) => {
    return hasFeature(user, feature, dynamicPermissions);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithProvider, loginAs, logout, can, loading }}>
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
