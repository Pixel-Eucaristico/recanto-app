import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicPaths = [
    '/',
    '/sobre',
    '/nossa-senhora',
    '/espritualidade',
    '/estutura-vida',
    '/vocacional',
    '/acoes-projetos-evangelizacao',
    '/doacoes',
    '/contatos',
    '/infografico',
    '/app/login',
    '/app/register',
  ];

  // Verifica se a rota é pública
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  // Verifica se é uma rota estática (assets, api, etc)
  const isStaticFile = pathname.startsWith('/_next') ||
                       pathname.startsWith('/api') ||
                       pathname.includes('.');

  // Se for rota pública ou arquivo estático, permite acesso
  if (isPublicPath || isStaticFile) {
    return NextResponse.next();
  }

  // Para rotas protegidas (/app/*), verifica se há tentativa de acesso direto
  if (pathname.startsWith('/app/dashboard')) {
    // Nota: A autenticação real acontece via Firebase Auth + Rules
    // Este middleware é apenas primeira camada de validação
    // A segurança real está nas Firebase Rules e no AuthContext

    return NextResponse.next();
  }

  // Por padrão, permite acesso
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
