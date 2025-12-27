/**
 * Script para definir usuário como Admin permanente no Firebase
 * Execute: node scripts/set-admin.js
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, query, orderByChild, equalTo } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyB1N-clZGiWUNiK_t1H8Qaa9boupHUBGYM",
  authDomain: "recanto-do-amor-miserico-e5a7b.firebaseapp.com",
  databaseURL: "https://recanto-do-amor-miserico-e5a7b.firebaseio.com",
  projectId: "recanto-do-amor-miserico-e5a7b",
  storageBucket: "recanto-do-amor-miserico-e5a7b.firebasestorage.app",
  messagingSenderId: "100072132172",
  appId: "1:100072132172:web:d837c8b93dad33fde6eee9",
  measurementId: "G-MCJ7BZ68SW"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function setAdmin() {
  const adminEmail = 'williancustodioquintino@gmail.com';

  console.log('🔍 Buscando usuário:', adminEmail);

  try {
    // Buscar todos os usuários
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      console.log('❌ Nenhum usuário encontrado no banco');
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

    // Atualizar role para admin
    console.log('🔄 Definindo role como admin...');
    const userRef = ref(database, `users/${adminUserId}`);
    await set(userRef, {
      ...users[adminUserId],
      role: 'admin',
      updated_at: new Date().toISOString()
    });

    console.log('✅ Role atualizado para admin!');
    console.log('👤 Admin User ID:', adminUserId);
    console.log('📧 Email:', adminEmail);

    // Verificar
    const updatedSnapshot = await get(userRef);
    console.log('📋 Dados atualizados:', updatedSnapshot.val());

    console.log('\n✨ Configuração completa!');
    console.log('🔐 Você agora é admin permanente!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

setAdmin();
