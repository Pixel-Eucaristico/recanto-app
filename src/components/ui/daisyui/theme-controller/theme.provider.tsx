"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";
import { useSystemTheme } from "./hooks/useSystemTheme";
import { useTheme as useLocalTheme } from "./hooks/useTheme";
import { useTheme as useNextTheme } from "next-themes";

export type PropsNextThemes = React.ComponentProps<typeof NextThemesProvider>;

type Props = {
  lightTheme: string;
  darkTheme: string;
  children: React.ReactNode;
  propsNextThemes?: PropsNextThemes;
} & React.HTMLAttributes<HTMLDivElement>;

export function ThemeProvider({
  children,
  lightTheme,
  darkTheme,
  propsNextThemes,
  ...divProps
}: Props) {
  const [theme] = useLocalTheme();
  const { setTheme } = useNextTheme();
  const systemTheme = useSystemTheme();
  const [resolvedTheme, setResolvedTheme] = useState<string | null>(null);

  useEffect(() => {
    setTheme(theme);
    const selectedTheme = theme === "system" ? systemTheme : theme;
    const appliedTheme = selectedTheme === "dark" ? darkTheme : lightTheme;
    setResolvedTheme(appliedTheme);
  }, [theme, systemTheme, darkTheme, lightTheme, setTheme]);

  if (!resolvedTheme) return null; // ou algum fallback/loader

  return (
    <div data-theme={resolvedTheme} {...divProps}>
      <NextThemesProvider {...propsNextThemes}>{children}</NextThemesProvider>
    </div>
  );
}
