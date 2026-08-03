import { createBackend } from './backendFactory';

export type { Backend, BackendProvider } from './backend.types';
export { createBackend } from './backendFactory';

export const backend = createBackend();
