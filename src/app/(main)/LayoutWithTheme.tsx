'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ui/daisyui/theme-controller';
import { Navbar } from '@/components/blocks/navbar';
import { contentPageService } from '@/services/firebase';

interface LayoutWithThemeProps {
  children: ReactNode;
}

/**
 * Layout client que aplica temas dinâmicos baseados na página CMS atual
 * Envolve Navbar + conteúdo + Footer com o ThemeProvider
 */
export function LayoutWithTheme({ children }: LayoutWithThemeProps) {
  const pathname = usePathname();
  const [themes, setThemes] = useState({
    light: 'recanto-light',
    dark: 'recanto-dark',
  });

  useEffect(() => {
    const loadPageTheme = async () => {
      try {
        // Buscar página pelo slug (pathname)
        const page = await contentPageService.getBySlug(pathname);

        console.log('🎨 Theme Debug:', {
          pathname,
          pageFound: !!page,
          pageTitle: page?.title,
          theme_light: page?.theme_light,
          theme_dark: page?.theme_dark,
        });

        if (page) {
          setThemes({
            light: page.theme_light || 'recanto-light',
            dark: page.theme_dark || 'recanto-dark',
          });
          console.log('✅ Temas aplicados:', {
            light: page.theme_light || 'recanto-light',
            dark: page.theme_dark || 'recanto-dark',
          });
        } else {
          // Página não encontrada, usar temas padrão
          console.log('⚠️ Página não encontrada, usando temas padrão');
          setThemes({
            light: 'recanto-light',
            dark: 'recanto-dark',
          });
        }
      } catch (error) {
        console.error('❌ Error loading page theme:', error);
        // Manter temas padrão em caso de erro
        setThemes({
          light: 'recanto-light',
          dark: 'recanto-dark',
        });
      }
    };

    loadPageTheme();
  }, [pathname]);

  return (
    <ThemeProvider
      lightTheme={themes.light}
      darkTheme={themes.dark}
      className="min-h-screen flex flex-col"
      propsNextThemes={{
        attribute: 'data-theme',
        enableSystem: true,
        defaultTheme: 'system',
      }}
    >
      <header className="w-full bg-base-100 shadow sticky px-4 top-0 right-0 left-0 z-20">
        <Navbar />
      </header>
      <main className="bg-base-100 flex-1">
        {children}
      </main>
      <footer className="w-full bg-base-200 text-base-content py-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Recanto do Amor Misericordioso. Todos os direitos reservados.
        </p>
      </footer>
    </ThemeProvider>
  );
}
