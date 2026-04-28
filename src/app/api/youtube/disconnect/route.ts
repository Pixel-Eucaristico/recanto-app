export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { googleYouTubeService } from '@/integrations/google-youtube/GoogleYouTubeService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function POST() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  await googleYouTubeService.deleteTokens(session.uid);
  return NextResponse.json({ ok: true });
}
