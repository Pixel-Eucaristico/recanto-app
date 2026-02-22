import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const key = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');

if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('❌ FIREBASE_PROJECT_ID não definido no .env.local');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: key,
    }),
  });

  const db = admin.firestore();
  console.log(`🔍 [DEBUG] Verificando coleção 'users' no projeto: ${process.env.FIREBASE_PROJECT_ID}`);

  const snapshot = await db.collection('users').get();
  console.log(`📊 [DEBUG] Total de usuários encontrados: ${snapshot.size}`);

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`👤 ID: ${doc.id} | Nome: ${data.name} | Role: ${data.role} | Email: ${data.email}`);
  });

  process.exit(0);
} catch (error) {
  console.error('❌ [DEBUG] Erro ao acessar Firestore:', error);
  process.exit(1);
}
