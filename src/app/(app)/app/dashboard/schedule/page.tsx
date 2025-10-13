'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { eventService } from '@/services/firebase';
import type { Event as EventType } from '@/types/firebase-entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Calendar, Plus, Clock, RefreshCw, CheckCircle2, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

const eventIcons = {
    oracao: <Calendar className="w-6 h-6 text-amber-500" />,
    reuniao: <Calendar className="w-6 h-6 text-purple-500" />,
    formacao: <Calendar className="w-6 h-6 text-blue-500" />,
    celebracao: <Calendar className="w-6 h-6 text-emerald-500" />,
    outro: <Calendar className="w-6 h-6 text-slate-500" />,
};

export default function SchedulePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState<EventType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);

    // New Event State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState<EventType['type']>('oracao');
    const [location, setLocation] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const eventList = await eventService.getUpcomingEvents(50);
                setEvents(eventList);

                // Check if Google Calendar is connected (admin only)
                if (user?.role === 'admin') {
                    const response = await fetch('/api/calendar/status');
                    if (response.ok) {
                        const data = await response.json();
                        setIsCalendarConnected(data.connected);
                    }
                }
            } catch (error) {
                console.error("Failed to load schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    const createEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: "Erro",
                description: "Você precisa estar autenticado.",
                variant: "destructive"
            });
            return;
        }

        // Validação de datas
        if (!startTime) {
            toast({
                title: "Erro",
                description: "Por favor, preencha a data de início.",
                variant: "destructive"
            });
            return;
        }

        const startDate = new Date(startTime);
        const endDate = endTime ? new Date(endTime) : startDate;

        if (endDate < startDate) {
            toast({
                title: "Erro",
                description: "A data de término não pode ser anterior à data de início.",
                variant: "destructive"
            });
            return;
        }

        setIsCreating(true);
        try {
            const newEvent: Partial<EventType> = {
                title,
                description: description || undefined,
                type,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                location: location || undefined,
                is_public: isPublic,
                target_audience: ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor'],
                created_by: user.id,
                created_at: new Date().toISOString(),
            };

            const createdEvent = await eventService.create(newEvent as EventType);

            if (!createdEvent || !createdEvent.id) {
                throw new Error('Evento criado mas ID não retornado');
            }

            setEvents([createdEvent, ...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));
            setOpenDialog(false);

            toast({
                title: "Sucesso!",
                description: `Evento "${title}" criado com sucesso.`
            });

            // Reset form
            setTitle('');
            setDescription('');
            setStartTime('');
            setEndTime('');
            setType('oracao');
            setLocation('');
            setIsPublic(false);

            // Trigger sync if calendar connected
            if (isCalendarConnected) {
                setTimeout(() => handleSync(), 500);
            }
        } catch (error) {
            console.error("Failed to create event:", error);
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Falha ao criar evento. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleConnectCalendar = () => {
        window.location.href = '/api/calendar/auth';
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncMessage('');
        try {
            const response = await fetch('/api/calendar/sync', { method: 'POST' });
            const data = await response.json();

            if (response.ok) {
                setSyncMessage(`✅ Sincronização concluída! ${data.stats.added} adicionados, ${data.stats.updated} atualizados`);
                // Reload events
                const eventList = await eventService.getUpcomingEvents(50);
                setEvents(eventList);
            } else {
                setSyncMessage(`❌ Falha na sincronização: ${data.error}`);
            }
        } catch (error) {
            setSyncMessage('❌ Erro ao sincronizar com Google Calendar');
            console.error('Sync error:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const togglePublic = async (eventId: string, currentValue: boolean) => {
        try {
            await eventService.setPublic(eventId, !currentValue);
            setEvents(events.map(e => e.id === eventId ? { ...e, is_public: !currentValue } : e));
        } catch (error) {
            console.error('Failed to toggle public status:', error);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 text-sky-600 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <header>
                        <h1 className="text-3xl font-bold text-slate-800">Agenda Comunitária</h1>
                        <p className="text-slate-500 mt-2">Nossos compromissos, orações e eventos em comunidade.</p>
                    </header>
                    {user?.role === 'admin' && (
                        <div className="flex gap-2">
                            {!isCalendarConnected ? (
                                <Button onClick={handleConnectCalendar} variant="outline" className="gap-2">
                                    <Calendar className="w-4 h-4" /> Conectar Google Calendar
                                </Button>
                            ) : (
                                <Button onClick={handleSync} disabled={isSyncing} variant="outline" className="gap-2">
                                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                                </Button>
                            )}
                            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Evento</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Criar Novo Evento</DialogTitle></DialogHeader>
                                    <form onSubmit={createEvent} className="space-y-4">
                                        <Input placeholder="Título do Evento" value={title} onChange={e => setTitle(e.target.value)} required />
                                        <Textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
                                        <div>
                                            <label className="text-sm font-medium">Tipo</label>
                                            <select value={type} onChange={e => setType(e.target.value as EventType['type'])} className="w-full px-3 py-2 border rounded-md">
                                                <option value="oracao">Oração</option>
                                                <option value="reuniao">Reunião</option>
                                                <option value="formacao">Formação</option>
                                                <option value="celebracao">Celebração</option>
                                                <option value="outro">Outro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Início</label>
                                            <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Término</label>
                                            <Input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
                                        </div>
                                        <Input placeholder="Local (opcional)" value={location} onChange={e => setLocation(e.target.value)} />
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="isPublic"
                                                checked={isPublic}
                                                onChange={e => setIsPublic(e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="isPublic" className="text-sm font-medium">
                                                Tornar público (visível na página inicial)
                                            </label>
                                        </div>
                                        <Button type="submit" disabled={isCreating} className="gap-2">
                                            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {isCreating ? 'Criando...' : 'Criar Evento'}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>

                {syncMessage && (
                    <Alert>
                        <AlertDescription>{syncMessage}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                            Nenhum evento agendado
                        </h3>
                        <p className="text-slate-500">
                            {user?.role === 'admin' ? 'Crie o primeiro evento para a comunidade.' : 'Aguarde novos eventos serem agendados.'}
                        </p>
                    </div>
                ) : (
                    events.map(event => (
                        <Card key={event.id}>
                            <CardHeader className="flex flex-row items-start gap-4">
                                <div className="pt-1">{eventIcons[event.type]}</div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            {event.title}
                                            {event.is_public && (
                                                <Globe className="w-4 h-4 text-green-600" title="Público" />
                                            )}
                                            {event.google_calendar_id && (
                                                <CheckCircle2 className="w-4 h-4 text-blue-600" title="Sincronizado com Google Calendar" />
                                            )}
                                        </CardTitle>
                                        {user?.role === 'admin' && (
                                            <Button
                                                onClick={() => togglePublic(event.id, event.is_public)}
                                                variant="ghost"
                                                size="sm"
                                                className="gap-1"
                                            >
                                                <Globe className="w-4 h-4" />
                                                {event.is_public ? 'Tornar Privado' : 'Tornar Público'}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(event.start), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {format(new Date(event.start), 'HH:mm', { locale: ptBR })}
                                            {event.end && ` - ${format(new Date(event.end), 'HH:mm', { locale: ptBR })}`}
                                        </span>
                                        {event.location && (
                                            <span className="text-slate-500">📍 {event.location}</span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            {event.description && (
                                <CardContent>
                                    <p className="text-slate-600">{event.description}</p>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}