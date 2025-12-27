'use client';

import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { UserPen, Mail, Phone, User, Shield, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-base-content">
          Editar Perfil
        </h1>
        <p className="text-base-content/60 mt-2">
          Gerencie suas informações pessoais
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card de informações do usuário */}
        <div className="lg:col-span-2">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-base-content">
                <UserPen className="w-5 h-5" />
                Informações Pessoais
              </h2>

              <form className="space-y-4 mt-4">
                {/* Nome */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nome Completo</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={user.full_name}
                    className="input input-bordered"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="input input-bordered"
                    placeholder="seu@email.com"
                  />
                </div>

                {/* Telefone */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Telefone</span>
                  </label>
                  <input
                    type="tel"
                    defaultValue={(user as any).phone || ''}
                    className="input input-bordered"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {/* Botões de ação */}
                <div className="card-actions justify-end mt-6">
                  <button type="button" className="btn btn-ghost">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Card de segurança */}
          <div className="card bg-base-200 shadow-xl mt-6">
            <div className="card-body">
              <h2 className="card-title text-base-content">
                <Shield className="w-5 h-5" />
                Segurança
              </h2>

              <div className="space-y-4 mt-4">
                <button className="btn btn-outline w-full justify-start">
                  Alterar Senha
                </button>
                <button className="btn btn-outline w-full justify-start">
                  Configurar Autenticação em Dois Fatores
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar com informações adicionais */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de cargo */}
          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-sm">Cargo</h3>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8" />
                <div>
                  <p className="font-bold text-lg capitalize">{user.role}</p>
                  <p className="text-sm opacity-80">Membro ativo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card de informações de contato */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-base-content text-sm">
                Informações de Contato
              </h3>
              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-base-content/60" />
                  <div className="text-sm">
                    <p className="text-base-content/60">Email</p>
                    <p className="text-base-content font-medium break-all">
                      {user.email}
                    </p>
                  </div>
                </div>
                {(user as any).phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-base-content/60" />
                    <div className="text-sm">
                      <p className="text-base-content/60">Telefone</p>
                      <p className="text-base-content font-medium">
                        {(user as any).phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card de dica */}
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div className="text-sm">
              <h3 className="font-bold">Dica</h3>
              <div>
                Mantenha suas informações atualizadas para receber comunicados importantes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
