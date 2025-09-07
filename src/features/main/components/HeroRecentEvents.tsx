'use client';

import { motion } from 'framer-motion';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { formatEventDate } from '@/lib/ics-parser';
import { Fragment } from 'react';

export default function HeroRecentEvents() {
  const calendarUrl =
    process.env.NEXT_PUBLIC_ICS_CALENDAR_URL ||
    'https://calendar.google.com/calendar/ical/766f4c16ac04a913ef8759428218e25a32f60fecc3c7333ab108265993de6676%40group.calendar.google.com/public/basic.ics';

  const { formattedEvents, loading, error, refreshEvents } = useCalendarEvents({
    calendarUrl,
    limit: 8,
    refreshInterval: 10 * 60 * 1000,
  });

  const events =
    formattedEvents.length > 0
      ? formattedEvents.map((ev) => ({
          title: ev.title,
          date: formatEventDate(ev.startDate, ev.allDay),
          location: ev.location,
          description: ev.description,
        }))
      : [];

  return (
    <section className="py-16 bg-base-100 text-base-content">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <h2 className="text-3xl md:text-4xl font-bold">Eventos Recentes</h2>

          {/* Loading spinner sempre visível enquanto carregar */}
          {loading && (
            <div className="flex items-center justify-center">
              <div className="loading loading-spinner loading-sm"></div>
              <span className="ml-2 text-sm">Carregando eventos...</span>
            </div>
          )}

          {!loading && calendarUrl && (
            <button
              onClick={refreshEvents}
              className="btn btn-ghost btn-sm"
              title="Atualizar eventos"
            >
              🔄
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-warning mb-6 max-w-2xl mx-auto">
            <span>{error}</span>
          </div>
        )}

        <p className="text-lg mb-10 max-w-xl mx-auto">
          Acompanhe os momentos que marcaram nossa comunidade e venha participar
          conosco dos próximos!
        </p>

        {loading ? (
          // Placeholder enquanto os eventos carregam
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 justify-items-center">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full max-w-sm card bg-base-200 shadow-xl animate-pulse"
              >
                <div className="card-body">
                  <div className="h-6 bg-base-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-base-300 rounded w-1/2 mb-4"></div>
                  <div className="h-24 bg-base-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 justify-items-center">
            {events.map((event, index) => (
              <motion.div
                key={index}
                className="w-full max-w-sm card bg-base-200 shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="card-body">
                  <h3 className="card-title text-xl font-semibold">{event.title}</h3>
                  <p className="text-sm text-base-content/70">
                    {event.date} {event.location && `• ${event.location}`}
                  </p>
                  <p className="mt-2">{event.description}</p>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-primary btn-sm">Saiba mais</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
