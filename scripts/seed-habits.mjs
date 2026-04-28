#!/usr/bin/env node
/**
 * Seed de hábitos default. Idempotente — só cria se slug ainda não existe.
 */
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

const DEFAULT_HABITS = [
  {
    id: 'habit-santo-terco',
    title: 'Santo Terço',
    description: 'Rezar o Terço diariamente.',
    category: 'oracao',
    required_for_roles: ['missionario', 'recantiano'],
    order: 1,
    grace_days: 3,
  },
  {
    id: 'habit-oracao-comunidade',
    title: 'Oração da Comunidade',
    description: 'Oração própria da comunidade.',
    category: 'oracao',
    required_for_roles: ['missionario', 'recantiano'],
    order: 2,
    grace_days: 3,
  },
  {
    id: 'habit-regra-vida',
    title: 'Leitura da Regra de Vida',
    description: 'Ler um trecho da Regra de Vida.',
    category: 'estudo',
    required_for_roles: ['missionario', 'recantiano'],
    order: 3,
    grace_days: 3,
  },
  {
    id: 'habit-exame-consciencia',
    title: 'Exame de Consciência',
    description: 'Revisar o dia à luz do Evangelho.',
    category: 'disciplina',
    required_for_roles: ['missionario', 'recantiano'],
    order: 4,
    grace_days: 3,
  },
];

async function run() {
  initAdmin();
  const db = getFirestore();
  const now = new Date().toISOString();
  console.log('[seed-habits] Seeding default habits...');
  let created = 0;
  let skipped = 0;
  for (const h of DEFAULT_HABITS) {
    const ref = db.collection('habits').doc(h.id);
    const snap = await ref.get();
    if (snap.exists) {
      skipped++;
      console.log(`  - skip ${h.id} (exists)`);
      continue;
    }
    await ref.set({
      ...h,
      created_at: now,
      created_by: 'seed',
    });
    created++;
    console.log(`  + ${h.id}`);
  }
  console.log(`[seed-habits] Done. ${created} created, ${skipped} skipped.`);
}

run().catch(err => {
  console.error('[seed-habits] Failed:', err.message);
  process.exit(1);
});
