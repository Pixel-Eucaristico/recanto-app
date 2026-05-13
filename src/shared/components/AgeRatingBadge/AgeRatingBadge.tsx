'use client';

import { Info } from 'lucide-react';
import { AgeRating } from '@/shared/types/content-access';
import { getAgeRatingInfo, AgeRatingColor } from '@/shared/content-access/ageRating';

type BadgeSize = 'sm' | 'md' | 'lg';

interface AgeRatingBadgeProps {
  rating: AgeRating;
  size?: BadgeSize;
  /** Mostra ícone Info + tooltip explicativo. Default false (catálogo do aluno). */
  showTooltip?: boolean;
  className?: string;
}

const BADGE_COLOR_CLASSES: Record<AgeRatingColor, string> = {
  success: 'badge-success text-success-content',
  info: 'badge-info text-info-content',
  warning: 'badge-warning text-warning-content',
  accent: 'badge-accent text-accent-content',
  error: 'badge-error text-error-content',
  neutral: 'badge-neutral text-neutral-content',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'badge-sm',
  md: '',
  lg: 'badge-lg',
};

const ICON_SIZES: Record<BadgeSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function AgeRatingBadge({
  rating,
  size = 'md',
  showTooltip = false,
  className = '',
}: AgeRatingBadgeProps) {
  const info = getAgeRatingInfo(rating);
  const badge = (
    <span
      className={`badge font-semibold ${BADGE_COLOR_CLASSES[info.colorVariant]} ${SIZE_CLASSES[size]} ${className}`}
      aria-label={`Classificação ${info.label}`}
    >
      {info.value}
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <span className="tooltip tooltip-bottom" data-tip={info.tooltip}>
      <span className="inline-flex items-center gap-1">
        {badge}
        <Info size={ICON_SIZES[size]} className="text-base-content/60" />
      </span>
    </span>
  );
}
