'use client';

import { useEffect, useState } from 'react';
import { contentGrantService } from '@/application/content-access/ContentGrantService';
import { ContentType } from '@/shared/types/content-access';

const EMPTY: ReadonlySet<string> = new Set();

/**
 * Carrega o conjunto de IDs de conteúdos que o usuário tem grant explícito.
 * Use no catálogo pra desbloquear itens via `evaluateAccess`.
 */
export function useUserGrants(userId: string | undefined, contentType: ContentType) {
  const [grantedIds, setGrantedIds] = useState<ReadonlySet<string>>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) { setGrantedIds(EMPTY); return; }
    let alive = true;
    setLoading(true);
    contentGrantService
      .listGrantedContentIds(userId, contentType)
      .then(set => { if (alive) setGrantedIds(set); })
      .catch(err => {
        console.error('[useUserGrants] erro:', err);
        if (alive) setGrantedIds(EMPTY);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [userId, contentType]);

  return { grantedIds, loading };
}
