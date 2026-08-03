import type { Backend } from './backend.types';
import { getBackendProvider } from './backend.config';
import { createDirectusBackend } from '@/infrastructure/directus/DirectusBackend';
import { createFirebaseBackend } from '@/infrastructure/firebase/FirebaseBackend';

export function createBackend(): Backend {
  const provider = getBackendProvider();

  if (provider === 'directus') {
    return createDirectusBackend();
  }

  return createFirebaseBackend();
}
