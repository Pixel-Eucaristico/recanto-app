'use client';

import { useEffect, useState } from 'react';
import { useSystemTheme } from './hooks/useSystemTheme';
import { useTheme } from './hooks/useTheme';

type Props = {
  lightTheme: string;
  darkTheme: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function ThemeProvider({
  children,
  lightTheme,
  darkTheme,
  ...divProps
}: Props) {
  const [theme] = useTheme();
  const systemTheme = useSystemTheme();
  const [resolvedTheme, setResolvedTheme] = useState<string | null>(null);

  useEffect(() => {
    const appliedTheme =
      theme === 'system'
        ? systemTheme === 'dark'
          ? darkTheme
          : lightTheme
        : theme === 'dark'
        ? darkTheme
        : lightTheme;

    setResolvedTheme(appliedTheme);
  }, [theme, systemTheme, darkTheme, lightTheme]);

  if (!resolvedTheme) return null; // ou algum fallback/loader

  return (
    <div data-theme={resolvedTheme} {...divProps}>
      {children}
    </div>
  );
}
