#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import dotenv from 'dotenv';

// Load .env.local for local runs (Vercel already injects env vars)
if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
if (existsSync('.env')) dotenv.config({ path: '.env' });

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'recanto-app-dev';

function buildServiceAccountJson() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    } catch (e) {
      console.error('[deploy-firebase] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.');
      process.exit(1);
    }
  }

  const projectIdVar = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectIdVar && clientEmail && rawKey) {
    const privateKey = rawKey
      .trim()
      .replace(/^"/, '')
      .replace(/"$/, '')
      .replace(/\\n/g, '\n');
    return JSON.stringify({
      type: 'service_account',
      project_id: projectIdVar,
      private_key: privateKey,
      client_email: clientEmail,
      token_uri: 'https://oauth2.googleapis.com/token'
    });
  }

  return null;
}

const sa = buildServiceAccountJson();
if (!sa) {
  console.warn('[deploy-firebase] No service account credentials found (FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_PROJECT_ID+FIREBASE_CLIENT_EMAIL+FIREBASE_PRIVATE_KEY). Skipping deploy.');
  process.exit(0);
}

const tmpFile = join(tmpdir(), `firebase-sa-${Date.now()}.json`);
writeFileSync(tmpFile, sa, { mode: 0o600 });

try {
  console.log(`[deploy-firebase] Deploying rules + indexes to project: ${projectId}`);
  execSync(
    `npx --yes firebase-tools deploy --only firestore:rules,firestore:indexes --project ${projectId} --non-interactive`,
    {
      stdio: 'inherit',
      env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: tmpFile }
    }
  );
  console.log('[deploy-firebase] Deploy complete.');
} catch (err) {
  console.error('[deploy-firebase] Deploy failed:', err.message);
  process.exit(1);
} finally {
  if (existsSync(tmpFile)) unlinkSync(tmpFile);
}
