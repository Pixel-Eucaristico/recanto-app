#!/usr/bin/env node
/**
 * Migração: converte flags legados (`requires_*` + video + habit_ids) em
 * `FormationLesson.components[]` (LessonComponentInstance[]).
 *
 * Idempotente: pula aulas que já têm `components` definido.
 * Não remove flags antigos — mantém pra rollback. Pode ser rodado múltiplas vezes.
 *
 * Uso: node scripts/migrate-lessons-to-components.mjs [--dry-run]
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
if (existsSync('.env')) dotenv.config({ path: '.env' });

const DRY_RUN = process.argv.includes('--dry-run');

function instanceId(kind) { return `mig_${kind}`; }

function buildComponentsFromFlags(lesson) {
  const out = [];
  let order = 0;

  if (lesson.video_url) {
    out.push({
      id: instanceId('video'),
      kind: 'video',
      required: true,
      order: order++,
      config: {
        url: lesson.video_url,
        min_watch_percent: lesson.min_watch_percent ?? 80,
        duration_seconds: lesson.video_duration_seconds ?? null,
      },
    });
  }
  if (lesson.unlock_after_hours && lesson.unlock_after_hours > 0) {
    out.push({
      id: instanceId('time_wait_days'),
      kind: 'time_wait_days',
      required: true,
      order: order++,
      config: { days: lesson.unlock_after_hours / 24, anchor: 'video_completed_at' },
    });
  }
  if (lesson.requires_reflection) {
    out.push({ id: instanceId('reflection'), kind: 'reflection', required: true, order: order++, config: { require_submitted: true } });
  }
  if (lesson.requires_quiz) {
    out.push({ id: instanceId('quiz'), kind: 'quiz', required: true, order: order++, config: { quiz_id: lesson.quiz_id ?? null } });
  }
  if (lesson.requires_forum_post) {
    out.push({
      id: instanceId('forum_ask'),
      kind: 'forum_ask',
      required: true,
      order: order++,
      config: { prompt: lesson.forum_prompt ?? null, min_posts: 1 },
    });
  }
  if (lesson.requires_flashcards) out.push({ id: instanceId('flashcards'), kind: 'flashcards', required: true, order: order++, config: {} });
  if (lesson.requires_case_study) out.push({ id: instanceId('case_study'), kind: 'case_study', required: true, order: order++, config: {} });
  if (lesson.requires_word_search) out.push({ id: instanceId('word_search'), kind: 'word_search', required: true, order: order++, config: { min_score: 100 } });
  if (lesson.requires_crossword) out.push({ id: instanceId('crossword'), kind: 'crossword', required: true, order: order++, config: { min_score: 100 } });
  if (lesson.requires_mind_map) out.push({ id: instanceId('mind_map'), kind: 'mind_map', required: true, order: order++, config: {} });

  for (const habitId of lesson.habit_ids ?? []) {
    out.push({
      id: instanceId(`habit_days_${habitId}`),
      kind: 'habit_days',
      required: true,
      order: order++,
      config: { habit_id: habitId, min_days: 1 },
    });
  }

  // Limpa nulls (Firestore aceita null mas vamos preferir omitir)
  return out.map(inst => ({
    ...inst,
    config: Object.fromEntries(
      Object.entries(inst.config).filter(([, v]) => v !== null && v !== undefined),
    ),
  }));
}

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
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    }),
  });
}

async function main() {
  if (!hasCredentials()) {
    console.error('[migrate] credenciais Firebase Admin ausentes (.env). Abortando.');
    process.exit(1);
  }
  initAdmin();
  const db = getFirestore();

  const snap = await db.collection('formation_lessons').get();
  console.log(`[migrate] ${snap.size} aulas encontradas. dry-run=${DRY_RUN}`);

  let migrated = 0;
  let skipped = 0;
  let empty = 0;

  for (const doc of snap.docs) {
    const lesson = { id: doc.id, ...doc.data() };
    if (Array.isArray(lesson.components) && lesson.components.length > 0) {
      skipped++;
      continue;
    }
    const components = buildComponentsFromFlags(lesson);
    if (components.length === 0) {
      empty++;
      continue;
    }
    if (DRY_RUN) {
      console.log(`[dry] ${lesson.id} → ${components.length} components: ${components.map(c => c.kind).join(',')}`);
    } else {
      await doc.ref.update({ components, updated_at: new Date().toISOString() });
      console.log(`[ok] ${lesson.id} → ${components.length} components`);
    }
    migrated++;
  }

  console.log(`[migrate] resumo: migrated=${migrated} skipped=${skipped} empty=${empty}`);
}

main().catch(e => {
  console.error('[migrate] erro:', e);
  process.exit(1);
});
