export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { googleYouTubeService } from '@/integrations/google-youtube/GoogleYouTubeService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ connected: false }, { status: 401 });

  const tokens = await googleYouTubeService.getTokens(session.uid);
  return NextResponse.json({
    connected: !!tokens?.refresh_token,
    expires_at: tokens?.expiry_date ?? null,
  });
}
