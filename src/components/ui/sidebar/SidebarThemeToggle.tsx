'use client';

import { useTheme } from '@/components/ui/daisyui/theme-controller/hooks/useTheme';
import { useSystemTheme } from '@/components/ui/daisyui/theme-controller/hooks/useSystemTheme';
import { CandleOffIcon, CandleOnIcon } from "@/components/svg";

export function SidebarThemeToggle() {
  const [theme, setTheme] = useTheme();
  const systemTheme = useSystemTheme();

  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <li className="w-full">
      <button
        type="button"
        onClick={toggleTheme}
        className="is-drawer-close:tooltip is-drawer-close:tooltip-right w-full flex items-center gap-3"
        data-tip="Alterar tema"
      >
        <div className={`swap swap-flip ${isDarkMode ? 'swap-active' : ''} shrink-0`}>
          <CandleOnIcon className="swap-on size-5 fill-current text-primary" />
          <CandleOffIcon className="swap-off size-5 fill-current" />
        </div>
        <span className="is-drawer-close:hidden whitespace-nowrap">
          Alterar Tema
        </span>
      </button>
    </li>
  );
}
