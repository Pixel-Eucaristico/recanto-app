/**
 * Cria sessão de upload resumível no YouTube e retorna a URL.
 * Browser faz upload direto YouTube usando essa URL — bypassa o server (sem limite de body).
 *
 * Fluxo:
 * 1. Client → POST /api/youtube/upload-session com metadados
 * 2. Server cria session no YouTube (autorizado com tokens do user)
 * 3. Server retorna `{ uploadUrl }`
 * 4. Client → PUT <uploadUrl> com arquivo
 * 5. YouTube responde com video resource (id, snippet, etc.)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleYouTubeService } from '@/integrations/google-youtube/GoogleYouTubeService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const body = await req.json() as {
      title: string;
      description?: string;
      fileSize: number;
      mimeType: string;
    };

    if (!body.title?.trim()) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });
    if (!body.mimeType?.startsWith('video/')) {
      return NextResponse.json({ error: 'mimeType deve ser video/*' }, { status: 400 });
    }

    const uploadUrl = await googleYouTubeService.createResumableSession(session.uid, {
      title: body.title.trim(),
      description: (body.description ?? '').trim(),
      fileSize: body.fileSize,
      mimeType: body.mimeType,
    });

    return NextResponse.json({ uploadUrl });
  } catch (err) {
    console.error('[YouTube UploadSession] error:', err);
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
