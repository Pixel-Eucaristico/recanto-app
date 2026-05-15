#!/usr/bin/env node
/**
 * Seed idempotente de formation_track_types.
 * Cria tipos default se ainda não existirem (não sobrescreve customizações do admin).
 *
 * Roda no postinstall + vercel-build (ver package.json).
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
if (existsSync('.env')) dotenv.config({ path: '.env' });

const DEFAULT_TYPES = [
  { slug: 'pre-vocacional', label: 'Pré-vocacional', description: 'Conhecendo a vocação',          order: 1 },
  { slug: 'vocacional',     label: 'Vocacional',     description: 'Aprofundamento vocacional',    order: 2 },
  { slug: 'etapas',         label: 'Etapas',         description: 'Trilha em etapas progressivas', order: 3 },
  { slug: 'continua',       label: 'Contínua',       description: 'Formação permanente',          order: 4 },
];

function hasCredentials() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) return true;
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY,
  );
}

function initAdmin() {
  if (getApps().length) return;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
    return;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawKey?.trim().replace(/^"/, '').replace(/"$/, '').replace(/\\n/g, '\n');
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

async function run() {
  if (!hasCredentials()) {
    console.warn('[seed-track-types] No Firebase credentials. Skipping.');
    return;
  }
  initAdmin();
  const db = getFirestore();
  const col = db.collection('formation_track_types');

  // Pega slugs já existentes — não sobrescreve customizações
  const snap = await col.get();
  const existingSlugs = new Set(snap.docs.map(d => d.data()?.slug));

  let created = 0;
  for (const type of DEFAULT_TYPES) {
    if (existingSlugs.has(type.slug)) continue;
    await col.add({
      ...type,
      created_at: new Date().toISOString(),
    });
    created++;
  }

  console.log(`[seed-track-types] ${created} tipos novos criados (${DEFAULT_TYPES.length - created} já existiam).`);
}

run().catch(err => {
  console.error('[seed-track-types] Failed:', err);
  process.exit(1);
});
