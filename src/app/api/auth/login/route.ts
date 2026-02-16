export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminAuth } from "@/domains/auth/services/firebaseAdmin";
import { sessionService } from "@/domains/auth/services/sessionService";

export async function POST(req: Request) {
  const { token } = await req.json();

  try {
    // Em desenvolvimento, desativamos checkRevocation (true) para evitar o erro de JWT Signature do Google Auth
    // causado por desvios leves no relógio. A validação local do token continua ativa.
    const checkRevocation = process.env.NODE_ENV === 'production';
    const decoded = await adminAuth.verifyIdToken(token, checkRevocation);
    await sessionService.set(token);
    return NextResponse.json({ user: decoded });
  } catch (e) {
    console.error('❌ [Login] Erro:', e instanceof Error ? e.message : 'Token inválido');
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
