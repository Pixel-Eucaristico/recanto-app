export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminAuth } from "@/domains/auth/services/firebaseAdmin";
import { sessionService } from "@/domains/auth/services/sessionService";

export async function POST(req: Request) {
  const { token } = await req.json();

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    await sessionService.set(token);
    return NextResponse.json({ user: decoded });
  } catch (e) {
    console.error('❌ [Login] Erro:', e instanceof Error ? e.message : 'Token inválido');
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
