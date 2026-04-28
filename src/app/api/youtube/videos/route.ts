export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleYouTubeService } from '@/integrations/google-youtube/GoogleYouTubeService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const max = Number(req.nextUrl.searchParams.get('max') ?? 50);

  try {
    const videos = await googleYouTubeService.listMyVideos(session.uid, { maxResults: max });
    return NextResponse.json({ videos });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
