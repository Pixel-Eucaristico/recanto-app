'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CalendarEvent, 
  fetchICSContent, 
  parseICS, 
  filterUpcomingEvents,
  formatEventDate 
} from '@/lib/ics-parser';

interface UseCalendarEventsOptions {
  calendarUrl?: string;
  limit?: number;
  refreshInterval?: number; // em milissegundos
}

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  formattedEvents: FormattedEvent[];
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
}

export interface FormattedEvent {
  title: string;
  date: string;
  location?: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
}

export function useCalendarEvents({
  calendarUrl,
  limit = 10,
  refreshInterval = 5 * 60 * 1000, // 5 minutos
}: UseCalendarEventsOptions = {}): UseCalendarEventsReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!calendarUrl) {
      setError('URL do calendário não fornecida');
      return;
    }

    // console.log('Carregando eventos do calendário:', calendarUrl);
    setLoading(true);
    setError(null);

    try {
      const icsContent = await fetchICSContent(calendarUrl);
      // console.log('Conteúdo ICS recebido:', icsContent.substring(0, 200) + '...');

      const allEvents = parseICS(icsContent);
      console.log('Eventos parseados:', allEvents.length);

      const upcomingEvents = filterUpcomingEvents(allEvents, limit);
      // console.log('Eventos futuros filtrados:', upcomingEvents.length);

      setEvents(upcomingEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

      // Mensagens de erro mais amigáveis
      let friendlyMessage = 'Erro ao carregar eventos do calendário';

      if (errorMessage.includes('proxies falharam')) {
        friendlyMessage = 'Não foi possível conectar ao calendário. Verifique sua conexão com a internet.';
      } else if (errorMessage.includes('CORS')) {
        friendlyMessage = 'Problema de segurança ao acessar o calendário. Tente novamente mais tarde.';
      } else if (errorMessage.includes('404')) {
        friendlyMessage = 'Calendário não encontrado. Verifique a URL do calendário.';
      } else if (errorMessage.includes('403') || errorMessage.includes('401')) {
        friendlyMessage = 'Acesso negado ao calendário. Verifique as permissões.';
      }

      setError(friendlyMessage);
      console.error('Erro ao carregar eventos do calendário:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarUrl, limit]);

  const refreshEvents = useCallback(async () => {
    if (!calendarUrl) return;

    setLoading(true);
    setError(null);

    try {
      const icsContent = await fetchICSContent(calendarUrl);
      const allEvents = parseICS(icsContent);
      const upcomingEvents = filterUpcomingEvents(allEvents, limit);
      setEvents(upcomingEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar eventos do calendário:', err);
    } finally {
      setLoading(false);
    }
  }, [calendarUrl, limit]);

  // Carregar eventos inicialmente
  useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      if (!calendarUrl || !mounted) return;

      setLoading(true);
      setError(null);

      try {
        const icsContent = await fetchICSContent(calendarUrl);
        const allEvents = parseICS(icsContent);
        const upcomingEvents = filterUpcomingEvents(allEvents, limit);

        if (mounted) {
          setEvents(upcomingEvents);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
          setError(errorMessage);
          console.error('Erro ao carregar eventos do calendário:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      mounted = false;
    };
  }, [calendarUrl, limit]);

  // Configurar refresh automático
  useEffect(() => {
    if (refreshInterval > 0 && calendarUrl) {
      const interval = setInterval(async () => {
        try {
          const icsContent = await fetchICSContent(calendarUrl);
          const allEvents = parseICS(icsContent);
          const upcomingEvents = filterUpcomingEvents(allEvents, limit);
          setEvents(upcomingEvents);
        } catch (err) {
          console.error('Erro no refresh automático:', err);
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [calendarUrl, limit, refreshInterval]);

  // Formatar eventos para exibição
  const formattedEvents: FormattedEvent[] = events.map(event => ({
    title: event.title,
    date: formatEventDate(event.startDate, event.allDay),
    location: event.location,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    allDay: event.allDay,
  }));
  // console.log('Eventos formatados:', formattedEvents, events);

  return {
    events,
    formattedEvents,
    loading,
    error,
    refreshEvents,
  };
}
