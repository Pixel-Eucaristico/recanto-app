import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ENV_FILE = '.env.local';
const PROVIDERS = new Set(['firebase', 'directus']);

function upsertEnvValue(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');

  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }

  return `${content.trimEnd()}\n${line}\n`;
}

async function askWithDefault(question, fallback) {
  const answer = await rl.question(`${question} [${fallback}]: `);
  return answer.trim() || fallback;
}

const rl = createInterface({ input, output });

try {
  const answer = await rl.question('Qual backend deseja usar? (firebase/directus) [firebase]: ');
  const provider = answer.trim().toLowerCase() || 'firebase';

  if (!PROVIDERS.has(provider)) {
    throw new Error(`Provider invalido: ${provider}`);
  }

  const current = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8') : '';
  let next = upsertEnvValue(current, 'BACKEND_PROVIDER', provider);
  next = upsertEnvValue(next, 'NEXT_PUBLIC_BACKEND_PROVIDER', provider);

  if (provider === 'directus') {
    const directusUrl = await askWithDefault('URL do Directus', 'http://localhost:8055');
    const adminToken = await askWithDefault(
      'Admin static token do Directus',
      'your_directus_admin_static_token_here',
    );

    next = upsertEnvValue(next, 'DIRECTUS_URL', directusUrl);
    next = upsertEnvValue(next, 'NEXT_PUBLIC_DIRECTUS_URL', directusUrl);
    next = upsertEnvValue(next, 'DIRECTUS_ADMIN_TOKEN', adminToken);
  }

  writeFileSync(ENV_FILE, next);

  console.log(`Backend configurado para: ${provider}`);
  console.log(`Arquivo atualizado: ${ENV_FILE}`);
} finally {
  rl.close();
}
