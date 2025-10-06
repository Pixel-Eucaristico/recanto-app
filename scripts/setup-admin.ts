/**
 * Script to set up admin user in Firebase
 * Run with: npx ts-node scripts/setup-admin.ts
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

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

async function setupAdmin() {
  const adminEmail = 'williancustodioquintino@gmail.com';

  console.log('🔍 Searching for user with email:', adminEmail);

  // Buscar todos os usuários
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);

  if (!snapshot.exists()) {
    console.log('❌ No users found in database');
    return;
  }

  const users = snapshot.val();
  let adminUserId: string | null = null;

  // Procurar usuário pelo email
  for (const [userId, userData] of Object.entries(users)) {
    if ((userData as any).email === adminEmail) {
      adminUserId = userId;
      console.log('✅ Found user:', userId);
      break;
    }
  }

  if (!adminUserId) {
    console.log('❌ User not found. Creating admin user...');

    // Criar usuário admin
    const newUserRef = ref(database, `users/${Date.now()}`);
    await set(newUserRef, {
      id: newUserRef.key,
      name: 'Willian Quintino',
      email: adminEmail,
      role: 'admin',
      created_at: new Date().toISOString()
    });

    console.log('✅ Admin user created!');
    return;
  }

  // Atualizar role para admin
  const userRoleRef = ref(database, `users/${adminUserId}/role`);
  await set(userRoleRef, 'admin');

  console.log('✅ User role updated to admin!');
  console.log('👤 Admin user ID:', adminUserId);

  // Verificar
  const updatedSnapshot = await get(ref(database, `users/${adminUserId}`));
  console.log('📋 Updated user data:', updatedSnapshot.val());
}

setupAdmin()
  .then(() => {
    console.log('✨ Setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
