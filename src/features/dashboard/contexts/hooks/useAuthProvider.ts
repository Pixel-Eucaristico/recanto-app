"use client";

import { useEffect, useState } from "react";
import type { Role } from "@/features/auth/types/user";
import { authService } from "@/services/firebase/AuthService";
import { FirebaseUser } from "@/types/firebase-entities";
import { hasFeature } from "@/lib/permissions";
import { permissionsConfigService } from "@/entities/PermissionsConfig";

/** Tempo máximo esperando `permissions_config` antes de cair nos defaults de role. */
const FALLBACK_PERMISSIONS_MS = 3000;

const DEV_LOG = process.env.NODE_ENV !== 'production';
const devLog = (...args: unknown[]) => { if (DEV_LOG) console.log(...args); };
const devWarn = (...args: unknown[]) => { if (DEV_LOG) console.warn(...args); };

export function useAuthProvider() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authProviders, setAuthProviders] = useState<string[]>([]);
  const [dynamicPermissions, setDynamicPermissions] = useState<Record<string, string[]>>({});
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      devLog('🔄 [AuthContext] Recebido usuário do AuthService:', firebaseUser?.email, 'role:', firebaseUser?.role);

      if (firebaseUser) {
        let finalUser = firebaseUser;
        const tempRole = localStorage.getItem('dev_temp_role');
        if (tempRole && tempRole !== 'null' && process.env.NODE_ENV !== 'production') {
          if (firebaseUser.role === 'admin') {
            devLog(`🎭 [AuthContext] DEV: Simulando role "${tempRole}"`);
            finalUser = { ...firebaseUser, role: tempRole as Role };
          } else {
            localStorage.removeItem('dev_temp_role');
          }
        }

        setUser(finalUser);
        setLoading(false);

        try {
          const { auth } = await import('@/domains/auth/services/firebaseClient');
          const currentUser = auth.currentUser;
          if (currentUser) {
            setAuthProviders(currentUser.providerData.map(p => p.providerId));
            const token = await currentUser.getIdToken();
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
            if (response.ok) devLog('✅ [AuthContext] Sessão sincronizada.');
            else console.error('❌ [AuthContext] Erro ao sincronizar sessão:', await response.text());
          }
        } catch (error) {
          console.error('❌ [AuthContext] Erro ao sincronizar sessão:', error);
        }
      } else {
        setUser(null);
        setAuthProviders([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Rede de segurança: se o listener demorar ou a coleção estiver vazia, libera a UI
    // com os defaults de DEFAULT_ROLE_PERMISSIONS em vez de travar em "carregando".
    const fallbackTimer = setTimeout(() => setPermissionsLoaded(true), FALLBACK_PERMISSIONS_MS);

    const timer = setTimeout(() => {
      try {
        devLog('🔐 [AuthContext] Iniciando listener de permissões...');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unsubscribe = permissionsConfigService.onValueChange((configs: any[]) => {
          // Marca carregado mesmo sem configs — a ausência de permissions_config é um
          // estado válido (cai nos defaults), não um estado pendente.
          setPermissionsLoaded(true);
          if (!configs || configs.length === 0) { devWarn('⚠️ Nenhuma configuração de permissão encontrada.'); return; }
          const map: Record<string, string[]> = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          configs.forEach((c: any) => { if (c && c.id) map[c.id] = c.features || []; });
          devLog(`✅ [AuthContext] ${Object.keys(map).length} grupos de permissão carregados.`);
          setDynamicPermissions(map);
        });
      } catch (error) {
        console.error('❌ [AuthContext] Falha ao iniciar listener de permissões:', error);
        setPermissionsLoaded(true);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try { await authService.login(email, password); }
    catch (error) { console.error('Erro ao fazer login:', error); throw error; }
  };

  const register = async (email: string, password: string, name: string, role: Role = null, birthdate?: string) => {
    try { await authService.register(email, password, name, role, birthdate); }
    catch (error) { console.error('Erro ao registrar:', error); throw error; }
  };

  const loginWithProvider = async (provider: 'google' | 'facebook' | 'twitter') => {
    try { await authService.loginWithProvider(provider); }
    catch (error) { console.error('Erro ao fazer login com provedor:', error); throw error; }
  };

  const linkGoogleAccount = async () => {
    try { await authService.linkGoogleAccount(); }
    catch (error) { console.error('Erro ao vincular conta Google:', error); throw error; }
  };

  const createLocalPassword = async (password: string) => {
    try { await authService.createLocalPassword(password); }
    catch (error) { console.error('Erro ao criar senha local:', error); throw error; }
  };

  const loginAs = async (role: Role) => {
    const testEmail = `test-${role}@recanto.com`;
    const testPassword = 'test123456';
    const testName = `Usuário ${role || 'Visitante'}`;
    try { await login(testEmail, testPassword); }
    catch { await register(testEmail, testPassword, testName, role); }
  };

  const logout = async () => {
    try { await authService.logout(); setUser(null); window.location.href = '/'; }
    catch (error) { console.error('Erro ao fazer logout:', error); throw error; }
  };

  const can = (feature: string) => hasFeature(user, feature, dynamicPermissions);

  return {
    user, authProviders, login, register, loginWithProvider, linkGoogleAccount,
    createLocalPassword, loginAs, logout, can, loading,
    dynamicPermissions, permissionsLoaded,
  };
}
