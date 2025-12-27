import ICAL from "ical.js";

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  description?: string;
  allDay?: boolean;
}

/**
 * Corrige problemas de encoding em arquivos ICS
 */
function fixEncoding(content: string): string {
  try {
    // Caso já esteja correto, retorna
    if (/[\u00C0-\u017F]/.test(content)) return content;

    // Força conversão de ISO-8859-1 para UTF-8
    return decodeURIComponent(escape(content));
  } catch (err) {
    console.warn('Erro ao corrigir encoding:', err);
    return content;
  }
}

/**
 * Faz o parse de um arquivo ICS usando ical.js e retorna eventos atuais, futuros e recorrentes
 */
export function parseICS(icsContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);

  // Conserta acentuação do ICS
  const fixedContent = latin1ToUtf8(icsContent);

  const jcalData = ICAL.parse(fixedContent);
  const vcalendar = new ICAL.Component(jcalData);
  const vevents = vcalendar.getAllSubcomponents('vevent');

  vevents.forEach((vevent) => {
    const event = new ICAL.Event(vevent);

    if (event.isRecurrenceException()) return;

    const dtstartValue = vevent.getFirstPropertyValue('dtstart');
    if (!dtstartValue || !(dtstartValue instanceof ICAL.Time)) return;

    if (event.isRecurring()) {
      try {
        const iterator = new ICAL.RecurExpansion({
          dtstart: dtstartValue,
          component: vevent
        });

        let next;
        while ((next = iterator.next())) {
          const eventDate = next.toJSDate();
          if (eventDate >= sevenDaysAgo && eventDate <= sixMonthsFromNow) {
            events.push({
              title: fixICSField(event.summary) || 'Sem título',
              startDate: eventDate,
              endDate: event.endDate ? event.endDate.toJSDate() : undefined,
              location: fixICSField(event.location),
              description: fixICSField(event.description),
              allDay: dtstartValue.isDate,
            });
          }
        }
      } catch (err) {
        console.warn('Erro evento recorrente:', event.summary, err);
      }
    } else {
      const startDate = event.startDate.toJSDate();
      if (startDate >= sevenDaysAgo && startDate <= sixMonthsFromNow) {
        events.push({
          title: fixICSField(event.summary) || 'Sem título',
          startDate,
          endDate: event.endDate ? event.endDate.toJSDate() : undefined,
          location: fixICSField(event.location),
          description: fixICSField(event.description),
          allDay: event.startDate.isDate,
        });
      }
    }
  });

  return events;
}

/**
 * Filtra eventos futuros e os ordena por data
 */
export function filterUpcomingEvents(events: CalendarEvent[], limit: number = 10): CalendarEvent[] {
  const now = new Date();
  return events
    .filter(event => event.startDate >= now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, limit);
}

/**
 * Formata uma data para exibição em português
 */
export function formatEventDate(date: Date, allDay?: boolean): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  if (!allDay) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return new Intl.DateTimeFormat('pt-BR', options).format(date);
}

/**
 * Baixa o conteúdo do arquivo ICS da URL fornecida usando proxies CORS
 */
export async function fetchICSContent(url: string): Promise<string> {
  const proxies = [
    {
      name: 'AllOrigins',
      url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      parser: async (response: Response) => {
        const data = await response.json();
        let content = data.contents;
        if (content && content.startsWith('data:')) {
          const base64Match = content.match(/base64,(.+)$/);
          if (base64Match) content = atob(base64Match[1]);
        }
        return content;
      }
    },
    {
      name: 'CodeTabs',
      url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      parser: async (response: Response) => await response.text()
    },
    {
      name: 'CORS Proxy',
      url: `https://corsproxy.io/?${encodeURIComponent(url)}`,
      parser: async (response: Response) => await response.text()
    }
  ];

  for (const proxy of proxies) {
    try {
      console.log(`Tentando proxy ${proxy.name}...`);
      const response = await fetch(proxy.url, { headers: { 'Accept': 'text/calendar, text/plain, */*' } });
      if (!response.ok) throw new Error(`Proxy ${proxy.name} retornou erro: ${response.status}`);
      const content = await proxy.parser(response);
      if (content && content.trim()) {
        console.log(`Proxy ${proxy.name} funcionou!`);
        return content;
      }
    } catch (error) {
      console.log(`Proxy ${proxy.name} falhou:`, error);
    }
  }

  try {
    const response = await fetch(url);
    if (response.ok) {
      const content = await response.text();
      if (content && content.trim()) return content;
    }
  } catch (error) {
    console.log('Requisição direta também falhou:', error);
  }

  throw new Error('Todos os proxies falharam e requisição direta não funcionou');
}

/**
 * Converte um texto de Latin-1 para UTF-8
 */
function latin1ToUtf8(str: string): string {
  return new TextDecoder('utf-8').decode(new TextEncoder().encode(str));
}

/**
 * Conserta acentuação de campos ICS
 */
function fixICSField(text?: string): string | undefined {
  if (!text) return undefined;
  // Remove caracteres estranhos comuns em ICS mal codificado
  return latin1ToUtf8(text);
}