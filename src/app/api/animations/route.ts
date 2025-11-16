import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const animationsPath = path.join(process.cwd(), 'public', 'animations');
    const files = await readdir(animationsPath);

    // Filtrar apenas arquivos JSON e remover duplicatas de upload
    const animations = files
      .filter((file) => file.endsWith('.json'))
      .filter((file) => !file.match(/^\d+-/)) // Remove arquivos com timestamp-filename.json
      .map((file) => ({
        id: file,
        name: formatAnimationName(file),
        file: file,
      }));

    // Adicionar opção "Sem Animação" no início
    return NextResponse.json([
      { id: 'none', name: 'Sem Animação', file: null },
      ...animations,
    ]);
  } catch (error) {
    console.error('Erro ao listar animações:', error);
    return NextResponse.json(
      { error: 'Erro ao listar animações' },
      { status: 500 }
    );
  }
}

/**
 * Formata o nome do arquivo para exibição
 * Ex: "career-animation.json" → "Career Animation"
 */
function formatAnimationName(filename: string): string {
  return filename
    .replace('.json', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
