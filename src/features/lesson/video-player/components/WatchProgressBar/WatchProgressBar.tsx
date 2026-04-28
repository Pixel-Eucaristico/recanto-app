'use client';

interface WatchProgressBarProps {
  watchPercent: number;
  watchSeconds?: number;
  minWatchPercent: number;
  minWatchSeconds?: number;
  /** Posição atual no vídeo (em segundos) — exibida como marker amarelo sobreposto. */
  lastPositionSeconds?: number;
  /** Duração total do vídeo, pra calcular % da posição atual. */
  durationSeconds?: number;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function WatchProgressBar({
  watchPercent,
  watchSeconds,
  minWatchPercent,
  minWatchSeconds,
  lastPositionSeconds,
  durationSeconds,
}: WatchProgressBarProps) {
  const pct = Math.min(100, Math.max(0, watchPercent));
  const reached =
    pct >= minWatchPercent ||
    (minWatchSeconds && minWatchSeconds > 0 && watchSeconds !== undefined && watchSeconds >= minWatchSeconds);

  const positionPct = durationSeconds && durationSeconds > 0 && lastPositionSeconds !== undefined
    ? Math.min(100, Math.max(0, (lastPositionSeconds / durationSeconds) * 100))
    : null;

  const showRewatch = reached && positionPct !== null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-base-content/60">
        <span>
          Assistido {watchSeconds !== undefined ? formatTime(watchSeconds) : ''} ({pct.toFixed(1)}%)
        </span>
        <span className={reached ? 'text-success font-medium' : ''}>
          Mín. {minWatchPercent}%{minWatchSeconds && minWatchSeconds > 0 ? ` ou ${formatTime(minWatchSeconds)}` : ''}
        </span>
      </div>

      {/* Barra única — base concluído (success), revisita atual (warning) sobreposta, marker (primary) */}
      <div className="relative h-2 bg-base-300 rounded-full overflow-hidden">
        {/* Camada 1: assistido (success quando concluído, primary durante o progresso) */}
        <div
          className={`absolute left-0 top-0 h-full ${reached ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />

        {/* Camada 2: marker do mínimo (vertical) */}
        <div
          className="absolute top-0 h-full border-r-2 border-base-content/30 pointer-events-none"
          style={{ left: `${minWatchPercent}%` }}
        />

        {/* Camada 3: barra de revisita atual (warning) sobreposta */}
        {showRewatch && (
          <>
            <div
              className="absolute left-0 top-0 h-full bg-warning pointer-events-none"
              style={{ width: `${positionPct}%` }}
              title={`Posição atual: ${lastPositionSeconds !== undefined ? formatTime(lastPositionSeconds) : ''} (${positionPct.toFixed(1)}%)`}
            />
            {/* Linha vertical (primary) marca o ponto exato */}
            <div
              className="absolute top-0 h-full w-0.5 bg-primary pointer-events-none"
              style={{ left: `calc(${positionPct}% - 1px)` }}
            />
          </>
        )}
      </div>

      {showRewatch && (
        <p className="text-[10px] text-warning">
          Revisita em andamento — barra amarela mostra posição atual; conclusão preservada.
        </p>
      )}
    </div>
  );
}
