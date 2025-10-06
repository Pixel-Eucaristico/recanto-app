export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { sessionService } from "@/domains/auth/services/sessionService";
import { adminAuth } from "@/domains/auth/services/firebaseAdmin";

export async function GET() {
  const token = await sessionService.get();
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return NextResponse.json({ authenticated: true, user: decoded });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
