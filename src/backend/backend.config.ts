import type { BackendProvider } from './backend.types';

const DEFAULT_PROVIDER: BackendProvider = 'firebase';

export function getBackendProvider(): BackendProvider {
  const value =
    typeof window === 'undefined'
      ? process.env.BACKEND_PROVIDER
      : process.env.NEXT_PUBLIC_BACKEND_PROVIDER;

  if (value === 'directus' || value === 'firebase') {
    return value;
  }

  return DEFAULT_PROVIDER;
}
