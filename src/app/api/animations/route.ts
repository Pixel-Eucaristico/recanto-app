import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // 1. Listar arquivos locais (fixos no repositório)
    let localAnimations: any[] = [];
    try {
      const animationsPath = path.join(process.cwd(), 'public', 'animations');
      
      // Verifica se a pasta existe antes de tentar ler
      const fs = await import('fs/promises');
      const stats = await fs.stat(animationsPath).catch(() => null);
      
      if (stats && stats.isDirectory()) {
        const files = await fs.readdir(animationsPath);
        localAnimations = files
          .filter((file) => file.endsWith('.json'))
          // Removido o filtro de timestamp para permitir que arquivos movidos do R2 
          // para a pasta local sejam listados corretamente
          .map((file) => ({
            id: file,
            name: formatAnimationName(file),
            file: file,
          }));
      }
    } catch (e) {
      console.warn('Falha ao ler pasta local de animações:', e);
    }

    // 2. Listar arquivos no Cloudflare R2 (Pasta: cms/animations/)
    let r2Animations: any[] = [];
    try {
      const { storageService } = await import('@/services/storage/R2StorageService');
      const files = await storageService.listFiles('cms/animations');
      
      r2Animations = files.map((url) => {
        const filename = url.split('/').pop() || '';
        // Guardamos o nome puro do arquivo para de-duplicação
        return {
          id: url, 
          name: formatAnimationName(filename), // Nome limpo sem timestamp
          file: url, 
          filename: filename, // Nome real do arquivo no bucket
          isR2: true,
        };
      });
    } catch (e) {
      console.error('Erro ao listar animações do R2:', e);
    }

    // 3. De-duplicação Total: Usamos o "name" formatado (em minúsculas) como chave única
    // Isso garante que mesmo variações de maiúsculas/minúsculas não dupliquem
    const finalMap = new Map();

    // Adiciona locais primeiro (prioridade máxima)
    localAnimations.forEach(anim => {
      const key = anim.name.toLowerCase().trim();
      if (!finalMap.has(key)) {
        finalMap.set(key, anim);
      } else {
        const existing = finalMap.get(key);
        // Se este nome de arquivo for menor (sem timestamp), ele ganha
        if (anim.file.length < existing.file.length) {
          finalMap.set(key, anim);
        }
      }
    });

    // Adiciona os do R2 apenas se o nome ainda não existir na lista local
    r2Animations.forEach((anim: any) => {
      const key = anim.name.toLowerCase().trim();
      if (!finalMap.has(key)) {
        finalMap.set(key, anim);
      }
    });

    const animationsList = Array.from(finalMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json([
      { id: 'none', name: 'Sem Animação', file: null },
      ...animationsList,
    ], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Erro ao listar animações:', error);
    return NextResponse.json({ error: 'Erro ao listar animações' }, { status: 500 });
  }
}

/**
 * Endpoint para excluir animações do R2
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'URL inválida para exclusão' }, { status: 400 });
    }

    // Segurança: Garantir que só deleta da pasta cms/animations/
    if (!url.includes('/cms/animations/')) {
       return NextResponse.json({ error: 'Permissão negada para excluir este arquivo' }, { status: 403 });
    }

    const { storageService } = await import('@/services/storage/R2StorageService');
    await storageService.deleteFile(url);

    return NextResponse.json({ success: true, message: 'Animação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir animação:', error);
    return NextResponse.json({ error: 'Erro ao excluir animação' }, { status: 500 });
  }
}

/**
 * Formata o nome do arquivo para exibição
 * Ex: "career-animation.json" → "Career Animation"
 */
function formatAnimationName(filename: string): string {
  return filename
    .replace('.json', '')
    // Remove timestamp inicial (pode ser seguido por - ou _)
    .replace(/^\d+[-_]/, '') 
    // Troca hífens e sublinhados por espaço
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
