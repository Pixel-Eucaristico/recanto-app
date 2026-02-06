import { NextRequest, NextResponse } from 'next/server';

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

    // Validar se é JSON válido e uma animação Lottie válida (Deep Check)
    try {
      const jsonData = JSON.parse(buffer.toString());

      // Blindagem: Verifica propriedades essenciais de um Lottie legítimo
      if (!jsonData.v || !jsonData.layers || !Array.isArray(jsonData.layers)) {
        return NextResponse.json(
          { error: 'O conteúdo do arquivo não é uma animação Lottie válida (formato incorreto).' },
          { status: 400 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Arquivo corrompido ou JSON inválido.' },
        { status: 400 }
      );
    }

    // Fazer upload para o Cloudflare R2 com organização: cms/animations/ANO/MES/DIA/
    const { storageService } = await import('@/services/storage/R2StorageService');
    const publicUrl = await storageService.uploadFile(file, 'animations', 'cms');

    return NextResponse.json({
      success: true,
      filename: publicUrl, // Retornamos a URL completa do R2
      message: 'Animação enviada com sucesso para a nuvem!'
    });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo' },
      { status: 500 }
    );
  }
}
