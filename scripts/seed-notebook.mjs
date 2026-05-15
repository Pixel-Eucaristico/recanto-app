#!/usr/bin/env node
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
if (existsSync('.env')) dotenv.config({ path: '.env' });

function initAdmin() {
  if (getApps().length) return;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
    return;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) throw new Error('Missing Firebase Admin env vars');
  const privateKey = rawKey.trim().replace(/^"/, '').replace(/"$/, '').replace(/\\n/g, '\n');
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

initAdmin();
const db = getFirestore();

function iso(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const REFLECTIONS_TEMPLATE = [
  {
    lesson_id: 'lesson-video-guia',
    lesson_title: 'Vídeo guia — O que é vocação',
    module_title: 'O Despertar do Sentido',
    track_id: 'track-pre-vocacional',
    track_title: 'Pré-vocacional',
    content: 'Ao assistir esta aula compreendi que vocação não é profissão — é resposta a um chamado do Senhor. Percebi que muitas vezes procurei meu caminho sem antes perguntar a Deus qual o plano Dele para mim. Hoje, em silêncio, me dispus a escutar. Senti paz ao reconhecer que o chamado não é sobre mim, mas sobre aquilo que Deus quer realizar por meu meio.',
    status: 'reviewed',
    daysAgo: 12,
    review_notes: 'Belíssima reflexão. Continue nesta disposição de escuta — ela é o fundamento.',
  },
  {
    lesson_id: 'lesson-silencio',
    lesson_title: 'A escuta no silêncio',
    module_title: 'O Despertar do Sentido',
    track_id: 'track-pre-vocacional',
    track_title: 'Pré-vocacional',
    content: 'O silêncio me desconforta. Tentei ficar 10 minutos sem telefone e já me senti ansioso. Mas quando consegui permanecer, escutei algo que normalmente não ouço: o que há dentro de mim. Me dei conta de quantas preocupações carrego sem perceber. Preciso exercitar mais esse silêncio — não como vazio, mas como espaço para Deus falar.',
    status: 'submitted',
    daysAgo: 4,
  },
  {
    lesson_id: 'lesson-regra-vida',
    lesson_title: 'Construindo uma Regra de Vida',
    module_title: 'Vida de Oração',
    track_id: 'track-vocacional',
    track_title: 'Vocacional',
    content: 'Rascunho inicial. Tentando estruturar minha regra de vida com base no que vi na aula: oração da manhã (5min), exame de consciência à noite (5min), rosário nos domingos. Ainda preciso refinar — sinto que deveria incluir algo comunitário.',
    status: 'draft',
    daysAgo: 1,
  },
];

async function findUsersWithRole(roles) {
  const snap = await db.collection('users').where('role', 'in', roles).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function seedForUser(user) {
  console.log(`[seed-notebook] user ${user.id} (${user.email || user.name || 'anon'})`);
  for (const t of REFLECTIONS_TEMPLATE) {
    const id = `${user.id}_${t.lesson_id}`;
    const doc = {
      user_id: user.id,
      lesson_id: t.lesson_id,
      lesson_title: t.lesson_title,
      module_title: t.module_title,
      track_id: t.track_id,
      track_title: t.track_title,
      content: t.content,
      status: t.status,
      created_at: iso(t.daysAgo),
      updated_at: iso(t.daysAgo),
    };
    if (t.status === 'submitted' || t.status === 'reviewed') {
      doc.submitted_at = iso(Math.max(t.daysAgo - 1, 0));
    }
    if (t.status === 'reviewed') {
      doc.reviewed_by = 'seed';
      doc.review_notes = t.review_notes;
    }
    await db.collection('spiritual_reflections').doc(id).set(doc);
    console.log(`  ✓ ${t.status}: ${t.lesson_title}`);
  }
}

async function seed() {
  const targetRoles = ['admin', 'recantiano', 'missionario'];
  const users = await findUsersWithRole(targetRoles);
  if (users.length === 0) {
    console.warn('[seed-notebook] no users with roles:', targetRoles);
    return;
  }
  console.log(`[seed-notebook] seeding reflections for ${users.length} user(s)`);
  for (const u of users) {
    await seedForUser(u);
  }
  console.log(`\n[seed-notebook] done. ${users.length * REFLECTIONS_TEMPLATE.length} reflections written.`);
}

seed().then(() => process.exit(0)).catch(err => {
  console.error('[seed-notebook] failed:', err);
  process.exit(1);
});
