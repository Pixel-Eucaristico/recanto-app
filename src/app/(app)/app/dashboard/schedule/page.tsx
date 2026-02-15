'use client'

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { eventService } from '@/services/firebase';
import type { Event as EventType } from '@/types/firebase-entities';
import { Button } from '@/components/ui/daisyui/button';
import { Input } from '@/components/ui/daisyui/input';
import { Textarea } from '@/components/ui/daisyui/textarea';
import { Select } from '@/components/ui/daisyui/select';
import { Checkbox } from '@/components/ui/daisyui/checkbox';
import { Radio } from '@/components/ui/daisyui/radio';
import { Fieldset, FieldsetLegend, FieldsetLabel } from '@/components/ui/daisyui/fieldset';
import { Card, CardBody, CardTitle, CardActions } from '@/components/ui/daisyui/card';
import { Modal } from '@/components/ui/daisyui/modal';

import { Loader2, Calendar, Plus, Clock, RefreshCw, CheckCircle2, Globe, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert } from '@/components/ui/daisyui/alert';
import { useToast } from '@/components/ui/use-toast';

const eventIcons = {
    oracao: <Calendar className="w-6 h-6 !text-primary" />,
    reuniao: <Calendar className="w-6 h-6 !text-secondary" />,
    formacao: <Calendar className="w-6 h-6 !text-info" />,
    celebracao: <Calendar className="w-6 h-6 !text-success" />,
    outro: <Calendar className="w-6 h-6 !text-base-content/40" />,
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);

    // Calendar Selection State
    const [showCalendarSelector, setShowCalendarSelector] = useState(false);
    const [availableCalendars, setAvailableCalendars] = useState<Array<{ id: string; summary: string; description?: string; primary?: boolean }>>([]);
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
        setStartTime(format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"));
        setEndTime(event.end ? format(new Date(event.end), "yyyy-MM-dd'T'HH:mm") : '');
        setType(event.type);
        setLocation(event.location || '');
        setIsPublic(event.is_public);
        setOpenDialog(true);
    };

    const openDeleteDialog = (event: EventType) => {
        setEventToDelete({ id: event.id, title: event.title });
        setIsDeleteDialogOpen(true);
    };

    const deleteEvent = async () => {
        if (!eventToDelete) return;

        try {
            await eventService.delete(eventToDelete.id);
            setEvents(events.filter(e => e.id !== eventToDelete.id));
            toast({
                title: "Sucesso!",
                description: `Evento "${eventToDelete.title}" excluído com sucesso.`
            });
            setIsDeleteDialogOpen(false);
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
                        <h1 className="text-3xl font-bold !text-base-content">Agenda Comunitária</h1>
                        <p className="!text-base-content/60 mt-2">Nossos compromissos, orações e eventos em comunidade.</p>
                    </header>
                    <div className="flex gap-2 flex-wrap">
                        {!isCalendarConnected ? (
                            <Button onClick={handleConnectCalendar} variant="outline" size="md" className="gap-2">
                                <Calendar className="w-4 h-4" /> Conectar Google Calendar
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button onClick={handleSync} loading={isSyncing} variant="outline" size="md" className="gap-2">
                                    <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                                    Sincronizar
                                </Button>
                                <Button onClick={handleDisconnect} disabled={isSyncing} variant="ghost" size="md">
                                    Desconectar
                                </Button>
                            </div>
                        )}
                        {user?.role === 'admin' && (
                            <Button onClick={openNewEventDialog} variant="primary" size="md" className="gap-2">
                                <Plus className="w-4 h-4" /> Novo Evento
                            </Button>
                        )}
                    </div>

                    {/* Modal de Criação/Edição */}
                    <Modal
                        isOpen={openDialog}
                        onClose={() => { setOpenDialog(false); resetForm(); }}
                        title={editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}
                        className="max-w-xl"
                    >
                        <form onSubmit={createOrUpdateEvent} className="space-y-4">
                            <Fieldset>
                                <FieldsetLegend>Título do Evento</FieldsetLegend>
                                <Input
                                    placeholder="Ex: Oração Comunitária"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    className="!text-base-content w-full"
                                />
                            </Fieldset>

                            <Fieldset>
                                <FieldsetLegend>Descrição</FieldsetLegend>
                                <Textarea
                                    placeholder="Detalhes do compromisso..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="!text-base-content w-full"
                                />
                            </Fieldset>

                            <Fieldset>
                                <FieldsetLegend>Tipo</FieldsetLegend>
                                <Select
                                    value={type}
                                    onChange={e => setType(e.target.value as EventType['type'])}
                                    className="!text-base-content w-full"
                                >
                                    <option value="oracao" className="bg-base-100 text-base-content">Oração</option>
                                    <option value="reuniao" className="bg-base-100 text-base-content">Reunião</option>
                                    <option value="formacao" className="bg-base-100 text-base-content">Formação</option>
                                    <option value="celebracao" className="bg-base-100 text-base-content">Celebração</option>
                                    <option value="outro" className="bg-base-100 text-base-content">Outro</option>
                                </Select>
                            </Fieldset>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Fieldset>
                                    <FieldsetLegend>Início</FieldsetLegend>
                                    <Input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        required
                                        className="!text-base-content"
                                    />
                                </Fieldset>
                                <Fieldset>
                                    <FieldsetLegend>Término</FieldsetLegend>
                                    <Input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        className="!text-base-content"
                                    />
                                </Fieldset>
                            </div>

                            <Fieldset>
                                <FieldsetLegend>Local</FieldsetLegend>
                                <Input
                                    placeholder="Ex: Capela, Salão, Online..."
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    className="!text-base-content w-full"
                                />
                            </Fieldset>

                            <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg border border-base-300">
                                <Checkbox
                                    id="isPublic"
                                    checked={isPublic}
                                    onChange={e => setIsPublic(e.target.checked)}
                                    variant="primary"
                                    size="md"
                                />
                                <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer !text-base-content">
                                    Tornar público (visível na página inicial)
                                </label>
                            </div>

                            <Button type="submit" loading={isCreating} variant="primary" block>
                                {editingEvent ? 'Atualizar Evento' : 'Criar Evento'}
                            </Button>
                        </form>
                    </Modal>

                    {/* Modal de Seleção de Calendário */}
                    <Modal
                        isOpen={showCalendarSelector}
                        onClose={() => setShowCalendarSelector(false)}
                        title="Escolha ou Crie um Calendário"
                        className="max-w-2xl"
                    >
                        <div className="space-y-4">
                            <p className="text-sm !text-base-content/60">
                                Selecione um dos seus calendários existentes ou crie um novo calendário personalizado
                            </p>
                            {/* Opção: Calendários Existentes */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 font-medium cursor-pointer p-2 hover:bg-base-200 rounded-lg transition-colors !text-base-content">
                                    <Radio
                                        checked={!createNewCalendar}
                                        onChange={() => setCreateNewCalendar(false)}
                                        variant="primary"
                                    />
                                    Usar calendário existente
                                </label>
                                {!createNewCalendar && (
                                    <div className="ml-9 space-y-2">
                                        {isLoadingCalendars ? (
                                            <div className="flex items-center gap-2 p-4 !text-base-content/60">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Carregando seus calendários do Google...</span>
                                            </div>
                                        ) : availableCalendars.length === 0 ? (
                                            <div className="p-4 bg-warning/10 border border-warning/20 rounded-md">
                                                <p className="text-sm !text-warning">
                                                    ⚠️ Nenhum calendário encontrado na sua conta Google.
                                                </p>
                                                <p className="text-xs !text-warning/80 mt-1">
                                                    Selecione a opção abaixo para criar um novo calendário.
                                                </p>
                                            </div>
                                        ) : (
                                            availableCalendars.map(cal => (
                                                <label key={cal.id} className="flex items-center gap-3 p-3 border border-base-300 rounded-md hover:bg-base-200 cursor-pointer transition-colors !text-base-content">
                                                    <Radio
                                                        name="calendar"
                                                        value={cal.id}
                                                        checked={selectedCalendarId === cal.id}
                                                        onChange={e => setSelectedCalendarId(e.target.value)}
                                                        variant="primary"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{cal.summary}</span>
                                                            {cal.primary && (
                                                                <span className="badge badge-info badge-sm">Principal</span>
                                                            )}
                                                        </div>
                                                        {cal.description && (
                                                            <p className="text-sm !text-base-content/50">{cal.description}</p>
                                                        )}
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Divisor */}
                            <div className="divider">ou</div>

                            {/* Opção: Criar Novo Calendário */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 font-medium cursor-pointer p-2 hover:bg-base-200 rounded-lg transition-colors !text-base-content">
                                    <Radio
                                        checked={createNewCalendar}
                                        onChange={() => setCreateNewCalendar(true)}
                                        variant="primary"
                                    />
                                    Criar novo calendário personalizado
                                </label>
                                {createNewCalendar && (
                                    <div className="ml-9">
                                        <Fieldset>
                                            <Input
                                                placeholder="Ex: Recanto do Amor"
                                                value={customCalendarName}
                                                onChange={e => setCustomCalendarName(e.target.value)}
                                                className="!text-base-content"
                                            />
                                            <FieldsetLabel>
                                                Um novo calendário será criado na sua conta Google com este nome
                                            </FieldsetLabel>
                                        </Fieldset>
                                    </div>
                                )}
                            </div>

                            {/* Botão Confirmar */}
                            <Button
                                onClick={handleConfirmCalendarSelection}
                                disabled={isLoadingCalendars || (!createNewCalendar && !selectedCalendarId) || (createNewCalendar && !customCalendarName)}
                                variant="primary"
                                block
                                loading={isConfiguringCalendar}
                            >
                                Confirmar Seleção
                            </Button>
                        </div>
                    </Modal>
                </div>

                {syncMessage && (
                    <Alert
                        variant={
                            syncMessage.includes('✅') ? 'success' :
                            syncMessage.includes('❌') ? 'error' :
                            'info'
                        }
                    >
                        <div className="flex items-center gap-2">
                            {isSyncing && <RefreshCw className="w-4 h-4 animate-spin" />}
                            <span>{syncMessage}</span>
                        </div>
                    </Alert>
                )}

                {isCalendarConnected && (
                    <Alert variant="info">
                        <div className="text-sm">
                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                📌 Como funciona a sincronização:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li><strong>Sincronizar:</strong> Importa eventos do Google e exporta novos eventos locais.</li>
                                <li><strong>Proteção:</strong> Eventos já sincronizados não são duplicados.</li>
                                <li><strong>Automático:</strong> Novos eventos criados aqui são enviados ao Google.</li>
                            </ul>
                        </div>
                    </Alert>
                )}

                {!isCalendarConnected && events.length > 0 && (
                    <Alert variant="warning">
                        <span>
                            ℹ️ Você tem <strong>{events.length} eventos</strong> salvos localmente.
                            Conecte o Google Calendar para sincronizar.
                        </span>
                    </Alert>
                )}
            </div>

            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-base-200/50 rounded-xl border border-dashed border-base-300">
                        <Calendar className="w-16 h-16 !text-base-content/10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold !text-base-content mb-2">
                            Nenhum evento agendado
                        </h3>
                        <p className="!text-base-content/50 max-w-sm mx-auto">
                            {user?.role === 'admin' ? 'Crie o primeiro evento para a comunidade para que todos possam acompanhar.' : 'Aguarde novos eventos serem agendados pela coordenação.'}
                        </p>
                    </div>
                ) : (
                    events.map(event => (
                        <Card key={event.id} variant="bordered" bg="base-100">
                            <CardBody className="gap-2">
                                <div className="flex flex-row items-start gap-4">
                                    <div className="pt-1">{eventIcons[event.type]}</div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-lg leading-tight flex items-center gap-2">
                                                {event.title}
                                                {event.is_public && (
                                                    <Globe className="w-4 h-4 text-success" />
                                                )}
                                                {event.google_calendar_id && (
                                                    <CheckCircle2 className="w-4 h-4 text-info" />
                                                )}
                                            </CardTitle>
                                            {user?.role === 'admin' && (
                                                <div className="flex gap-2 shrink-0">
                                                    <Button
                                                        onClick={() => togglePublic(event.id, event.is_public)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="px-2"
                                                    >
                                                        <Globe className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => openEditEventDialog(event)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="px-2"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="error" 
                                                        size="sm" 
                                                        className="px-2"
                                                        onClick={() => openDeleteDialog(event)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60 mt-1">
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
                                                <span>📍 {event.location}</span>
                                            )}
                                        </div>

                                        {event.description && (
                                            <div className="mt-4 p-4 bg-base-200/30 rounded-lg border border-base-200">
                                                <p className="!text-base-content/80 text-sm italic leading-relaxed">
                                                    {event.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal de Exclusão DaisyUI */}
            <Modal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Confirmar Exclusão"
                className="max-w-md"
            >
                <div className="space-y-4">
                    <p className="!text-base-content/70">
                        Tem certeza que deseja excluir o evento <strong className="!text-base-content">"{eventToDelete?.title}"</strong>? Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="error"
                            onClick={deleteEvent}
                            className="flex-1"
                        >
                            Excluir Evento
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}