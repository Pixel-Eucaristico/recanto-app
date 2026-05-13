"use client";

import { useState } from "react";
import { useAuth } from "@/features/dashboard/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { registerSchema, loginSchema } from "@/features/auth/schemas/registerSchema";

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
  const [birthdate, setBirthdate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const parsed = registerSchema.safeParse({ name, email, password, birthdate });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
          setIsLoading(false);
          return;
        }
        await register(parsed.data.email, parsed.data.password, parsed.data.name, null, parsed.data.birthdate);
      } else {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
          setIsLoading(false);
          return;
        }
        await login(parsed.data.email, parsed.data.password);
      }
      router.push('/app/dashboard');
    } catch (error: unknown) {
      console.error('Erro:', error);
      const message = error instanceof Error ? error.message : 'Erro ao processar sua solicitação';
      setError(message);
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
    } catch (error: unknown) {
      console.error('Erro ao fazer login com provedor:', error);
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      {error && (
        <div className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
        {isRegister && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nome completo</span>
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

        {isRegister && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Data de nascimento</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            <span className="label-text-alt mt-1 text-base-content/60">
              Usada para classificação indicativa de conteúdo.
            </span>
          </div>
        )}

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
          </div>
        </>
      )}
    </div>
  );
}
