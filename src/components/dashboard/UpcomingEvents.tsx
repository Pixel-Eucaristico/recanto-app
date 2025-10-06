import React, { useState, useEffect } from 'react';
import { Event } from '@/entities/Event';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function UpcomingEvents() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const upcoming = await Event.filter(
                    { start_time: { $gte: new Date().toISOString() } }, 
                    'start_time', 
                    3
                );
                setEvents(upcoming);
            } catch (error) {
                console.error("Failed to fetch upcoming events:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Calendar className="w-5 h-5" />
                    Próximos Compromissos
                </CardTitle>
                <Link to={createPageUrl('Schedule')} className="text-sm text-sky-600 hover:underline flex items-center gap-1">
                    Ver agenda <ArrowRight className="w-4 h-4" />
                </Link>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-sky-600" /></div>
                ) : events.length > 0 ? (
                    <ul className="space-y-4">
                        {events.map(event => (
                            <li key={event.id} className="flex items-start gap-4">
                                <div className="text-center w-16 flex-shrink-0">
                                    <p className="font-bold text-lg text-sky-700">{format(new Date(event.start_time), 'dd')}</p>
                                    <p className="text-sm uppercase text-slate-500">{format(new Date(event.start_time), 'MMM', { locale: ptBR })}</p>
                                </div>
                                <div className="border-l-2 border-slate-200 pl-4">
                                    <p className="font-semibold text-slate-700">{event.title}</p>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(event.start_time), 'HH:mm', { locale: ptBR })}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 py-4">Nenhum compromisso agendado.</p>
                )}
            </CardContent>
        </Card>
    );
}