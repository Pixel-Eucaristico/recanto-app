/**
 * Inicialização do Firebase Admin tolerante a desvio de relógio.
 *
 * O Admin SDK assina o JWT de service account com o relógio LOCAL. O Google rejeita
 * `iat`/`exp` fora de ~5 minutos com `ACCESS_TOKEN_EXPIRED` — erro que não menciona
 * relógio nenhum e manda investigar credencial. Numa máquina com fuso ou DST errado,
 * todos os scripts de seed/migração quebram sem explicação.
 *
 * Aqui o desvio é medido contra o header `Date` do próprio Google e corrigido no
 * relógio DO PROCESSO, antes de qualquer chamada autenticada.
 *
 * Uso:
 *   import { initAdmin } from './lib/admin-app.mjs';
 *   const db = await initAdmin();
 */
import { existsSync } from 'node:fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

/** Abaixo disso o Google tolera e não vale mexer no relógio do processo. */
const SKEW_TOLERANCE_MS = 30_000;

function loadEnv() {
  if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
  if (existsSync('.env')) dotenv.config({ path: '.env' });
}

function readServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) {
    throw new Error(
      'Faltam credenciais do Admin SDK. Defina FIREBASE_SERVICE_ACCOUNT_KEY ou '
      + 'FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY em .env.local.',
    );
  }

  const privateKey = rawKey.trim().replace(/^"/, '').replace(/"$/, '').replace(/\\n/g, '\n');
  return { projectId, clientEmail, privateKey };
}

/** Desvio em ms entre este processo e o Google. Positivo = máquina adiantada. */
async function measureClockSkewMs() {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', { method: 'HEAD' });
    const header = res.headers.get('date');
    if (!header) return 0;
    const serverMs = new Date(header).getTime();
    if (!Number.isFinite(serverMs)) return 0;
    return Date.now() - serverMs;
  } catch {
    // Sem rede não há o que corrigir — o erro real vem depois, na chamada.
    return 0;
  }
}

/**
 * Corrige o relógio do processo.
 *
 * Monkey-patch global é aceitável aqui: script CLI de uso único, e o horário
 * corrigido é MAIS correto que o da máquina. Não vai pra código de aplicação.
 */
function shiftProcessClock(offsetMs) {
  const RealDate = Date;
  const shifted = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(RealDate.now() + offsetMs);
      else super(...args);
    }
    static now() {
      return RealDate.now() + offsetMs;
    }
  };
  globalThis.Date = shifted;
}

/** Inicializa o app (idempotente) e devolve o Firestore. */
export async function initAdmin() {
  loadEnv();
  const serviceAccount = readServiceAccount();

  const skewMs = await measureClockSkewMs();
  if (Math.abs(skewMs) > SKEW_TOLERANCE_MS) {
    const seconds = Math.round(Math.abs(skewMs) / 1000);
    console.warn(
      `[admin] Relógio local ${skewMs > 0 ? 'adiantado' : 'atrasado'} ${seconds}s `
      + 'em relação ao Google — corrigindo dentro deste processo.',
    );
    console.warn('[admin] Conserte a máquina depois: w32tm /resync /force (como administrador).');
    shiftProcessClock(-skewMs);
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.projectId });
  }

  return getFirestore();
}

export { readServiceAccount, measureClockSkewMs };
