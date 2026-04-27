import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Validação central de env vars (server + client) usando @t3-oss/env-nextjs + zod.
 *
 * - Variáveis server-only nunca vazam pro bundle do client (acesso throw).
 * - Validação roda no import — se algo estiver faltando/inválido, a app nem sobe.
 * - Use `env.VAR_NAME` no código (autocomplete + tipos).
 */
export const env = createEnv({
  server: {
    // Firebase Admin SDK — credenciais server-side
    FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID ausente'),
    FIREBASE_CLIENT_EMAIL: z
      .string()
      .email('FIREBASE_CLIENT_EMAIL deve ser email válido do service account'),
    FIREBASE_PRIVATE_KEY: z
      .string()
      .min(100, 'FIREBASE_PRIVATE_KEY inválida (esperado PEM completo)'),

    // Cloudflare R2 storage
    R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID ausente'),
    R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID ausente'),
    R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY ausente'),
    R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME ausente'),

    // Google OAuth — opcional (Calendar/Gmail/YouTube unificados)
    GOOGLE_CLIENT_ID: z
      .string()
      .endsWith('.apps.googleusercontent.com', 'GOOGLE_CLIENT_ID deve terminar com .apps.googleusercontent.com')
      .optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    /** Callback unificado registrado no Google Cloud Console. */
    GOOGLE_OAUTH_CALLBACK_URL: z
      .string()
      .url('GOOGLE_OAUTH_CALLBACK_URL deve ser URL completa')
      .refine(uri => {
        try {
          const u = new URL(uri);
          // Google OAuth rejeita https em localhost (sem cert válido)
          if (u.hostname === 'localhost' && u.protocol === 'https:') return false;
          return true;
        } catch { return false; }
      }, 'Use http://localhost:* (não https) para callback em localhost')
      .refine(uri => {
        try {
          return new URL(uri).pathname === '/api/google/callback';
        } catch { return false; }
      }, 'Path deve ser exatamente "/api/google/callback"')
      .optional(),
    /** Legacy — callback do Calendar. Deprecado, use GOOGLE_OAUTH_CALLBACK_URL. */
    GOOGLE_REDIRECT_URI: z.string().url().optional(),
  },

  client: {
    // Firebase Web SDK
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY ausente'),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
      .string()
      .regex(/\.firebaseapp\.com$/, 'AUTH_DOMAIN deve terminar com .firebaseapp.com'),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().regex(/^\d+$/, 'Deve ser numérico'),
    NEXT_PUBLIC_FIREBASE_APP_ID: z
      .string()
      .regex(/^1:\d+:web:[a-f0-9]+$/, 'APP_ID inválido (formato esperado 1:NUM:web:HEX)'),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: z.string().url().optional(),

    // Cloudflare R2 URL pública
    NEXT_PUBLIC_R2_PUBLIC_URL: z.string().url('NEXT_PUBLIC_R2_PUBLIC_URL deve ser URL válida'),

    // App
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url()
      .refine(uri => {
        try {
          const u = new URL(uri);
          // localhost com https quebra OAuth do Google
          if (u.hostname === 'localhost' && u.protocol === 'https:') return false;
          return true;
        } catch { return false; }
      }, 'NEXT_PUBLIC_APP_URL deve ser http (não https) em localhost')
      .optional(),
    NEXT_PUBLIC_MEDIA_MAX_MB: z.coerce.number().int().positive().default(10),
    NEXT_PUBLIC_ACL_DEBUG: z.enum(['true', 'false']).optional(),
  },

  /**
   * Mapa explícito — `runtimeEnv` é obrigatório para client vars no Next.js
   * porque `process.env.NEXT_PUBLIC_*` só são inlineadas no build quando referenciadas
   * literalmente.
   */
  runtimeEnv: {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_OAUTH_CALLBACK_URL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MEDIA_MAX_MB: process.env.NEXT_PUBLIC_MEDIA_MAX_MB,
    NEXT_PUBLIC_ACL_DEBUG: process.env.NEXT_PUBLIC_ACL_DEBUG,
  },

  /** Pula validação em builds onde env não está carregado (ex: lint, CI sem secrets). */
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',

  /** Trata strings vazias como `undefined` (comum em .env). */
  emptyStringAsUndefined: true,

  onValidationError: (issues) => {
    const errors = Array.isArray(issues)
      ? issues
      : // @ts-expect-error — ZodError legacy shape
        issues?.issues ?? [];
    // eslint-disable-next-line no-console
    console.error('\n❌ Env inválido / faltando:\n' + errors.map((e: { path: string[]; message: string }) => `  • ${e.path.join('.')}: ${e.message}`).join('\n') + '\n');
    throw new Error('Variáveis de ambiente inválidas — ver log acima.');
  },

  onInvalidAccess: (variable) => {
    throw new Error(
      `❌ Tentativa de acessar a variável server-only "${variable}" no código do client. Mova para server, API route ou prefixe com NEXT_PUBLIC_.`,
    );
  },
});
