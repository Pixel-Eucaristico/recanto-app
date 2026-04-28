#!/usr/bin/env node
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
if (existsSync('.env')) dotenv.config({ path: '.env' });

// ─── Firebase Admin init ───────────────────────────────────────────────────
function initAdmin() {
  if (getApps().length) return;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
    return;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) {
    throw new Error('Missing Firebase Admin env vars');
  }
  const privateKey = rawKey.trim().replace(/^"/, '').replace(/"$/, '').replace(/\\n/g, '\n');
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

// ─── R2 init ───────────────────────────────────────────────────────────────
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID?.trim();
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim();
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim();
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME?.trim();
const R2_PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').trim().replace(/\/$/, '');

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  throw new Error('Missing R2 env vars');
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  forcePathStyle: true,
});

async function objectExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadImage(sourceUrl, key) {
  if (await objectExists(key)) {
    return `${R2_PUBLIC_URL}/${key}`;
  }
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Failed to fetch ${sourceUrl}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buf,
    ContentType: res.headers.get('content-type') || 'image/jpeg',
  }));
  return `${R2_PUBLIC_URL}/${key}`;
}

// ─── Source images (fetched once, then hosted on R2) ───────────────────────
const SOURCE_IMAGES = {
  'track-pre-vocacional': [
    'https://picsum.photos/seed/pre-vocacional-1/800/500',
    'https://picsum.photos/seed/pre-vocacional-2/800/500',
    'https://picsum.photos/seed/pre-vocacional-3/800/500',
    'https://picsum.photos/seed/pre-vocacional-4/800/500',
  ],
  'track-vocacional': [
    'https://picsum.photos/seed/vocacional-1/800/500',
    'https://picsum.photos/seed/vocacional-2/800/500',
    'https://picsum.photos/seed/vocacional-3/800/500',
    'https://picsum.photos/seed/vocacional-4/800/500',
  ],
};

async function uploadGalleriesForTrack(trackId) {
  const sources = SOURCE_IMAGES[trackId] || [];
  const urls = [];
  for (let i = 0; i < sources.length; i++) {
    const key = `formation/tracks/${trackId}/gallery-${i + 1}.jpg`;
    const url = await uploadImage(sources[i], key);
    urls.push(url);
    console.log(`  ↑ ${key}`);
  }
  return urls;
}

// ─── Data ──────────────────────────────────────────────────────────────────
const now = new Date().toISOString();

const tracks = [
  {
    id: 'track-pre-vocacional',
    title: 'Pré-vocacional',
    description: 'Primeiros passos no caminho vocacional — descoberta do chamado.',
    type: 'pre-vocacional',
    required_roles: [],
    order: 1,
    is_published: true,
    module_ids: ['module-despertar', 'module-discernimento'],
    thumbnail_url: '',
    created_at: now,
    created_by: 'seed',
  },
  {
    id: 'track-vocacional',
    title: 'Vocacional',
    description: 'Aprofundamento da vocação — formação espiritual e doutrinal.',
    type: 'vocacional',
    required_roles: ['missionario', 'recantiano'],
    order: 2,
    is_published: true,
    module_ids: ['module-vida-oracao'],
    thumbnail_url: '',
    created_at: now,
    created_by: 'seed',
  },
];

const modules = [
  { id: 'module-despertar', title: 'O Despertar do Sentido', description: 'Reconhecer os sinais do chamado divino.', track_id: 'track-pre-vocacional', order: 1, lesson_ids: ['lesson-video-guia', 'lesson-silencio'], created_at: now },
  { id: 'module-discernimento', title: 'Discernimento', description: 'Distinguir o chamado real das ilusões passageiras.', track_id: 'track-pre-vocacional', order: 2, lesson_ids: ['lesson-oracao-discernimento'], created_at: now },
  { id: 'module-vida-oracao', title: 'Vida de Oração', description: 'Fundamentos da vida espiritual cotidiana.', track_id: 'track-vocacional', order: 1, lesson_ids: ['lesson-regra-vida'], created_at: now },
];

const lessons = [
  { id: 'lesson-video-guia', title: 'Vídeo guia — O que é vocação', description: 'Introdução ao conceito de vocação cristã.', module_id: 'module-despertar', order: 1, video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video_duration_seconds: 1112, min_watch_percent: 100, unlock_after_hours: 0, requires_reflection: true, requires_quiz: false, requires_forum_post: false, apostila_content: 'Texto introdutório sobre vocação.', material_ids: [], highlight_quotes: [{ text: 'Não fostes vós que me escolhestes; fui Eu que vos escolhi.', source: 'Jo 15, 16' }], created_at: now },
  { id: 'lesson-silencio', title: 'A escuta no silêncio', description: 'Como ouvir Deus no silêncio do coração.', module_id: 'module-despertar', order: 2, video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video_duration_seconds: 900, min_watch_percent: 100, unlock_after_hours: 24, requires_reflection: true, requires_quiz: true, requires_forum_post: false, material_ids: [], highlight_quotes: [], created_at: now },
  { id: 'lesson-oracao-discernimento', title: 'A oração como discernimento', description: 'A oração inaciana e o discernimento dos espíritos.', module_id: 'module-discernimento', order: 1, video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video_duration_seconds: 1500, min_watch_percent: 100, unlock_after_hours: 48, requires_reflection: true, requires_quiz: false, requires_forum_post: true, material_ids: [], highlight_quotes: [], created_at: now },
  { id: 'lesson-regra-vida', title: 'Construindo uma Regra de Vida', description: 'Estruturar o cotidiano espiritual.', module_id: 'module-vida-oracao', order: 1, video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video_duration_seconds: 1800, min_watch_percent: 100, unlock_after_hours: 0, requires_reflection: true, requires_quiz: true, requires_forum_post: true, material_ids: [], highlight_quotes: [], created_at: now },
];

// ─── Run ───────────────────────────────────────────────────────────────────
initAdmin();
const db = getFirestore();

async function seed() {
  console.log('[seed-formation] uploading gallery images to R2...');
  for (const t of tracks) {
    console.log(`[seed-formation] track ${t.id}`);
    t.gallery_images = await uploadGalleriesForTrack(t.id);
  }

  console.log('\n[seed-formation] writing tracks...');
  for (const t of tracks) {
    const { id, ...rest } = t;
    await db.collection('formation_tracks').doc(id).set(rest);
    console.log(`  ✓ track: ${id} (${rest.gallery_images?.length ?? 0} imgs)`);
  }

  console.log('[seed-formation] writing modules...');
  for (const m of modules) {
    const { id, ...rest } = m;
    await db.collection('formation_modules').doc(id).set(rest);
    console.log(`  ✓ module: ${id}`);
  }

  console.log('[seed-formation] writing lessons...');
  for (const l of lessons) {
    const { id, ...rest } = l;
    await db.collection('formation_lessons').doc(id).set(rest);
    console.log(`  ✓ lesson: ${id}`);
  }

  console.log('\n[seed-formation] done.');
  console.log(`  ${tracks.length} tracks, ${modules.length} modules, ${lessons.length} lessons`);
}

seed().then(() => process.exit(0)).catch(err => {
  console.error('[seed-formation] failed:', err);
  process.exit(1);
});
