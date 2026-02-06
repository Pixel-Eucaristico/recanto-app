import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy para evitar erros de CORS ao buscar animações do R2
 * O cliente solicita para /api/animations/proxy?url=...
 * O servidor baixa do R2 e entrega o JSON para o cliente
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
  }

  try {
    // 1. Tentar ver se o arquivo existe LOCALMENTE primeiro (Compatibilidade Nuvem -> Local)
    // Extrai o nome do arquivo da URL (ex: 1738785189-heart.json)
    const filename = url.split('/').pop();
    
    if (filename) {
      const path = await import('path');
      const fs = await import('fs/promises');
      const localPath = path.join(process.cwd(), 'public', 'animations', filename);
      
      try {
        const localFile = await fs.readFile(localPath, 'utf-8');
        console.log(`[AnimationProxy] Servindo arquivo local: ${filename}`);
        return NextResponse.json(JSON.parse(localFile), {
          headers: { 'X-Proxy-Source': 'local' }
        });
      } catch (e) {
        // Arquivo não existe localmente, segue para o fetch no R2
      }
    }

    // 2. Se não encontrar local, busca no R2
    console.log(`[AnimationProxy] Buscando no R2: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar animação: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Retorna o JSON com cache para não sobrecarregar o servidor
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error: any) {
    console.error('[AnimationProxy] Erro:', error.message);
    return NextResponse.json({ error: 'Erro ao processar animação remota' }, { status: 500 });
  }
}
