"use client";

import { useAuth } from "../contexts/AuthContext";
import { appRoutes } from "@/_config/routes_app";
import { Heart, LogOut, UserPen, PanelLeftClose } from "lucide-react";
import { useMemo } from "react";
import {
  SidebarMenuItem,
  SidebarFooter,
  SidebarQuote,
  SidebarMenu,
  SidebarThemeToggle
} from "@/components/ui/sidebar";

/**
 * Sidebar Component
 * Renders the application sidebar with navigation menu and footer
 * Follows Single Responsibility Principle - Only manages sidebar structure
 */
export default function Sidebar() {
  const { user, logout } = useAuth();

  // Filter routes based on user role (memoized for performance)
  const filteredRoutes = useMemo(() => {
    if (!user) return [];

    return appRoutes.filter((route) => {
      if (route.roles.includes(null)) return true;
      return route.roles.includes((user?.role || null) as any);
    });
  }, [user]);

  return (
    <div className="flex h-screen overflow-y-auto overflow-x-hidden flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64 transition-all relative">
      {/* Header */}
      <SidebarHeader />

      {/* Navigation Menu */}
      <NavigationMenu routes={filteredRoutes} />

      {/* Footer */}
      <SidebarFooter>
        <SidebarQuote
          quote="Tende compaixão uns dos outros."
          author="- Mt 18:33"
        />
        <SidebarMenu>
          <SidebarThemeToggle />
          <SidebarMenuItem
            icon={UserPen}
            label="Editar Perfil"
            href="/app/dashboard/profile"
            tooltip="Editar perfil"
          />
          <SidebarMenuItem
            icon={LogOut}
            label="Sair"
            onClick={logout}
            tooltip="Sair"
          />
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}

import Link from "next/link";

/**
 * SidebarHeader Component
 * Displays the application logo and title
 * Single Responsibility: Header presentation
 */
function SidebarHeader() {
  return (
    <Link 
      href="/" 
      className="flex items-center gap-3 p-4 w-full border-b border-base-300 hover:bg-base-300 transition-colors"
    >
      <img src="/logo.svg" alt="Recanto Logo" className="w-8 h-8 shrink-0 object-contain" />
      <h1 className="font-bold text-lg text-base-content is-drawer-close:hidden">
        Recanto Digital
      </h1>
    </Link>
  );
}

/**
 * NavigationMenu Component
 * Renders the main navigation menu with routes
 * Single Responsibility: Navigation structure
 */
interface NavigationMenuProps {
  routes: typeof appRoutes;
}

function NavigationMenu({ routes }: NavigationMenuProps) {
  return (
    <ul className="menu w-full grow p-2">
      {/* Toggle button */}
      <ToggleButton />

      {/* Divider */}
      <li className="hidden lg:block">
        <hr className="my-1 border-base-300" />
      </li>

      {/* Route items */}
      {routes.map((route) => (
        <SidebarMenuItem
          key={route.name}
          icon={route.icon}
          label={route.name}
          href={route.href}
        />
      ))}
    </ul>
  );
}

/**
 * ToggleButton Component
 * Renders the sidebar collapse/expand toggle
 * Single Responsibility: Toggle interaction
 */
function ToggleButton() {
  return (
    <li className="hidden lg:block">
      <label
        htmlFor="dashboard-drawer"
        aria-label="Recolher/Expandir menu"
        className="is-drawer-close:tooltip is-drawer-close:tooltip-right cursor-pointer"
        data-tip="Expandir menu"
      >
        <PanelLeftClose className="w-5 h-5 shrink-0" />
        <span className="is-drawer-close:hidden">Recolher Menu</span>
      </label>
    </li>
  );
}
