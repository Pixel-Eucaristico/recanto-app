/**
 * Script SEGURO para definir admin usando Firebase Admin SDK
 * Execute: node scripts/set-admin-secure.mjs
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Usar credenciais do .env.local
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "recanto-do-amor-miserico-e5a7b",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-hm8ij@recanto-do-amor-miserico-e5a7b.iam.gserviceaccount.com",
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n')
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://recanto-do-amor-miserico-e5a7b.firebaseio.com"
  });
}

const db = admin.database();

async function setAdmin() {
  const adminEmail = 'williancustodioquintino@gmail.com';

  console.log('🔍 Buscando usuário:', adminEmail);

  try {
    // Buscar todos os usuários (com privilégios admin)
    const usersRef = db.ref('users');
    const snapshot = await usersRef.once('value');

    if (!snapshot.exists()) {
      console.log('❌ Nenhum usuário encontrado no banco');
      console.log('💡 Faça login primeiro com Google para criar o usuário');
      process.exit(1);
    }

    const users = snapshot.val();
    let adminUserId = null;

    // Procurar usuário pelo email
    for (const [userId, userData] of Object.entries(users)) {
      if (userData.email === adminEmail) {
        adminUserId = userId;
        console.log('✅ Usuário encontrado:', userId);
        console.log('📋 Dados atuais:', userData);
        break;
      }
    }

    if (!adminUserId) {
      console.log('❌ Usuário não encontrado');
      console.log('💡 Dica: Faça login primeiro com Google para criar o usuário');
      process.exit(1);
    }

    // Atualizar apenas o role (preservando outros dados)
    console.log('🔄 Definindo role como admin...');
    await db.ref(`users/${adminUserId}/role`).set('admin');
    await db.ref(`users/${adminUserId}/updated_at`).set(new Date().toISOString());

    console.log('✅ Role atualizado para admin!');
    console.log('👤 Admin User ID:', adminUserId);
    console.log('📧 Email:', adminEmail);

    // Verificar
    const updatedUser = await db.ref(`users/${adminUserId}`).once('value');
    console.log('📋 Dados atualizados:', updatedUser.val());

    console.log('\n✨ Configuração completa!');
    console.log('🔐 Você agora é admin permanente!');
    console.log('🔧 DevRoleSelector agora só aparece para você!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

setAdmin();
