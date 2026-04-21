'use client';

interface WatchProgressBarProps {
  watchPercent: number;
  minWatchPercent: number;
}

export function WatchProgressBar({ watchPercent, minWatchPercent }: WatchProgressBarProps) {
  const pct = Math.min(100, Math.max(0, watchPercent));
  const reached = pct >= minWatchPercent;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-base-content/60">
        <span>Assistido</span>
        <span className={reached ? 'text-success font-medium' : ''}>
          {pct.toFixed(1)}% / mín. {minWatchPercent}%
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
