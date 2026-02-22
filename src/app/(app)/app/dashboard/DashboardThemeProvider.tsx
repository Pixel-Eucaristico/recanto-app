'use client';

import { useEffect, useState, ReactNode } from 'react';
import { ThemeProvider } from '@/components/ui/daisyui/theme-controller';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';

interface DashboardThemeProviderProps {
  children: ReactNode;
}

/**
 * Layout client que aplica temas dinâmicos no Dashboard
 * Envolve o DashboardLayout com o ThemeProvider
 */
export function DashboardThemeProvider({ children }: DashboardThemeProviderProps) {
  const { user, loading } = useAuth();
  const [themes, setThemes] = useState({
    light: 'recanto-light',
    dark: 'recanto-dark',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setThemes({
          light: user.theme_light || 'recanto-light',
          dark: user.theme_dark || 'recanto-dark',
        });
      }
      setIsLoaded(true);
    }
  }, [user, loading]);

  // Prevent flash of unstyled content/wrong theme by hiding initially if needed
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <ThemeProvider
      lightTheme={themes.light}
      darkTheme={themes.dark}
      className="min-h-screen"
      propsNextThemes={{
        attribute: 'data-theme',
        enableSystem: true,
        defaultTheme: 'system',
      }}
    >
      {children}
    </ThemeProvider>
  );
}
