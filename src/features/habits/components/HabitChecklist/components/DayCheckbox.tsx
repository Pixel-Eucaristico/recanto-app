'use client';

import { Check } from 'lucide-react';

interface DayCheckboxProps {
  done: boolean;
  clickable: boolean;
  future: boolean;
  today: boolean;
  busy: boolean;
  onClick: () => void;
  title: string;
}

export function DayCheckbox({ done, clickable, future, today, busy, onClick, title }: DayCheckboxProps) {
  const base = 'w-5 h-5 rounded flex items-center justify-center transition-colors';
  let style: string;
  if (future) {
    style = 'bg-base-200/40 cursor-not-allowed';
  } else if (done) {
    style = clickable
      ? 'bg-success text-success-content cursor-pointer hover:opacity-80'
      : 'bg-success/50 text-success-content cursor-default';
  } else if (clickable) {
    style = `bg-base-200 hover:bg-primary/20 cursor-pointer ${today ? 'ring-1 ring-primary' : ''}`;
  } else {
    style = 'bg-base-200/40 cursor-default';
  }

  return (
    <button
      type="button"
      className={`${base} ${style} mx-auto`}
      disabled={!clickable || busy}
      onClick={onClick}
      title={title}
    >
      {busy ? (
        <span className="loading loading-spinner loading-[10px]" />
      ) : done ? (
        <Check className="w-3 h-3" />
      ) : null}
    </button>
  );
}
