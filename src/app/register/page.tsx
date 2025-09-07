'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { registerSchema, RegisterFormData } from '@/lib/validations';
import { AuthGuard } from '@/components/auth-guard';

// Disable SSR for this page
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: data.name,
      });
    } catch (error) {
      const firebaseError = error as { code: string };
      setError(getErrorMessage(firebaseError.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/weak-password':
        return 'A senha é muito fraca';
      case 'auth/operation-not-allowed':
        return 'Operação não permitida';
      default:
        return 'Erro ao criar conta. Tente novamente';
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold text-center mb-6">
              Criar Conta
            </h2>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nome</span>
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  className={`input input-bordered w-full ${
                    errors.name ? 'input-error' : ''
                  }`}
                  {...register('name')}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.name.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={`input input-bordered w-full ${
                    errors.email ? 'input-error' : ''
                  }`}
                  {...register('email')}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.email.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Senha</span>
                </label>
                <input
                  type="password"
                  placeholder="Sua senha"
                  className={`input input-bordered w-full ${
                    errors.password ? 'input-error' : ''
                  }`}
                  {...register('password')}
                />
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.password.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirmar Senha</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirme sua senha"
                  className={`input input-bordered w-full ${
                    errors.confirmPassword ? 'input-error' : ''
                  }`}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.confirmPassword.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${
                    isLoading ? 'loading' : ''
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </button>
              </div>
            </form>

            <div className="divider">OU</div>

            <div className="text-center">
              <p className="text-sm">
                Já tem uma conta?{' '}
                <Link href="/login" className="link link-primary">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}