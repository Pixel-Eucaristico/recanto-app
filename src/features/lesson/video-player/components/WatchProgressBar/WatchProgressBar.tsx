'use client';

interface WatchProgressBarProps {
  watchPercent: number;
  watchSeconds?: number;
  minWatchPercent: number;
  minWatchSeconds?: number;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function WatchProgressBar({ watchPercent, watchSeconds, minWatchPercent, minWatchSeconds }: WatchProgressBarProps) {
  const pct = Math.min(100, Math.max(0, watchPercent));
  const reached =
    pct >= minWatchPercent ||
    (minWatchSeconds && minWatchSeconds > 0 && watchSeconds !== undefined && watchSeconds >= minWatchSeconds);

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
      <div className="relative h-2 bg-base-300 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full transition-all ${reached ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full border-r-2 border-base-content/30"
          style={{ left: `${minWatchPercent}%` }}
        />
      </div>
    </div>
  );
}
