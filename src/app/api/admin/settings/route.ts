import { NextResponse } from 'next/server';
import { firestore as adminDb } from '@/domains/auth/services/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const config = await request.json();
    
    // Save to Firestore using Admin SDK (bypasses security rules)
    await adminDb.collection('settings').doc('global').set({
        ...config,
        updated_at: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving global settings via API:', error);
    return NextResponse.json(
      { error: 'Failed to save settings', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Obter usando admin server-side para não depender de rules se não houver token
    const docRef = await adminDb.collection('settings').doc('global').get();
    
    if (docRef.exists) {
        return NextResponse.json(docRef.data());
    }
    
    // Default config se não existir
    return NextResponse.json({
        id: 'global',
        dashboard_theme_light: 'recanto-light',
        dashboard_theme_dark: 'recanto-dark',
        updated_at: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error fetching global settings via API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    );
  }
}
