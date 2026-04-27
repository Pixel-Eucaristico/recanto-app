'use client';

import Link from 'next/link';
import { HeartHandshake, BookHeart, ListTodo } from 'lucide-react';

interface QuickAccessProps {
  canHabits: boolean;
  canNotebook: boolean;
  canChallenges?: boolean;
}

export function QuickAccess({ canHabits, canNotebook, canChallenges }: QuickAccessProps) {
  const items = [
    canHabits && {
      href: '/app/dashboard/habits',
      label: 'Hábitos',
      description: 'Práticas diárias',
      icon: <HeartHandshake className="w-5 h-5" />,
      color: 'bg-success/10 text-success',
    },
    canNotebook && {
      href: '/app/dashboard/my-notebook',
      label: 'Caderno',
      description: 'Reflexões e notas',
      icon: <BookHeart className="w-5 h-5" />,
      color: 'bg-info/10 text-info',
    },
    canChallenges && {
      href: '/app/dashboard/challenges',
      label: 'Desafios',
      description: 'Suas metas',
      icon: <ListTodo className="w-5 h-5" />,
      color: 'bg-warning/10 text-warning',
    },
  ].filter(Boolean) as { href: string; label: string; description: string; icon: React.ReactNode; color: string }[];

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="font-semibold text-sm sm:text-base mb-2">Atalhos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(it => (
          <Link
            key={it.href}
            href={it.href}
            className="card bg-base-100 border border-base-300 hover:border-primary"
          >
            <div className="card-body p-3 gap-1 items-center text-center">
              <div className={`shrink-0 rounded-lg p-2 ${it.color}`}>{it.icon}</div>
              <p className="font-semibold text-sm mt-1">{it.label}</p>
              <p className="text-[11px] text-base-content/60">{it.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
