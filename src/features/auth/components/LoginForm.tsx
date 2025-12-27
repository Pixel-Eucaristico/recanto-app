"use client";

import { useState } from "react";
import { useAuth } from "@/features/dashboard/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Role } from "@/features/auth/types/user";

interface LoginFormProps {
  isRegister?: boolean;
}

export function LoginForm({ isRegister = false }: LoginFormProps) {
  const { login, register, loginWithProvider } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      router.push('/app/dashboard');
    } catch (error: any) {
      console.error('Erro:', error);
      setError(error.message || 'Erro ao processar sua solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setIsLoading(true);
    setError(null);

    try {
      await loginWithProvider(provider);
      router.push('/app/dashboard');
    } catch (error: any) {
      console.error('Erro ao fazer login com provedor:', error);
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-2">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
        {isRegister && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nome Completo</span>
            </label>
            <input
              type="text"
              placeholder="Seu nome"
              className="input input-bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            className="input input-bordered"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Senha</span>
          </label>
          <input
            type="password"
            placeholder="******"
            className="input input-bordered"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Carregando...' : isRegister ? 'Cadastrar' : 'Entrar'}
        </button>
      </form>

      {!isRegister && (
        <>
          <div className="divider">ou continue com</div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={`btn btn-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleProviderLogin('google')}
              disabled={isLoading}
            >
              Google
            </button>

            <button
              type="button"
              className={`btn btn-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleProviderLogin('facebook')}
              disabled={isLoading}
            >
              Facebook
            </button>

            <button
              type="button"
              className={`btn btn-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleProviderLogin('twitter')}
              disabled={isLoading}
            >
              Twitter
            </button>
          </div>
        </>
      )}
    </div>
  );
}
