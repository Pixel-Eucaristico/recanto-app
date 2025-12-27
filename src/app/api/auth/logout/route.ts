export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { sessionService } from "@/domains/auth/services/sessionService";

export async function POST() {
  sessionService.clear();
  return NextResponse.json({ ok: true });
}
