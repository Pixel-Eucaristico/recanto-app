"use client";

import { CandleOffIcon, CandleOnIcon } from "@/components/svg";
import { FC } from "react";
import { useTheme } from "./hooks/useTheme";
import { useSystemTheme } from "./hooks/useSystemTheme";

const ThemeController: FC = () => {
  const [theme, setTheme] = useTheme();
  const systemTheme = useSystemTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.checked ? "dark" : "light");
  };

  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  return (
    <label className="swap swap-flip">
      <input
        type="checkbox"
        className="theme-controller"
        checked={isDarkMode}
        onChange={handleThemeChange}
      />

      <CandleOffIcon className="swap-off size-6 fill-current" />

      <CandleOnIcon className="swap-on size-6 fill-current" />
    </label>
  );
};

export default ThemeController;
