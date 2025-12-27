"use client";

import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content */}
      <div className="drawer-content flex flex-col overflow-x-hidden">
        {/* Navbar com botão de toggle - apenas mobile */}
        <nav className="navbar bg-base-300 lg:hidden">
          <label
            htmlFor="dashboard-drawer"
            aria-label="Abrir menu"
            className="btn btn-square btn-ghost"
          >
            <Menu className="w-5 h-5" />
          </label>
          <div className="px-4 text-lg font-bold text-base-content">
            Recanto Digital
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 bg-base-100">
          {children}
        </main>
      </div>

      {/* Drawer sidebar */}
      <div className="drawer-side overflow-y-auto overflow-x-hidden">
        <label
          htmlFor="dashboard-drawer"
          aria-label="Fechar menu"
          className="drawer-overlay"
        />
        <Sidebar />
      </div>
    </div>
  );
}
