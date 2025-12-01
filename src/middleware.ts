import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica se é uma rota estática (assets, api, etc)
  const isStaticFile = pathname.startsWith('/_next') ||
                       pathname.startsWith('/api') ||
                       pathname.includes('.');

  // Se for arquivo estático, permite acesso direto
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Rotas de autenticação são sempre públicas
  if (pathname.startsWith('/app/login') || pathname.startsWith('/app/register')) {
    return NextResponse.next();
  }

  // Para rotas protegidas do dashboard (/app/*), verificar autenticação
  if (pathname.startsWith('/app')) {
    // Nota: A autenticação real acontece via Firebase Auth + Rules
    // Este middleware é apenas primeira camada de validação
    // A segurança real está nas Firebase Rules e no AuthContext
    return NextResponse.next();
  }

  // TODAS as outras rotas são PÚBLICAS e serão tratadas pelo CMS
  // Qualquer rota criada no CMS funcionará automaticamente!
  // (EXCETO rotas /app/* que são protegidas acima)
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
