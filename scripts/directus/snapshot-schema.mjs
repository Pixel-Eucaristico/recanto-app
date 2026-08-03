import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/$/, '');
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const OUT_DIR = resolve(process.cwd(), 'infra/directus/snapshots');

if (!DIRECTUS_URL || !DIRECTUS_ADMIN_TOKEN) {
  throw new Error('DIRECTUS_URL e DIRECTUS_ADMIN_TOKEN sao obrigatorios.');
}

async function directus(path) {
  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status} ${text}`);
  }

  return body?.data ?? body;
}

mkdirSync(OUT_DIR, { recursive: true });

const snapshot = {
  generated_at: new Date().toISOString(),
  collections: await directus('/collections?limit=-1'),
  fields: await directus('/fields?limit=-1'),
  roles: await directus('/roles?limit=-1'),
  permissions: await directus('/permissions?limit=-1'),
};

const file = resolve(OUT_DIR, `snapshot-${Date.now()}.json`);
writeFileSync(file, JSON.stringify(snapshot, null, 2));

console.log(`Snapshot Directus salvo em ${file}`);
