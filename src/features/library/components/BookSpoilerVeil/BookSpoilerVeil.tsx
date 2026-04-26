'use client';

import { Lock } from 'lucide-react';

interface BookSpoilerVeilProps {
  visibleUntil: string;
}

/**
 * Aviso exibido no fim do conteúdo cortado por spoiler progressivo.
 * Indica até onde o aluno está liberado e que avançar nas aulas libera mais.
 */
export function BookSpoilerVeil({ visibleUntil }: BookSpoilerVeilProps) {
  return (
    <div className="my-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 md:p-6 text-center">
      <Lock className="w-8 h-8 mx-auto mb-2 text-warning" />
      <h3 className="font-semibold text-base-content mb-1">Conteúdo bloqueado</h3>
      <p className="text-sm text-base-content/70">
        Disponível até <strong>{visibleUntil}</strong>. Avance nas aulas pra liberar o restante do livro.
      </p>
    </div>
  );
}
