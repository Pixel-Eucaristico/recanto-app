#!/usr/bin/env node
/**
 * Backfill de `track_id` em `content_versions`.
 *
 * As Firestore rules autorizam o formador por `formation_tracks/{track_id}.formator_ids`.
 * Versões gravadas antes dessa denormalização não têm o campo e ficam invisíveis pra
 * ele — só o dono e o admin conseguem ler. Este script preenche o histórico legado.
 *
 * Precisa do Admin SDK: `content_versions` é append-only nas rules
 * (`allow update, delete: if false`), então nenhum cliente consegue corrigir.
 *
 * Uso:
 *   node scripts/backfill-content-versions-track.mjs --dry-run
 *   node scripts/backfill-content-versions-track.mjs
 */
import { initAdmin } from './lib/admin-app.mjs';

const db = await initAdmin();

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('--dry');
const BATCH_SIZE = 400;

/** Marca versões cujo doc alvo sumiu, pra o script ser idempotente. */
const ORPHAN = '__orphan__';

/** Cache de leitura por `${collection}/${id}` — evita reler o mesmo alvo. */
const docCache = new Map();

async function readDoc(collection, id) {
  const key = `${collection}/${id}`;
  if (docCache.has(key)) return docCache.get(key);
  const snap = await db.collection(collection).doc(id).get();
  const data = snap.exists ? snap.data() : null;
  docCache.set(key, data);
  return data;
}

function scopeTrackId(visibility) {
  if (!visibility || visibility.scope === 'global') return null;
  return visibility.track_id ?? null;
}

/** Resolve a trilha de uma versão a partir do documento que ela versiona. */
async function resolveTrackId(version) {
  const { target_collection: collection, target_id: id } = version;

  if (collection === 'spiritual_reflections') {
    const doc = await readDoc(collection, id);
    return doc ? (doc.track_id ?? null) : ORPHAN;
  }

  if (collection === 'community_posts') {
    const doc = await readDoc(collection, id);
    if (!doc) return ORPHAN;
    return scopeTrackId(doc.visibility);
  }

  if (collection === 'community_replies') {
    const reply = await readDoc(collection, id);
    if (!reply) return ORPHAN;
    if (!reply.post_id) return null;
    const post = await readDoc('community_posts', reply.post_id);
    if (!post) return ORPHAN;
    return scopeTrackId(post.visibility);
  }

  if (collection === 'student_mind_maps') {
    const map = await readDoc(collection, id);
    if (!map) return ORPHAN;
    if (!map.lesson_id) return null;
    // Lesson não carrega track_id — chega nela via module.
    const lesson = await readDoc('formation_lessons', map.lesson_id);
    if (!lesson?.module_id) return null;
    const module = await readDoc('formation_modules', lesson.module_id);
    return module?.track_id ?? null;
  }

  return null;
}

async function main() {
  console.log(`\nBackfill de track_id em content_versions${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  const snap = await db.collection('content_versions').get();
  console.log(`Total de versões: ${snap.size}`);

  const pending = snap.docs.filter(d => {
    const trackId = d.data().track_id;
    return typeof trackId !== 'string' || trackId === '';
  });
  console.log(`Sem track_id: ${pending.length}`);

  if (pending.length === 0) {
    console.log('\nNada a fazer.\n');
    return;
  }

  const updates = [];
  const stats = { resolved: 0, orphan: 0, skipped: 0 };
  const byCollection = {};

  for (const doc of pending) {
    const version = doc.data();
    const target = version.target_collection ?? '(desconhecida)';
    byCollection[target] = (byCollection[target] ?? 0) + 1;

    let trackId = null;
    try {
      trackId = await resolveTrackId(version);
    } catch (err) {
      console.warn(`  ! Falha em ${doc.id}: ${err.message}`);
    }

    if (trackId === ORPHAN) {
      stats.orphan++;
      updates.push({ ref: doc.ref, track_id: ORPHAN });
    } else if (trackId) {
      stats.resolved++;
      updates.push({ ref: doc.ref, track_id: trackId });
    } else {
      // Escopo global ou sem trilha derivável — deixa em branco de propósito.
      stats.skipped++;
    }
  }

  console.log('\nPor coleção alvo:');
  for (const [name, count] of Object.entries(byCollection)) {
    console.log(`  ${name}: ${count}`);
  }
  console.log(`\nResolvidas: ${stats.resolved}`);
  console.log(`Órfãs (alvo removido): ${stats.orphan}`);
  console.log(`Sem trilha (escopo global): ${stats.skipped}`);

  if (DRY_RUN) {
    console.log('\nDRY RUN — nada foi gravado. Rode sem --dry-run pra aplicar.\n');
    return;
  }

  let written = 0;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const chunk = updates.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const { ref, track_id } of chunk) batch.update(ref, { track_id });
    await batch.commit();
    written += chunk.length;
    console.log(`  gravadas ${written}/${updates.length}`);
  }

  console.log(`\nConcluído: ${written} versões atualizadas.\n`);
}

main().catch(err => {
  console.error('\nErro no backfill:', err);
  process.exit(1);
});
