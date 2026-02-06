"use client";

import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

import Link from "next/link";

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
          <Link href="/" className="px-4 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Recanto Logo" className="w-6 h-6 object-contain" />
            <span className="text-lg font-bold text-base-content">Recanto Digital</span>
          </Link>
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
