import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar se é JSON
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Apenas arquivos JSON são permitidos' },
        { status: 400 }
      );
    }

    // Ler o conteúdo do arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validar se é JSON válido
    try {
      const jsonData = JSON.parse(buffer.toString());

      // Validar se é animação Lottie válida
      if (!jsonData.v || !jsonData.layers) {
        return NextResponse.json(
          { error: 'JSON não é uma animação Lottie válida' },
          { status: 400 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Arquivo não é um JSON válido' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Caminho para salvar em public/animations
    const filepath = path.join(process.cwd(), 'public', 'animations', filename);

    // Salvar o arquivo
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      message: 'Animação enviada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo' },
      { status: 500 }
    );
  }
}
