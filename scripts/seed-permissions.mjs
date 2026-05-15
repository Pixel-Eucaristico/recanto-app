#!/usr/bin/env node
/**
 * Seed idempotente de permissions_config.
 *
 * Lê DEFAULT_ROLE_PERMISSIONS da app e faz arrayUnion por role — NUNCA remove
 * features existentes (devs podem customizar via admin UI sem perder ajustes).
 *
 * Skip silencioso se faltar credencial (útil em npm install fora de ambientes
 * com acesso ao Firebase). Roda em postinstall + vercel-build.
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
if (existsSync('.env')) dotenv.config({ path: '.env' });

// Mirror de DEFAULT_ROLE_PERMISSIONS em src/config/permissions.ts
// Manter sincronizado quando adicionar features novas.
const DEFAULT_ROLE_PERMISSIONS = {
  admin: ['*'],
  missionario: [
    'read:content', 'create:content', 'update:content',
    'read:calendar', 'manage:calendar',
    'read:forum', 'create:forum_topic', 'create:forum_post',
    'manage:followup', 'manage:challenges',
    'read:formation', 'complete:formation', 'manage:formation', 'review:formation',
    'log:habits', 'read:prayer',
    'read:community', 'post:community', 'manage:community',
    'read:library', 'manage:library', 'download:library',
  ],
  recantiano: [
    'read:content', 'read:calendar',
    'read:forum', 'create:forum_post',
    'read:formation', 'complete:formation',
    'log:habits', 'read:prayer',
    'read:community', 'post:community',
    'read:library', 'download:library',
  ],
  pai: [
    'read:content', 'read:calendar', 'read:parent_zone',
    'read:formation', 'log:habits', 'read:prayer',
    'read:community', 'post:community',
    'read:library', 'download:library',
  ],
  colaborador: [
    'read:content', 'read:calendar', 'read:formation',
    'log:habits', 'read:prayer',
    'read:community', 'post:community',
    'read:library',
  ],
  benfeitor: [
    'read:content', 'read:gratitude_corner', 'read:formation', 'read:prayer',
    'read:community',
    'read:library',
  ],
  visitante: ['read:public_content', 'read:public_calendar'],
};

function hasCredentials() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) return true;
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
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
  const privateKey = rawKey.trim().replace(/^"/, '').replace(/"$/, '').replace(/\\n/g, '\n');
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

async function run() {
  if (!hasCredentials()) {
    console.warn('[seed-permissions] No Firebase Admin credentials. Skipping.');
    return;
  }
  initAdmin();
  const db = getFirestore();
  console.log('[seed-permissions] Seeding permissions_config (arrayUnion, non-destructive)...');
  let updated = 0;
  for (const [role, features] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const ref = db.collection('permissions_config').doc(role);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        role,
        features,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log(`  + created ${role} with ${features.length} features`);
    } else {
      await ref.update({
        features: FieldValue.arrayUnion(...features),
        updated_at: new Date().toISOString(),
      });
      console.log(`  ~ merged ${role} (+${features.length} features via arrayUnion)`);
    }
    updated++;
  }
  console.log(`[seed-permissions] Done. ${updated} roles processed.`);
}

run().catch(err => {
  console.error('[seed-permissions] Failed:', err.message);
  process.exit(1);
});
