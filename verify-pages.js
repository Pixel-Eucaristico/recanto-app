require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Usar credenciais das variáveis de ambiente
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

async function verifyPages() {
  console.log('📋 Listando TODAS as páginas CMS:\n');

  const snapshot = await db.collection('content_pages').get();

  console.log(`Total: ${snapshot.size} páginas\n`);

  snapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`📄 ${data.slug}`);
    console.log(`   ID: ${doc.id}`);
    console.log(`   Título: ${data.title}`);
    console.log(`   Publicada: ${data.is_published ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Blocos: ${data.blocks?.length || 0}`);
    console.log('');
  });

  // Buscar especificamente a página
  console.log('\n🔍 Buscando "/acoes-projetos-evangelizacao"...\n');
  const query = await db
    .collection('content_pages')
    .where('slug', '==', '/acoes-projetos-evangelizacao')
    .get();

  if (query.empty) {
    console.log('❌ NÃO ENCONTRADA!');
    console.log('\n💡 Possíveis causas:');
    console.log('   1. Página não foi criada no CMS');
    console.log('   2. Slug está diferente (ex: sem "/" ou com maiúsculas)');
    console.log('   3. Página foi criada mas não foi salva');
  } else {
    console.log('✅ ENCONTRADA!');
    query.forEach(doc => {
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  }

  process.exit(0);
}

verifyPages().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
