'use client';

import { useEffect, useState } from 'react';
import { Clock, Unlock } from 'lucide-react';

interface UnlockCountdownProps {
  /** ISO string — momento em que começou a contagem (ex.: video_completed_at) */
  startedAt: string | undefined;
  /** Horas até desbloquear */
  unlockAfterHours: number;
}

function calcRemaining(startedAt: string | undefined, unlockAfterHours: number): number | null {
  if (!startedAt || unlockAfterHours <= 0) return 0;
  const start = new Date(startedAt).getTime();
  const unlock = start + unlockAfterHours * 3600 * 1000;
  const diffMs = unlock - Date.now();
  return diffMs > 0 ? diffMs : 0;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  if (minutes > 0) return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  return `${seconds}s`;
}

export function UnlockCountdown({ startedAt, unlockAfterHours }: UnlockCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(() => calcRemaining(startedAt, unlockAfterHours));

  useEffect(() => {
    if (remaining === null || remaining === 0) return;
    const interval = setInterval(() => {
      setRemaining(calcRemaining(startedAt, unlockAfterHours));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, unlockAfterHours, remaining]);

  if (!startedAt || unlockAfterHours <= 0) return null;
  if (remaining === null || remaining === 0) {
    return (
      <div className="alert alert-success">
        <Unlock className="w-5 h-5" />
        <span>Próxima etapa disponível.</span>
      </div>
    );
  }

  return (
    <div className="alert alert-info">
      <Clock className="w-5 h-5" />
      <div>
        <span className="font-medium">Próxima etapa em {formatRemaining(remaining)}</span>
        <p className="text-xs opacity-80 mt-0.5">Use este tempo para orar e assimilar o conteúdo.</p>
      </div>
    </div>
  );
}
