import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/services/storage/R2StorageService';

export async function GET() {
  try {
    // Test if environment variables are set
    const isConfigured = 
      process.env.R2_ACCOUNT_ID && 
      process.env.R2_ACCESS_KEY_ID && 
      process.env.R2_SECRET_ACCESS_KEY && 
      process.env.R2_BUCKET_NAME;

    if (!isConfigured) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Cloudflare R2 não está configurado no servidor (.env ausente)' 
      }, { status: 503 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const origin = formData.get('origin') as string || 'cms';
    const type = formData.get('folder') as string || 'uploads';
    const customFileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Permitir imagens, PDFs e JSONs nesta rota genérica
    const allowedTypes = ['image/', 'application/pdf', 'application/json'];
    const isAllowed = allowedTypes.some(t => file.type.startsWith(t));
    
    if (!isAllowed && !file.name.endsWith('.json')) {
       return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 });
    }

    // Chama o serviço com a nova assinatura: (file, type, origin, customFileName)
    const publicUrl = await storageService.uploadFile(file, type, origin, customFileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Erro no upload para R2:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no upload' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL não fornecida' }, { status: 400 });
    }

    await storageService.deleteFile(url);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir do R2:', error);
    return NextResponse.json({ error: error.message || 'Erro ao excluir arquivo' }, { status: 500 });
  }
}
