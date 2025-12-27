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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Calendar, Plus, Clock, RefreshCw, CheckCircle2, Globe, Edit, Trash2 } from 'lucide-react';
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
    const [editingEvent, setEditingEvent] = useState<EventType | null>(null);

    // Calendar Selection State
    const [showCalendarSelector, setShowCalendarSelector] = useState(false);
    const [availableCalendars, setAvailableCalendars] = useState<Array<{ id: string; summary: string; primary?: boolean }>>([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');
    const [createNewCalendar, setCreateNewCalendar] = useState(false);
    const [customCalendarName, setCustomCalendarName] = useState('');
    const [isConfiguringCalendar, setIsConfiguringCalendar] = useState(false);
    const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);

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
                console.log('📅 Carregando eventos do Firestore...');
                const eventList = await eventService.getUpcomingEvents(50);
                console.log('📅 Eventos carregados:', eventList.length, 'eventos');
                setEvents(eventList);

                // Check if Google Calendar is connected for this user
                if (user) {
                    const response = await fetch('/api/calendar/status');
                    if (response.ok) {
                        const data = await response.json();
                        setIsCalendarConnected(data.connected);

                        // Iniciar sync automático se admin e calendário conectado
                        if (data.connected && user.role === 'admin') {
                            await fetch('/api/calendar/auto-sync', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'start' })
                            });
                        }
                    }
                }

                // Check if we need to show calendar selector
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('step') === 'select_calendar') {
                    await loadAvailableCalendars();
                    setShowCalendarSelector(true);
                }
            } catch (error) {
                console.error("Failed to load schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    const loadAvailableCalendars = async () => {
        setIsLoadingCalendars(true);
        try {
            console.log('📋 [Frontend] Carregando calendários disponíveis...');
            const response = await fetch('/api/calendar/list-calendars');

            console.log('📋 [Frontend] Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('📋 [Frontend] Calendários recebidos:', data.calendars);

                if (!data.calendars || data.calendars.length === 0) {
                    console.warn('⚠️ [Frontend] Nenhum calendário retornado pela API');
                    toast({
                        title: "Aviso",
                        description: "Nenhum calendário encontrado na sua conta Google. Você pode criar um novo.",
                        variant: "default"
                    });
                }

                setAvailableCalendars(data.calendars || []);
            } else {
                const errorData = await response.json();
                console.error('❌ [Frontend] Erro ao carregar calendários:', errorData);
                toast({
                    title: "Erro",
                    description: errorData.error || "Falha ao carregar calendários disponíveis",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('❌ [Frontend] Exceção ao carregar calendários:', error);
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Erro ao carregar calendários",
                variant: "destructive"
            });
        } finally {
            setIsLoadingCalendars(false);
        }
    };

    // Auto-hide sync message after 10 seconds
    useEffect(() => {
        if (syncMessage) {
            const timer = setTimeout(() => {
                setSyncMessage('');
            }, 10000); // 10 segundos

            return () => clearTimeout(timer);
        }
    }, [syncMessage]);

    const createOrUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            console.error('❌ Usuário não autenticado');
            toast({
                title: "Erro",
                description: "Você precisa estar autenticado.",
                variant: "destructive"
            });
            return;
        }

        console.log('👤 Usuário autenticado:', {
            id: user.id,
            name: user.name,
            role: user.role
        });

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
            if (editingEvent) {
                // UPDATE existing event
                console.log('✏️ [Frontend] Atualizando evento:', editingEvent.id);

                const updatedEvent: any = {
                    title,
                    type,
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    is_public: isPublic,
                };

                // Only add optional fields if they have values
                if (description && description.trim()) {
                    updatedEvent.description = description;
                }
                if (location && location.trim()) {
                    updatedEvent.location = location;
                }

                console.log('✏️ [Frontend] Dados da atualização:', updatedEvent);
                console.log('✏️ [Frontend] Google Calendar ID:', editingEvent.google_calendar_id);

                await eventService.update(editingEvent.id, updatedEvent);
                console.log('✅ [Frontend] Evento atualizado no Firestore');

                setEvents(events.map(e =>
                    e.id === editingEvent.id
                        ? { ...e, ...updatedEvent }
                        : e
                ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));

                toast({
                    title: "Sucesso!",
                    description: `Evento "${title}" atualizado com sucesso.`
                });

                // ✅ Trigger sync if calendar connected (também para UPDATE!)
                if (isCalendarConnected && editingEvent.google_calendar_id) {
                    console.log('🔄 [Frontend] Sincronizando atualização com Google Calendar...');
                    setTimeout(() => handleSync(), 500);
                }
            } else {
                // CREATE new event
                const newEvent: any = {
                    title,
                    type,
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    is_public: isPublic,
                    target_audience: ['admin', 'missionario', 'recantiano', 'pai', 'colaborador', 'benfeitor'],
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                };

                // Only add optional fields if they have values
                if (description && description.trim()) {
                    newEvent.description = description;
                }
                if (location && location.trim()) {
                    newEvent.location = location;
                }

                console.log('📝 Criando evento:', newEvent);
                const createdEvent = await eventService.create(newEvent as EventType);
                console.log('✅ Evento criado:', createdEvent);

                if (!createdEvent || !createdEvent.id) {
                    throw new Error('Evento criado mas ID não retornado');
                }

                setEvents([createdEvent, ...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));

                toast({
                    title: "Sucesso!",
                    description: `Evento "${title}" criado com sucesso.`
                });

                // Trigger sync if calendar connected
                if (isCalendarConnected) {
                    setTimeout(() => handleSync(), 500);
                }
            }

            setOpenDialog(false);
            resetForm();
        } catch (error) {
            console.error("Failed to create/update event:", error);
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Falha ao salvar evento. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStartTime('');
        setEndTime('');
        setType('oracao');
        setLocation('');
        setIsPublic(false);
        setEditingEvent(null);
    };

    const openNewEventDialog = () => {
        resetForm();
        setOpenDialog(true);
    };

    const openEditEventDialog = (event: EventType) => {
        setEditingEvent(event);
        setTitle(event.title);
        setDescription(event.description || '');
        setStartTime(new Date(event.start).toISOString().slice(0, 16));
        setEndTime(event.end ? new Date(event.end).toISOString().slice(0, 16) : '');
        setType(event.type);
        setLocation(event.location || '');
        setIsPublic(event.is_public);
        setOpenDialog(true);
    };

    const deleteEvent = async (eventId: string, eventTitle: string) => {
        try {
            await eventService.delete(eventId);
            setEvents(events.filter(e => e.id !== eventId));
            toast({
                title: "Sucesso!",
                description: `Evento "${eventTitle}" excluído com sucesso.`
            });
        } catch (error) {
            console.error("Failed to delete event:", error);
            toast({
                title: "Erro",
                description: "Falha ao excluir evento. Tente novamente.",
                variant: "destructive"
            });
        }
    };

    const handleConnectCalendar = async () => {
        try {
                  // ✅ Renovar token antes de conectar para garantir sessão válida
            const { auth } = await import('@/domains/auth/services/firebaseClient');
            const currentUser = auth.currentUser;

            if (currentUser) {
                const token = await currentUser.getIdToken(true); // Force refresh
                await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
            }

            // Redirecionar para autenticação do Google Calendar
            window.location.href = '/api/calendar/auth';
        } catch (error) {
            console.error('❌ Erro ao renovar token:', error);
            toast({
                title: "Erro",
                description: "Erro ao preparar conexão com Google Calendar",
                variant: "destructive"
            });
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncMessage('🔄 Sincronizando...');

        let importedCount = 0;
        let exportedCount = 0;
        let hasError = false;

        try {
            // ✅ IMPORTANTE: Exportar ANTES de importar para não perder mudanças locais
            console.log('🔄 [handleSync] Iniciando sincronização...');

            // 1. PRIMEIRO: Exportar mudanças locais para o Google Calendar
            setSyncMessage('📤 Exportando eventos para o Google Calendar...');
            const exportResponse = await fetch('/api/calendar/export', { method: 'POST' });
            const exportData = await exportResponse.json();

            console.log('📤 [handleSync] Resposta da exportação:', exportData);

            if (exportResponse.ok) {
                exportedCount = exportData.stats.exported;

                // Log detalhado se nenhum evento foi exportado
                if (exportedCount === 0 && exportData.stats.total > 0) {
                    console.log('⚠️ [handleSync] Nenhum evento exportado:');
                    console.log('   - Total de eventos futuros:', exportData.stats.total);
                    console.log('   - Já sincronizados:', exportData.stats.alreadySynced);
                    console.log('   - Não públicos:', exportData.stats.skippedNonPublic);

                    if (exportData.details?.alreadySynced?.length > 0) {
                        console.log('   - Eventos já sincronizados:', exportData.details.alreadySynced);
                    }
                }
            } else {
                hasError = true;
                setSyncMessage(`❌ Falha na exportação: ${exportData.error}`);
            }

            // 2. DEPOIS: Importar do Google Calendar
            if (!hasError) {
                setSyncMessage('📥 Importando eventos do Google Calendar...');
                const importResponse = await fetch('/api/calendar/sync', { method: 'POST' });
                const importData = await importResponse.json();

                console.log('📥 [handleSync] Resposta da importação:', importData);

                if (importResponse.ok) {
                    importedCount = importData.stats.added;
                } else {
                    hasError = true;
                    setSyncMessage(`❌ Falha na importação: ${importData.error}`);
                }
            }

            // 3. Recarregar eventos da tela
            if (!hasError) {
                const eventList = await eventService.getUpcomingEvents(50);
                setEvents(eventList);

                // Mensagem final
                const messages = [];
                if (importedCount > 0) messages.push(`${importedCount} importados`);
                if (exportedCount > 0) messages.push(`${exportedCount} exportados`);

                if (messages.length > 0) {
                    setSyncMessage(`✅ Sincronização completa! ${messages.join(', ')}`);
                    toast({
                        title: "Sucesso!",
                        description: `Sincronização concluída: ${messages.join(', ')}`
                    });
                } else {
                    setSyncMessage(`✅ Sincronização completa! Tudo está atualizado`);
                    toast({
                        title: "Sucesso!",
                        description: "Calendários já estão sincronizados"
                    });
                }
            }
        } catch (error) {
            setSyncMessage('❌ Erro ao sincronizar com Google Calendar');
            console.error('Sync error:', error);
            toast({
                title: "Erro",
                description: "Erro ao sincronizar calendário",
                variant: "destructive"
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('/api/calendar/disconnect', { method: 'POST' });
            const data = await response.json();

            if (response.ok) {
                setIsCalendarConnected(false);
                setSyncMessage('');
                toast({
                    title: "Sucesso!",
                    description: "Google Calendar desconectado com sucesso"
                });
            } else {
                toast({
                    title: "Erro",
                    description: data.error || "Falha ao desconectar",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Disconnect error:', error);
            toast({
                title: "Erro",
                description: "Erro ao desconectar Google Calendar",
                variant: "destructive"
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleConfirmCalendarSelection = async () => {
        if (!createNewCalendar && !selectedCalendarId) {
            toast({
                title: "Atenção",
                description: "Por favor, selecione um calendário ou crie um novo",
                variant: "destructive"
            });
            return;
        }

        if (createNewCalendar && !customCalendarName.trim()) {
            toast({
                title: "Atenção",
                description: "Por favor, digite o nome do novo calendário",
                variant: "destructive"
            });
            return;
        }

        setIsConfiguringCalendar(true);
        try {
            const response = await fetch('/api/calendar/configure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    calendarId: createNewCalendar ? null : selectedCalendarId,
                    customCalendarName: createNewCalendar ? customCalendarName : null
                })
            });

            const data = await response.json();

            if (response.ok) {
                setIsCalendarConnected(true);
                setShowCalendarSelector(false);

                // Remove step parameter from URL
                window.history.replaceState({}, '', '/app/dashboard/schedule');

                toast({
                    title: "Sucesso!",
                    description: "Calendário configurado com sucesso"
                });

                // Reload events
                const eventList = await eventService.getUpcomingEvents(50);
                setEvents(eventList);
            } else {
                toast({
                    title: "Erro",
                    description: data.error || "Falha ao configurar calendário",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Configure calendar error:', error);
            toast({
                title: "Erro",
                description: "Erro ao configurar calendário",
                variant: "destructive"
            });
        } finally {
            setIsConfiguringCalendar(false);
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
                    <div className="flex gap-2 flex-wrap">
                        {/* Google Calendar - Todos os usuários podem conectar */}
                        {!isCalendarConnected ? (
                            <Button onClick={handleConnectCalendar} variant="outline" className="gap-2">
                                <Calendar className="w-4 h-4" /> Conectar Google Calendar
                            </Button>
                        ) : (
                            <>
                                <Button onClick={handleSync} disabled={isSyncing} variant="outline" size="sm" className="gap-1">
                                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                    Sincronizar
                                </Button>
                                <Button onClick={handleDisconnect} disabled={isSyncing} variant="ghost" size="sm" className="gap-1">
                                    Desconectar
                                </Button>
                            </>
                        )}
                        {/* Criar evento - Só admin */}
                        {user?.role === 'admin' && (
                            <Button onClick={openNewEventDialog} className="gap-2">
                                <Plus className="w-4 h-4" /> Novo Evento
                            </Button>
                        )}
                    </div>

                    {/* Dialog de Criação/Edição - Só admin pode abrir */}
                    <Dialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) resetForm(); }}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={createOrUpdateEvent} className="space-y-4">
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
                                    {isCreating ? (editingEvent ? 'Atualizando...' : 'Criando...') : (editingEvent ? 'Atualizar Evento' : 'Criar Evento')}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog de Seleção de Calendário */}
                    <Dialog open={showCalendarSelector} onOpenChange={setShowCalendarSelector}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Escolha ou Crie um Calendário</DialogTitle>
                                <p className="text-sm text-slate-500 mt-2">
                                    Selecione um dos seus calendários existentes ou crie um novo calendário personalizado
                                </p>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                {/* Opção: Calendários Existentes */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-medium">
                                        <input
                                            type="radio"
                                            checked={!createNewCalendar}
                                            onChange={() => setCreateNewCalendar(false)}
                                            className="w-4 h-4"
                                        />
                                        Usar calendário existente
                                    </label>
                                    {!createNewCalendar && (
                                        <div className="ml-6 space-y-2">
                                            {isLoadingCalendars ? (
                                                <div className="flex items-center gap-2 p-4 text-slate-500">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Carregando seus calendários do Google...</span>
                                                </div>
                                            ) : availableCalendars.length === 0 ? (
                                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                                                    <p className="text-sm text-amber-800">
                                                        ⚠️ Nenhum calendário encontrado na sua conta Google.
                                                    </p>
                                                    <p className="text-xs text-amber-600 mt-1">
                                                        Selecione a opção abaixo para criar um novo calendário.
                                                    </p>
                                                </div>
                                            ) : (
                                                availableCalendars.map(cal => (
                                                    <label key={cal.id} className="flex items-center gap-2 p-3 border rounded-md hover:bg-slate-50 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="calendar"
                                                            value={cal.id}
                                                            checked={selectedCalendarId === cal.id}
                                                            onChange={e => setSelectedCalendarId(e.target.value)}
                                                            className="w-4 h-4"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{cal.summary}</span>
                                                                {cal.primary && (
                                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Principal</span>
                                                                )}
                                                            </div>
                                                            {cal.description && (
                                                                <p className="text-sm text-slate-500">{cal.description}</p>
                                                            )}
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Divisor */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-slate-500">ou</span>
                                    </div>
                                </div>

                                {/* Opção: Criar Novo Calendário */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-medium">
                                        <input
                                            type="radio"
                                            checked={createNewCalendar}
                                            onChange={() => setCreateNewCalendar(true)}
                                            className="w-4 h-4"
                                        />
                                        Criar novo calendário personalizado
                                    </label>
                                    {createNewCalendar && (
                                        <div className="ml-6">
                                            <Input
                                                placeholder="Digite o nome do novo calendário (ex: Recanto do Amor)"
                                                value={customCalendarName}
                                                onChange={e => setCustomCalendarName(e.target.value)}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                Um novo calendário será criado na sua conta Google com este nome
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Botão Confirmar */}
                                <Button
                                    onClick={handleConfirmCalendarSelection}
                                    disabled={isConfiguringCalendar || (!createNewCalendar && !selectedCalendarId) || (createNewCalendar && !customCalendarName.trim())}
                                    className="w-full gap-2"
                                >
                                    {isConfiguringCalendar && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isConfiguringCalendar ? 'Configurando...' : 'Confirmar Seleção'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {syncMessage && (
                    <Alert className={`${
                        syncMessage.includes('✅') ? 'bg-green-50 border-green-200' :
                        syncMessage.includes('❌') ? 'bg-red-50 border-red-200' :
                        'bg-blue-50 border-blue-200'
                    }`}>
                        <AlertDescription className={`${
                            syncMessage.includes('✅') ? 'text-green-800' :
                            syncMessage.includes('❌') ? 'text-red-800' :
                            'text-blue-800'
                        } flex items-center gap-2`}>
                            {isSyncing && <RefreshCw className="w-4 h-4 animate-spin" />}
                            {syncMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {isCalendarConnected && (
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-sm text-blue-800">
                            <strong>📌 Como funciona a sincronização:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Sincronizar:</strong> Importa eventos do Google e exporta eventos locais em uma única operação</li>
                                <li><strong>Proteção contra duplicatas:</strong> Eventos já sincronizados não são duplicados</li>
                                <li><strong>Automático:</strong> Novos eventos criados aqui são enviados automaticamente ao Google</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {!isCalendarConnected && events.length > 0 && (
                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertDescription className="text-sm text-amber-800">
                            ℹ️ Você tem <strong>{events.length} eventos</strong> salvos localmente.
                            Conecte o Google Calendar para sincronizar com sua agenda externa.
                        </AlertDescription>
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
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => togglePublic(event.id, event.is_public)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    {event.is_public ? 'Privado' : 'Público'}
                                                </Button>
                                                <Button
                                                    onClick={() => openEditEventDialog(event)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm" className="gap-1">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                        </AlertDialogHeader>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja excluir o evento "{event.title}"? Esta ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteEvent(event.id, event.title)}>
                                                                Excluir
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
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