'use client'

import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Zap, TrendingUp, Users, DollarSign, Calendar, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Mock data simulando dados do Omie
const mockOmieData = {
    donors: [
        { id: 1, name: 'João Silva', email: 'joao@email.com', total_donated: 850.00, last_donation: '2024-01-15' },
        { id: 2, name: 'Maria Santos', email: 'maria@email.com', total_donated: 1200.00, last_donation: '2024-01-20' },
        { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', total_donated: 500.00, last_donation: '2024-01-18' }
    ],
    donations: [
        { id: 101, donor: 'João Silva', amount: 200.00, date: '2024-01-25', status: 'confirmado', method: 'PIX' },
        { id: 102, donor: 'Maria Santos', amount: 400.00, date: '2024-01-24', status: 'pendente', method: 'Transferência' },
        { id: 103, donor: 'Pedro Costa', amount: 150.00, date: '2024-01-23', status: 'confirmado', method: 'PIX' }
    ],
    analytics: {
        total_received: 15420.50,
        monthly_average: 2850.00,
        active_donors: 47,
        growth_rate: 12.5
    }
};

export default function OmieIntegrationPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
    const [omieData, setOmieData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                
                // Simular carregamento dos dados do Omie
                setTimeout(() => {
                    setOmieData(mockOmieData);
                    setConnectionStatus('connected'); // Simular conexão bem-sucedida
                    setIsLoading(false);
                }, 2000);
            } catch (error) {
                console.error("Failed to load data:", error);
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleConnect = () => {
        setConnectionStatus('connecting');
        // Simular processo de conexão
        setTimeout(() => {
            setConnectionStatus('connected');
            setOmieData(mockOmieData);
        }, 3000);
    };

    if (isLoading) {
        return <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 text-sky-600 animate-spin" /></div>;
    }

    if (user?.role !== 'admin') {
        return (
            <div className="text-center py-8">
                <p className="text-slate-600">Acesso restrito a administradores.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">Integração Omie ERP</h1>
                <p className="text-slate-500 mt-2">
                    Conecte o Recanto Digital ao sistema Omie para sincronizar dados financeiros e de doadores automaticamente.
                </p>
            </header>

            {/* Status da Conexão */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Status da Integração
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {connectionStatus === 'connected' && <CheckCircle className="w-6 h-6 text-green-500" />}
                            {connectionStatus === 'connecting' && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
                            {connectionStatus === 'disconnected' && <AlertCircle className="w-6 h-6 text-amber-500" />}
                            {connectionStatus === 'error' && <AlertCircle className="w-6 h-6 text-red-500" />}
                            
                            <div>
                                <p className="font-semibold">
                                    {connectionStatus === 'connected' && 'Conectado ao Omie'}
                                    {connectionStatus === 'connecting' && 'Conectando...'}
                                    {connectionStatus === 'disconnected' && 'Desconectado'}
                                    {connectionStatus === 'error' && 'Erro na Conexão'}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {connectionStatus === 'connected' && 'Dados sincronizados com sucesso'}
                                    {connectionStatus === 'connecting' && 'Estabelecendo conexão com a API do Omie...'}
                                    {connectionStatus === 'disconnected' && 'Clique para conectar ao sistema Omie'}
                                    {connectionStatus === 'error' && 'Verifique as credenciais e tente novamente'}
                                </p>
                            </div>
                        </div>
                        
                        {connectionStatus !== 'connected' && connectionStatus !== 'connecting' && (
                            <Button onClick={handleConnect} className="gap-2">
                                <Zap className="w-4 h-4" />
                                Conectar Omie
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Informações da Integração */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    <strong>Funcionalidades da Integração:</strong> Sincronização automática de doações, 
                    dados de benfeitores, relatórios financeiros em tempo real e notificações de novas doações.
                    Esta é uma versão de desenvolvimento para testes.
                </AlertDescription>
            </Alert>

            {/* Dashboard de Dados do Omie */}
            {connectionStatus === 'connected' && omieData && (
                <>
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Total Recebido (Omie)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-green-600">
                                    R$ {omieData.analytics.total_received.toFixed(2)}
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Média Mensal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-blue-600">
                                    R$ {omieData.analytics.monthly_average.toFixed(2)}
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Doadores Ativos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-purple-600">{omieData.analytics.active_donors}</p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Crescimento
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-emerald-600">+{omieData.analytics.growth_rate}%</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Principais Doadores */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Principais Benfeitores (Dados do Omie)</CardTitle>
                            <CardDescription>Informações sincronizadas diretamente do sistema Omie</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {omieData.donors.map(donor => (
                                    <div key={donor.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-slate-800">{donor.name}</p>
                                            <p className="text-sm text-slate-500">{donor.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">R$ {donor.total_donated.toFixed(2)}</p>
                                            <p className="text-sm text-slate-500">Última doação: {donor.last_donation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Doações Recentes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Doações Recentes (Omie)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {omieData.donations.map(donation => (
                                    <div key={donation.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium text-slate-800">{donation.donor}</p>
                                                <p className="text-sm text-slate-500">{donation.date} • {donation.method}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold">R$ {donation.amount.toFixed(2)}</p>
                                            <Badge variant={donation.status === 'confirmado' ? 'default' : 'secondary'}>
                                                {donation.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}