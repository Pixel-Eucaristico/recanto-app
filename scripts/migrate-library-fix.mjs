#!/usr/bin/env node
/**
 * Migration idempotente — corrige dados de library:
 *  1. Renumera footnotes de capítulos por ordem de aparição no texto
 *  2. Normaliza `order` de capítulos por grupo (front/body/back)
 *
 * Roda apenas se detecta problema (audit-only quando passa --dry).
 * Idempotente: rodar 2x não muda nada.
 *
 * Uso:
 *   node scripts/migrate-library-fix.mjs --dry   (só audita, não escreve)
 *   node scripts/migrate-library-fix.mjs         (escreve mudanças)
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
if (existsSync('.env')) dotenv.config({ path: '.env' });

const dryRun = process.argv.includes('--dry');

function hasCredentials() {
  return !!(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY)
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

// ─── Pure logic (espelha BookEntity) ────────────────────────────────────────
// Ordem ABNT: créditos → prefácio → introdução → capítulos → notas → apêndice → glossário → bibliografia → sobre
const SECTION_GROUP_ORDER = {
  credits: 0, preface: 1, introduction: 2,
  chapter: 3,
  notes: 4, appendix: 5, glossary: 6, bibliography: 7, about: 8,
};

/** Migra autor formato antigo (string) → novo (BookAuthor). */
function migrateAuthorString(s) {
  const trimmed = (s ?? '').toString().trim();
  if (!trimmed) return { surname: '', given_name: '' };
  if (trimmed.includes(',')) {
    const [surname, ...rest] = trimmed.split(',');
    return { surname: surname.trim(), given_name: rest.join(',').trim() };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { surname: parts[0], given_name: '' };
  return {
    surname: parts[parts.length - 1],
    given_name: parts.slice(0, -1).join(' '),
  };
}

/** Remove undefined recursivamente (Firestore não aceita). */
function deepStripUndefined(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(deepStripUndefined).filter(v => v !== undefined);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = deepStripUndefined(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return out;
  }
  return value;
}

/** Detecta references com autores em formato antigo (string em vez de objeto). */
function migrateReferences(references) {
  if (!references || references.length === 0) return { changed: false, references: references ?? [] };
  let changed = false;
  const out = references.map(ref => {
    if (!ref.authors || !Array.isArray(ref.authors)) return ref;
    const needsMigration = ref.authors.some(a => typeof a === 'string');
    if (!needsMigration) return ref;
    changed = true;
    return {
      ...ref,
      authors: ref.authors.map(a => typeof a === 'string' ? migrateAuthorString(a) : a),
      // edition string → number
      edition: typeof ref.edition === 'string' ? Number(ref.edition) || undefined : ref.edition,
    };
  });
  return { changed, references: out };
}

function kindOf(ch) { return ch.kind ?? 'chapter'; }

function sortChapters(chapters) {
  return chapters.slice().sort((a, b) => {
    const ga = SECTION_GROUP_ORDER[kindOf(a)] ?? 3;
    const gb = SECTION_GROUP_ORDER[kindOf(b)] ?? 3;
    if (ga !== gb) return ga - gb;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

function normalizeOrders(chapters) {
  const sorted = sortChapters(chapters);
  const groups = new Map();
  for (const ch of sorted) {
    const k = kindOf(ch);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(ch);
  }
  const out = [];
  for (const [, group] of groups) {
    group.forEach((ch, idx) => out.push({ ...ch, order: idx + 1 }));
  }
  return out;
}

function renumberFootnotes(blocks, footnotes) {
  if (!footnotes || footnotes.length === 0) return { blocks, footnotes: [] };
  const remap = new Map();
  let next = 1;
  const re = /\[\^(\d+)\]/g;
  for (const b of blocks) {
    const matches = (b.content ?? '').matchAll(re);
    for (const m of matches) {
      const old = Number(m[1]);
      if (!remap.has(old)) { remap.set(old, next); next++; }
    }
  }
  const newBlocks = blocks.map(b => {
    let content = (b.content ?? '').replace(/\[\^(\d+)\]/g, (_, n) => {
      const r = remap.get(Number(n));
      return r ? `[^__TMP${r}__]` : `[^${n}]`;
    });
    content = content.replace(/\[\^__TMP(\d+)__\]/g, '[^$1]');
    return { ...b, content };
  });
  const newFootnotes = footnotes
    .map(f => {
      const r = remap.get(f.number);
      return r ? { ...f, number: r } : f;
    })
    .sort((a, b) => a.number - b.number);
  return { blocks: newBlocks, footnotes: newFootnotes };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  if (!hasCredentials()) {
    console.warn('[migrate-library] Sem credenciais Firebase Admin. Skipping.');
    return;
  }
  initAdmin();
  const db = getFirestore();

  console.log(`📚 Library migration ${dryRun ? '(DRY RUN)' : '(LIVE)'}\n`);

  const booksSnap = await db.collection('library_books').get();
  console.log(`Encontrados ${booksSnap.size} livros\n`);

  let totalIssues = 0;
  let totalFixed = 0;

  for (const bookDoc of booksSnap.docs) {
    const bookId = bookDoc.id;
    const chaptersSnap = await db.collection('library_book_chapters')
      .where('book_id', '==', bookId)
      .get();

    if (chaptersSnap.empty) continue;
    const chapters = chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const issues = [];

    // 1) Audit footnotes
    const fixedFootnotes = new Map();
    for (const ch of chapters) {
      if (!ch.footnotes || ch.footnotes.length === 0) continue;
      const result = renumberFootnotes(ch.blocks ?? [], ch.footnotes);
      const before = ch.footnotes.map(f => f.number).join(',');
      const after = result.footnotes.map(f => f.number).join(',');
      if (before !== after) {
        issues.push(`  cap ${ch.order} (${ch.title}): footnotes ${before} → ${after}`);
        fixedFootnotes.set(ch.id, result);
      }
    }

    // 2) Audit orders
    const normalized = normalizeOrders(chapters);
    const orderChanges = [];
    for (const ch of chapters) {
      const norm = normalized.find(n => n.id === ch.id);
      if (norm && norm.order !== ch.order) {
        orderChanges.push({ id: ch.id, oldOrder: ch.order, newOrder: norm.order, title: ch.title });
      }
    }
    if (orderChanges.length > 0) {
      issues.push(`  ${orderChanges.length} capítulos com order desatualizado:`);
      for (const c of orderChanges) issues.push(`    "${c.title}": ${c.oldOrder} → ${c.newOrder}`);
    }

    // 3) Audit references (autores formato antigo → novo)
    const fixedRefs = new Map();
    for (const ch of chapters) {
      if (!ch.references || ch.references.length === 0) continue;
      const result = migrateReferences(ch.references);
      if (result.changed) {
        issues.push(`  cap "${ch.title}": ${ch.references.length} ref(s) com autores em formato antigo`);
        fixedRefs.set(ch.id, result.references);
      }
    }

    if (issues.length === 0) continue;

    console.log(`📖 Livro: ${bookDoc.data().title} (${bookId})`);
    issues.forEach(i => console.log(i));
    totalIssues += issues.length;

    if (!dryRun) {
      const batch = db.batch();
      for (const [chId, result] of fixedFootnotes) {
        batch.update(db.collection('library_book_chapters').doc(chId), {
          blocks: result.blocks,
          footnotes: result.footnotes,
        });
      }
      for (const c of orderChanges) {
        batch.update(db.collection('library_book_chapters').doc(c.id), {
          order: c.newOrder,
        });
      }
      for (const [chId, refs] of fixedRefs) {
        batch.update(db.collection('library_book_chapters').doc(chId), {
          references: deepStripUndefined(refs),
        });
      }
      await batch.commit();
      totalFixed += issues.length;
      console.log(`  ✅ Aplicado\n`);
    } else {
      console.log('');
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   Issues detectadas: ${totalIssues}`);
  if (dryRun) {
    console.log(`   Modo: DRY (nada escrito). Re-rode sem --dry para aplicar.`);
  } else {
    console.log(`   Issues corrigidas: ${totalFixed}`);
  }
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
