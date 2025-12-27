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

async function debug() {
  console.log('🔍 DEBUGANDO FIRESTORE...\n');

  // 1. Listar TODAS as páginas
  console.log('1️⃣ Listando TODAS as páginas da collection "content_pages":\n');
  const allPages = await db.collection('content_pages').get();

  console.log(`📊 Total de documentos: ${allPages.size}\n`);

  if (allPages.empty) {
    console.log('❌ COLLECTION VAZIA! Nenhum documento encontrado.\n');
  } else {
    allPages.forEach((doc, index) => {
      const data = doc.data();
      console.log(`📄 Documento ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Slug: "${data.slug}" (tipo: ${typeof data.slug})`);
      console.log(`   Título: ${data.title}`);
      console.log(`   Publicada: ${data.is_published}`);
      console.log(`   Blocos: ${data.blocks?.length || 0}`);
      console.log('');
    });
  }

  // 2. Buscar especificamente "/vocacional"
  console.log('2️⃣ Buscando especificamente slug = "/vocacional":\n');
  const vocacionalQuery = await db
    .collection('content_pages')
    .where('slug', '==', '/vocacional')
    .get();

  console.log(`📊 Resultados encontrados: ${vocacionalQuery.size}\n`);

  if (vocacionalQuery.empty) {
    console.log('❌ NENHUM documento com slug "/vocacional" encontrado!\n');
    console.log('💡 Possíveis problemas:');
    console.log('   1. Slug salvo diferente (ex: "vocacional" sem barra)');
    console.log('   2. Documento não foi salvo corretamente');
    console.log('   3. Collection name errada\n');
  } else {
    vocacionalQuery.forEach(doc => {
      console.log('✅ Documento encontrado!');
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  }

  // 3. Tentar buscar sem barra
  console.log('\n3️⃣ Tentando buscar slug = "vocacional" (sem barra):\n');
  const semBarra = await db
    .collection('content_pages')
    .where('slug', '==', 'vocacional')
    .get();

  console.log(`📊 Resultados: ${semBarra.size}\n`);

  if (!semBarra.empty) {
    console.log('⚠️ ENCONTRADO SEM BARRA! O slug está salvo errado.');
    semBarra.forEach(doc => {
      console.log('Dados:', JSON.stringify(doc.data(), null, 2));
    });
  }

  process.exit(0);
}

debug().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
