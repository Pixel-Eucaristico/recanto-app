'use client';

import { useState } from 'react';
import { GraduationCap, CheckCircle2, BookOpen } from 'lucide-react';
import { Timeline, TimelineItem } from '@/shared/components/Timeline';
import { formatRelative } from '@/shared/utils/datetime';
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

const PAGE_SIZE = 8;

export function ActivityHistory({ data }: ActivityHistoryProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Eventos derivados: tracks com lessons completos + livros começados/concluídos
  const events: Event[] = [];

  for (const t of data.tracksInProgress) {
    if (t.progress.completed > 0 && t.lastUpdated) {
      events.push({
        kind: 'lesson_completed',
        date: t.lastUpdated,
        title: `${t.progress.completed} aulas concluídas`,
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
  const shown = events.slice(0, visible);

  if (events.length === 0) return null;

  return (
    <section>
      <h2 className="font-semibold text-sm sm:text-base mb-2">Histórico de atividades</h2>

      <Timeline>
        {shown.map((e, i) => (
          <TimelineItem
            key={`${e.kind}_${e.date}_${i}`}
            tone={e.kind === 'book_finished' ? 'success' : 'primary'}
            icon={<EventIcon kind={e.kind} />}
          >
            <p className="text-sm text-base-content">{e.title}</p>
            {e.subtitle && <p className="text-xs text-base-content/60 mt-0.5">{e.subtitle}</p>}
            <p className="text-[10px] text-base-content/40 mt-0.5">{formatRelative(e.date)}</p>
          </TimelineItem>
        ))}
      </Timeline>

      {/* Antes cortava em 8 sem dizer que havia mais. */}
      {events.length > shown.length && (
        <button
          type="button"
          className="btn btn-ghost btn-sm w-full mt-2"
          onClick={() => setVisible(v => v + PAGE_SIZE)}
        >
          Ver mais ({events.length - shown.length} restantes)
        </button>
      )}
    </section>
  );
}

function EventIcon({ kind }: { kind: Event['kind'] }) {
  if (kind === 'lesson_completed') return <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
  if (kind === 'book_finished') return <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />;
  return <BookOpen className="w-4 h-4 text-info shrink-0 mt-0.5" />;
}
