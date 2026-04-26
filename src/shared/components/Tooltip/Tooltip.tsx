'use client';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  tip: string;
  position?: TooltipPosition;
  children: React.ReactNode;
  className?: string;
}

const positionClass: Record<TooltipPosition, string> = {
  top: 'tooltip-top',
  bottom: 'tooltip-bottom',
  left: 'tooltip-left',
  right: 'tooltip-right',
};

/**
 * Wrapper DaisyUI tooltip reutilizável.
 * Envolve qualquer elemento filho com data-tip + classe tooltip.
 */
export function Tooltip({ tip, position = 'top', children, className = '' }: TooltipProps) {
  return (
    <div
      className={`tooltip ${positionClass[position]} ${className}`}
      data-tip={tip}
    >
      {children}
    </div>
  );
}
