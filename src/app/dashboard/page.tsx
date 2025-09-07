'use client';

import { signOut } from 'firebase/auth';
import { useAtomValue } from 'jotai';
import { auth } from '@/lib/firebase';
import { userAtom } from '@/lib/auth-store';
import { AuthGuard } from '@/components/auth-guard';

// Disable SSR for this page
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const user = useAtomValue(userAtom);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-base-200">
        <div className="navbar bg-base-100 shadow-lg">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Recanto App</h1>
          </div>
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a className="justify-between">
                    Perfil
                    <span className="badge">Novo</span>
                  </a>
                </li>
                <li>
                  <a>Configurações</a>
                </li>
                <li>
                  <button onClick={handleSignOut}>Sair</button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="hero bg-base-100 rounded-lg shadow-xl">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-5xl font-bold">Bem-vindo!</h1>
                <p className="py-6">
                  Olá, {user?.displayName || user?.email}! Você está logado no
                  Recanto App.
                </p>
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">Status</div>
                    <div className="stat-value text-primary">Ativo</div>
                    <div className="stat-desc">Usuário autenticado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}