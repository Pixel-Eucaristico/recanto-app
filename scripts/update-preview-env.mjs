import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

const envConfig = dotenv.parse(readFileSync('.env.local'));

const varsToUpdate = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL'
];

for (const key of varsToUpdate) {
  const val = envConfig[key];
  if (!val) {
    console.warn(`Key ${key} not found in .env.local!`);
    continue;
  }
  
  console.log(`Updating ${key} for preview...`);
  try {
    // Remove existing
    execFileSync('npx', ['--yes', 'vercel', 'env', 'rm', key, 'preview', '--yes'], { stdio: 'ignore', shell: true });
  } catch (e) {
    // ignore if it doesn't exist
  }

  try {
    // Add new
    execFileSync('npx', ['--yes', 'vercel', 'env', 'add', key, 'preview', '--value', val, '--yes'], { stdio: 'inherit', shell: true });
    console.log(`Successfully updated ${key}.`);
  } catch (e) {
    console.error(`Failed to update ${key}:`, e.message);
  }
}
