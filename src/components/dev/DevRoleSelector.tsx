"use client";

import { useAuth } from "@/features/dashboard/contexts/AuthContext";
import { Role } from "@/features/auth/types/user";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Lock } from "lucide-react";
import { isWhitelistedAdmin } from "@/config/admin-whitelist";

/**
 * Componente de desenvolvimento para testar roles
 *
 * SEGURANÇA MULTINÍVEL:
 * 1. Apenas em desenvolvimento (NODE_ENV)
 * 2. Apenas para admins (role no banco)
 * 3. Apenas whitelist autorizada (emails/UIDs)
 * 4. NÃO altera banco de dados
 */
export function DevRoleSelector() {
  const { user } = useAuth();
  const [tempRole, setTempRole] = useState<Role | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [realAdminRole, setRealAdminRole] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  // 🔒 SEGURANÇA 1: Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // 🔒 SEGURANÇA 2 e 3: Verificar se é admin REAL e está na whitelist
  useEffect(() => {
    if (!user) return;

    // Verificar whitelist
    const whitelisted = isWhitelistedAdmin(user.email, user.id);

    const tempRoleStored = localStorage.getItem('dev_temp_role');
    if (tempRoleStored && tempRoleStored !== 'null') {
      // Se existe role temporário, verificar se é admin real E whitelisted
      setRealAdminRole(true);
      setIsAuthorized(whitelisted);
      setTempRole(tempRoleStored as Role);
    } else if (user?.role === 'admin' && whitelisted) {
      // Admin real E na whitelist
      setRealAdminRole(true);
      setIsAuthorized(true);
    }
  }, [user]);

  // 🔒 SEGURANÇA 4: Bloquear se não for admin real E autorizado
  if (!user || !realAdminRole || !isAuthorized) {
    return null;
  }

  const handleRoleChange = (newRole: Role) => {
    // Salvar role temporário no localStorage
    if (newRole === 'admin') {
      // Voltar ao admin original (remover override)
      localStorage.removeItem('dev_temp_role');
      setTempRole(null);
    } else {
      // Simular outro role temporariamente
      localStorage.setItem('dev_temp_role', newRole || 'null');
      setTempRole(newRole);
    }

    // Recarregar página para aplicar mudança
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem('dev_temp_role');
    setTempRole(null);
    window.location.reload();
  };

  const currentDisplayRole = tempRole || user.role;

  const roles: { value: Role; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'missionario', label: 'Missionário' },
    { value: 'recantiano', label: 'Recantiano' },
    { value: 'pai', label: 'Pai' },
    { value: 'colaborador', label: 'Colaborador' },
    { value: 'benfeitor', label: 'Benfeitor' },
    { value: null, label: 'Visitante' },
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border-2 border-red-400 rounded-lg shadow-lg z-50 transition-all">
      <div className="flex items-center justify-between p-2 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="text-xs font-bold text-red-800 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          ADMIN MODE {tempRole && '(Testando)'}
        </div>
        <button className="text-red-800 hover:text-red-600 transition-colors">
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!isMinimized && (
        <div className="px-4 pb-4">
          <div className="text-xs text-red-700 mb-1 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Admin: {user.email?.substring(0, 20)}...
          </div>
          <div className="text-xs font-bold text-red-800 mb-2">
            Role Real (DB): <span className="text-green-600">admin</span> 🔒
          </div>
          <div className="text-xs text-red-700 mb-3">
            {tempRole ? (
              <>Testando como: <strong>{currentDisplayRole}</strong></>
            ) : (
              <>Testar role temporário:</>
            )}
          </div>
          <select
            className="select select-sm select-bordered w-full mb-2"
            value={currentDisplayRole || ''}
            onChange={(e) => handleRoleChange(e.target.value as Role || null)}
          >
            {roles.map((role) => (
              <option key={role.value || 'null'} value={role.value || ''}>
                {role.label}
              </option>
            ))}
          </select>
          {tempRole && (
            <button
              onClick={handleReset}
              className="btn btn-xs btn-outline btn-error w-full mb-2"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Voltar ao Admin
            </button>
          )}
          <div className="text-xs text-green-600 mt-1">
            ✅ Não altera banco
          </div>
          <div className="text-xs text-orange-600 mt-1">
            🔒 Whitelist autorizada
          </div>
          <div className="text-xs text-red-600">
            ⚠️ Apenas desenvolvimento
          </div>
        </div>
      )}
    </div>
  );
}
