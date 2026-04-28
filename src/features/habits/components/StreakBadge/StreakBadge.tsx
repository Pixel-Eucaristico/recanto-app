'use client';

import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  current: number;
  size?: 'xs' | 'sm' | 'md';
}

export function StreakBadge({ current, size = 'sm' }: StreakBadgeProps) {
  if (current <= 0) return null;
  const badgeSize = size === 'xs' ? 'badge-xs' : size === 'md' ? 'badge-md' : 'badge-sm';
  return (
    <span className={`badge badge-warning gap-1 ${badgeSize}`}>
      <Flame className="w-3 h-3" />
      {current} {current === 1 ? 'dia' : 'dias'}
    </span>
  );
}
