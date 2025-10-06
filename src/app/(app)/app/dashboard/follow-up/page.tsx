'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { userService, acompanhamentoService } from '@/services/firebase';
import type { FirebaseUser, AcompanhamentoRecantiano } from '@/types/firebase-entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, Lock, MessageSquare } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FollowUpPage() {
    const { user } = useAuth();
    const [recantianos, setRecantianos] = useState<FirebaseUser[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<FirebaseUser | null>(null);
    const [registros, setRegistros] = useState<AcompanhamentoRecantiano[]>([]);
    const [newRegistro, setNewRegistro] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [missionary, setMissionary] = useState<FirebaseUser | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                if (user.role === 'missionario') {
                    const allUsers = await userService.list();
                    const myRecantianos = allUsers.filter(u => u.role === 'recantiano' && u.missionario_responsavel_id === user.id);
                    setRecantianos(myRecantianos);
                    if (myRecantianos.length > 0) {
                        handleSelectRecantiano(myRecantianos[0]);
                    }
                } else if (user.role === 'recantiano' || user.role === 'pai') {
                    const targetId = user.role === 'recantiano' ? user.id : user.filho_recantiano_id;
                    const missionaryId = user.missionario_responsavel_id;

                    if (missionaryId) {
                        const missionaryData = await userService.get(missionaryId);
                        setMissionary(missionaryData);
                    }

                    if (targetId) {
                        const fetchedRegistros = await acompanhamentoService.getByRecantiano(targetId);
                        setRegistros(fetchedRegistros);
                    }
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    const handleSelectRecantiano = async (recantiano: FirebaseUser) => {
        setSelectedTarget(recantiano);
        setIsLoadingConversation(true);
        try {
            const fetchedRegistros = await acompanhamentoService.getByRecantiano(recantiano.id);
            setRegistros(fetchedRegistros);
        } catch (error) {
            console.error("Failed to load registros:", error);
            setRegistros([]);
        } finally {
            setIsLoadingConversation(false);
        }
    };

    const handleAddRegistro = async (isPrivate: boolean) => {
        if (!user) return;

        let recantianoId: string | undefined;
        let missionarioId: string | undefined;

        if (user.role === 'missionario') {
            if (!selectedTarget) return;
            recantianoId = selectedTarget.id;
            missionarioId = user.id;
        } else { // Recantiano or Pai
            recantianoId = user.role === 'recantiano' ? user.id : user.filho_recantiano_id;
            missionarioId = user.missionario_responsavel_id;
        }

        if (!newRegistro.trim() || !recantianoId || !missionarioId) return;

        try {
            const newEntry = await acompanhamentoService.create({
                recantiano_id: recantianoId,
                missionario_id: missionarioId,
                date: new Date().toISOString(),
                tipo: 'conversa',
                observacoes: newRegistro,
                progresso: 'intermediario'
            });

            setRegistros([newEntry, ...registros]);
            setNewRegistro('');
        } catch (error) {
            console.error("Failed to create registro:", error);
        }
    };
    
    if (isLoading || !user) {
        return <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 text-sky-600 animate-spin"/></div>
    }

    const renderConversation = () => (
        <Card className="flex-1 flex flex-col">
            <CardHeader>
                <CardTitle>
                    {user.role === 'missionario' && `Acompanhamento de ${selectedTarget?.name || 'Selecione um Recantiano'}`}
                    {user.role === 'recantiano' && `Meu Acompanhamento com ${missionary?.name || 'Missionário'}`}
                    {user.role === 'pai' && `Acompanhamento de seu filho(a) com ${missionary?.name || 'Missionário'}`}
                </CardTitle>
                <CardDescription>
                    Um canal direto e sagrado para partilha e orientação.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col-reverse overflow-y-auto space-y-4 space-y-reverse p-4">
                {isLoadingConversation ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-6 h-6 text-sky-500"/></div> :
                    registros.map(reg => (
                    <div key={reg.id} className={`flex flex-col w-fit max-w-[85%] ${reg.missionario_id === user?.id ? 'self-end items-end' : 'self-start items-start'}`}>
                        <div className={`p-3 rounded-lg ${reg.missionario_id === user?.id ? 'bg-sky-100 text-sky-900 rounded-br-none' : 'bg-slate-100 rounded-bl-none'}`}>
                            <p className="text-sm text-slate-800 whitespace-pre-wrap">{reg.observacoes}</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                            {formatDistanceToNow(new Date(reg.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                    </div>
                ))}
            </CardContent>
            {(user.role !== 'pai' || selectedTarget) && (
                <div className="p-4 border-t">
                    <Textarea placeholder="Escreva uma mensagem ou registro..." value={newRegistro} onChange={e => setNewRegistro(e.target.value)} className="mb-2" />
                    <div className="flex gap-2 justify-end">
                        {user.role !== 'pai' && (
                             <Button size="sm" onClick={() => handleAddRegistro(false)} className="gap-2 bg-sky-600 hover:bg-sky-700"><Send className="w-4 h-4" /> Enviar Mensagem</Button>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );

    return (
        <div className="flex gap-6 h-[calc(100vh-4rem)]">
            {user.role === 'missionario' && (
                <Card className="w-1/3 h-full">
                    <CardHeader><CardTitle>Meus Recantianos</CardTitle></CardHeader>
                    <CardContent>
                        {recantianos.length > 0 ? (
                            <ul className="space-y-1">
                                {recantianos.map(r => (
                                    <li key={r.id}>
                                        <Button variant={selectedTarget?.id === r.id ? "secondary" : "ghost"} className="w-full justify-start text-left h-auto py-2" onClick={() => handleSelectRecantiano(r)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                                    {r.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{r.name}</p>
                                                    <p className="text-xs text-slate-500 font-normal">{r.email}</p>
                                                </div>
                                            </div>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">Nenhum recantiano atribuído a você.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className={user.role === 'missionario' ? "w-2/3 h-full" : "w-full h-full"}>
                {(user.role === 'missionario' && !selectedTarget) ? (
                    <div className="flex flex-col items-center justify-center h-full bg-slate-50 rounded-lg">
                        <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700">Selecione um recantiano</h3>
                        <p className="text-slate-500">Escolha um recantiano na lista para ver a conversa.</p>
                    </div>
                ) : renderConversation()}
            </div>
        </div>
    );
}