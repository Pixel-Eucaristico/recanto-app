import { NextResponse } from 'next/server';

export async function GET() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '';
  
  // Checks
  const hasNewline = privateKey.includes('\n');
  const hasEscapedNewline = privateKey.includes('\\n');
  const keyLength = privateKey.length;
  const keyStart = privateKey.substring(0, 10);
  const keyEnd = privateKey.substring(privateKey.length - 10);

  return NextResponse.json({
    status: 'Diagnostics',
    timestamp: new Date().toISOString(),
    env: {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'MISSING',
      FIREBASE_CLIENT_EMAIL: clientEmail ? `${clientEmail.substring(0, 5)}...` : 'MISSING',
      FIREBASE_PRIVATE_KEY: {
        present: !!privateKey,
        length: keyLength,
        hasNewline,
        hasEscapedNewline,
        startsWithDash: privateKey.startsWith('-----BEGIN'),
        validFormat: privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.includes('-----END PRIVATE KEY-----')
      },
      FIREBASE_SERVICE_ACCOUNT_KEY: {
        present: !!serviceAccountKey,
        length: serviceAccountKey.length,
        isJson: serviceAccountKey.startsWith('{')
      },
      NODE_ENV: process.env.NODE_ENV
    }
  });
}
