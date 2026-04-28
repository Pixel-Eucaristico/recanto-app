/**
 * Central de Oração — intenções da comunidade + log "eu orei".
 * Inspiração: Mateus 18:33 — misericórdia compartilhada.
 *
 * MVP simples:
 * - Qualquer membro com `read:prayer` cria/visualiza intenção.
 * - Anônimo opcional (intenção visível, autor oculto).
 * - "Eu orei" — log incrementa contador (1 por user por intenção).
 */

export type PrayerIntentionKind = 'pessoal' | 'comunidade' | 'mundo' | 'agradecimento';

export interface PrayerIntention {
  id: string;
  /** Texto da intenção (markdown curto). */
  body: string;
  kind: PrayerIntentionKind;
  /** Quando true, autor não é exibido (mas continua armazenado pra moderação). */
  anonymous: boolean;
  created_by: string;
  created_by_name?: string;
  /** Total de "eu orei" (denormalizado pra leitura rápida). */
  prayed_count: number;
  /** Quando true, autor marcou como respondida. */
  answered: boolean;
  answered_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface PrayerLog {
  id: string;
  intention_id: string;
  user_id: string;
  prayed_at: string;
}
