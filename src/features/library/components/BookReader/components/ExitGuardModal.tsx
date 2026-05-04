'use client';

import { Bookmark } from 'lucide-react';

interface ExitGuardModalProps {
  readPercent: number;
  /** Capítulo onde usuário parou. */
  chapterTitle?: string;
  chapterOrder?: number;
  /** Ref canônica do parágrafo atual (ex: 1:7). */
  currentRef?: string | null;
  /** Quando foi o último bookmark manual (ISO). Se ausente, nunca marcou. */
  lastBookmarkAt?: string | null;
  onClose: () => void;
  onExit: () => void;
  onSaveAndExit: () => Promise<void>;
}

function formatRelative(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months === 1) return 'há 1 mês';
  return `há ${months} meses`;
}

export function ExitGuardModal({
  readPercent, chapterTitle, chapterOrder, currentRef, lastBookmarkAt,
  onClose, onExit, onSaveAndExit,
}: ExitGuardModalProps) {
  const stale = lastBookmarkAt
    ? `Última marcação ${formatRelative(lastBookmarkAt)}.`
    : 'Você ainda não marcou nenhuma posição.';

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-warning" /> Marcar onde parou?
        </h3>
        <p className="py-2 text-sm text-base-content/70">
          {stale} Você está em {readPercent}% do livro.
        </p>
        {(chapterTitle || currentRef) && (
          <div className="bg-base-200 rounded-lg p-3 my-2 text-sm">
            <p className="font-semibold text-base-content/80">Posição atual:</p>
            {chapterTitle && (
              <p className="text-base-content/70">
                {chapterOrder ? `Cap. ${chapterOrder}: ` : ''}{chapterTitle}
              </p>
            )}
            {currentRef && (
              <p className="text-base-content/60 text-xs mt-1">Parágrafo {currentRef}</p>
            )}
          </div>
        )}
        <p className="text-xs text-base-content/60 pb-1">
          Salvar marca onde você está agora, para continuar daqui depois.
        </p>
        <div className="modal-action gap-2 flex-wrap">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Continuar lendo
          </button>
          <button type="button" className="btn btn-ghost btn-sm text-error" onClick={onExit}>
            Sair sem salvar
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1"
            onClick={onSaveAndExit}
          >
            <Bookmark className="w-3.5 h-3.5" /> Salvar e sair
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
