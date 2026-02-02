'use client';

import React, { useEffect, useState } from 'react';
import { eventService } from '@/services/firebase';
import type { Event } from '@/types/firebase-entities';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const eventTypeLabels = {
  oracao: 'Oração',
  reuniao: 'Reunião',
  formacao: 'Formação',
  celebracao: 'Celebração',
  outro: 'Outro',
};

const eventTypeColors = {
  oracao: 'bg-amber-100 text-amber-800',
  reuniao: 'bg-purple-100 text-purple-800',
  formacao: 'bg-blue-100 text-blue-800',
  celebracao: 'bg-emerald-100 text-emerald-800',
  outro: 'bg-slate-100 text-slate-800',
};

interface EventsSectionProps {
  title?: string;
  subtitle?: string;
  maxEvents?: number;
  ctaText?: string;
  ctaLink?: string;
}

export default function EventsSection({
  title = "",
  subtitle = "",
  maxEvents = 6,
  ctaText = "",
  ctaLink = ""
}: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPublicEvents = async () => {
      try {
        const publicEvents = await eventService.getPublicEvents(maxEvents);
        setEvents(publicEvents);
      } catch (error) {
        console.error('Failed to load public events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicEvents();
  }, [maxEvents]);

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              <MarkdownRenderer content={title} />
            </h2>
          )}
          {subtitle && (
            <div className="text-lg text-slate-600 max-w-2xl mx-auto">
              <MarkdownRenderer content={subtitle} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      eventTypeColors[event.type as keyof typeof eventTypeColors]
                    }`}
                  >
                    {eventTypeLabels[event.type as keyof typeof eventTypeLabels]}
                  </span>
                </div>
                <CardTitle className="text-xl">
                  <MarkdownRenderer content={event.title} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.description && (
                  <div className="text-slate-600 text-sm line-clamp-2">
                    <MarkdownRenderer content={event.description} />
                  </div>
                )}

                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {format(new Date(event.start), "EEEE, dd 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {format(new Date(event.start), 'HH:mm', { locale: ptBR })}
                      {event.end &&
                        ` - ${format(new Date(event.end), 'HH:mm', {
                          locale: ptBR,
                        })}`}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {ctaText && ctaLink && (
          <div className="text-center mt-8">
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold"
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
