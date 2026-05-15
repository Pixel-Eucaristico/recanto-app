'use client';

import { GraduationCap, Library, CheckCircle2, BookOpen } from 'lucide-react';
import type { JourneyData } from '../../hooks/useJourneyData';

interface ActivityHistoryProps {
  data: JourneyData;
}

interface Event {
  kind: 'lesson_completed' | 'book_started' | 'book_finished';
  date: string;
  title: string;
  subtitle?: string;
}

export function ActivityHistory({ data }: ActivityHistoryProps) {
  // Eventos derivados: tracks com lessons completos + livros começados/concluídos
  const events: Event[] = [];

  for (const t of data.tracksInProgress) {
    if (t.completedCount > 0 && t.lastUpdated) {
      events.push({
        kind: 'lesson_completed',
        date: t.lastUpdated,
        title: `${t.completedCount} aulas concluídas`,
        subtitle: t.track.title,
      });
    }
  }

  for (const b of data.books) {
    if (b.percent >= 100 && b.completed_at) {
      events.push({
        kind: 'book_finished',
        date: b.completed_at,
        title: `Concluiu "${b.book_title ?? 'Livro'}"`,
      });
    } else if (b.started_at) {
      events.push({
        kind: 'book_started',
        date: b.started_at,
        title: `Começou "${b.book_title ?? 'Livro'}"`,
        subtitle: `${b.percent}% lido`,
      });
    }
  }

  events.sort((a, b) => b.date.localeCompare(a.date));
  const recent = events.slice(0, 8);

  if (recent.length === 0) return null;

  return (
    <section>
      <h2 className="font-semibold text-sm sm:text-base mb-2">Histórico de atividades</h2>

      <ol className="relative border-l-2 border-base-300 ml-2 pl-4 space-y-3">
        {recent.map((e, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[22px] top-0.5 w-3 h-3 rounded-full bg-base-100 border-2 border-primary" />
            <div className="flex items-start gap-2">
              <EventIcon kind={e.kind} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-base-content">{e.title}</p>
                {e.subtitle && <p className="text-xs text-base-content/60 mt-0.5">{e.subtitle}</p>}
                <p className="text-[10px] text-base-content/40 mt-0.5">
                  {formatDate(e.date)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EventIcon({ kind }: { kind: Event['kind'] }) {
  if (kind === 'lesson_completed') return <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
  if (kind === 'book_finished') return <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />;
  return <BookOpen className="w-4 h-4 text-info shrink-0 mt-0.5" />;
}

function formatDate(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `${days} dias atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
