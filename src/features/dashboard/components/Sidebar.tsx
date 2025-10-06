"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { appRoutes } from "@/_config/routes_app";
import userRoleService from "@/domains/auth/services/userRoleService";
import { Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [filteredRoutes, setFilteredRoutes] = useState<typeof appRoutes>([]);

  // Filtrar rotas com base no cargo do usuário
  useEffect(() => {
    if (!user) {
      setFilteredRoutes([]);
      return;
    }

    // Filtrar rotas que o usuário tem permissão para acessar
    const routes = appRoutes.filter((route) => {
      // Se a rota permitir null, qualquer usuário autenticado pode acessar
      if (route.roles.includes(null)) {
        return true;
      }

      // Verificar se o usuário tem algum dos cargos permitidos
      return route.roles.includes(user.role);
    });

    setFilteredRoutes(routes);
  }, [user]);

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col p-4 overflow-y-auto">
      <div className="flex items-center gap-3 mb-10 px-2">
        <Heart className="w-8 h-8 text-sky-600" />
        <h1 className="font-bold text-xl text-slate-800">Recanto Digital</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {filteredRoutes.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="text-center my-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 italic">
            "Tende compaixão uns dos outros."
          </p>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            - Mt 18:33
          </p>
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full flex justify-start items-center gap-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </Button>
      </div>
    </aside>
  );
}
