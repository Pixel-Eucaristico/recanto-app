import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    HAS_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    KEY_LEN: process.env.FIREBASE_PRIVATE_KEY?.length,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NODE_ENV: process.env.NODE_ENV
  });
}
