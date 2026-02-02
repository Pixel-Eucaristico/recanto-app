'use client'

import React, { useState, useEffect } from 'react';
import { donationService } from '@/services/firebase/DonationService';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { Loader2, DollarSign, TrendingUp, Users, CheckCircle2, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DonationReportPage() {
    const { user } = useAuth();
    const [donations, setDonations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                if (user.role === 'admin') {
                    // Usando o serviço real que busca do Firestore
                    const allDonations = await donationService.list('date', 'desc');
                    setDonations(allDonations);
                }
            } catch (error) {
                console.error("Failed to fetch donation data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const confirmDonation = async (donationId: string) => {
        try {
            await donationService.confirmDonation(donationId);
            setDonations(donations.map(d => 
                d.id === donationId ? { ...d, status: 'confirmado' } : d
            ));
        } catch (error) {
            console.error("Failed to confirm donation:", error);
        }
    };

    const totalValue = donations.reduce((sum, donation) => sum + (Number(donation.value) || 0), 0);
    const confirmedValue = donations
        .filter(d => d.status === 'confirmado')
        .reduce((sum, donation) => sum + (Number(donation.value) || 0), 0);
    const pendingCount = donations.filter(d => d.status === 'pendente').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (user?.role !== 'admin') {
        return (
            <div className="alert alert-warning shadow-lg max-w-lg mx-auto mt-10">
                <AlertTriangle className="w-6 h-6" />
                <span>Acesso restrito a administradores. Você não tem permissão para ver relatórios financeiros.</span>
            </div>
        );
    }

    return (
        <div className="p-2 md:p-6 space-y-8 animate-in fade-in duration-500">
            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-base-content">Relatório de Doações</h1>
                    <p className="text-base-content/60 font-medium">Gestão financeira e acompanhamento de doações em tempo real</p>
                </div>
                <div className="flex gap-2 text-xs font-bold uppercase tracking-widest opacity-40">
                    Última atualização: {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* Resumo em Stats (DaisyUI) */}
            <div className="stats stats-vertical lg:stats-horizontal shadow-xl bg-base-100 w-full border border-base-200">
                <div className="stat">
                    <div className="stat-figure text-success">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-sm font-bold uppercase">Total Arrecadado</div>
                    <div className="stat-value text-success text-2xl lg:text-3xl">R$ {confirmedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div className="stat-desc font-medium">Doações confirmadas no sistema</div>
                </div>
                
                <div className="stat">
                    <div className="stat-figure text-primary">
                        <TrendingUp className="w-8 h-8 opacity-40" />
                    </div>
                    <div className="stat-title text-sm font-bold uppercase">Total Previsto</div>
                    <div className="stat-value text-2xl lg:text-3xl">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div className="stat-desc font-medium">Incluindo pendentes e confirmadas</div>
                </div>

                <div className="stat">
                    <div className="stat-figure text-secondary">
                        <Users className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-sm font-bold uppercase">Doadores Únicos</div>
                    <div className="stat-value text-secondary text-2xl lg:text-3xl">{new Set(donations.map(d => d.donor_email)).size}</div>
                    <div className="stat-desc font-medium">Pessoas que já contribuíram</div>
                </div>

                <div className="stat">
                    <div className="stat-figure text-warning">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-sm font-bold uppercase">Pendências</div>
                    <div className="stat-value text-warning text-2xl lg:text-3xl">{pendingCount}</div>
                    <div className="stat-desc font-medium">Aguardando confirmação manual</div>
                </div>
            </div>

            {/* Tabela de Doações Customizada (DaisyUI) */}
            <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr className="bg-base-200/50 text-base-content/70">
                                    <th className="font-bold py-4">Data</th>
                                    <th className="font-bold">Doador</th>
                                    <th className="font-bold">Valor</th>
                                    <th className="font-bold">Método</th>
                                    <th className="font-bold">Status</th>
                                    <th className="font-bold text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20 opacity-40 font-medium italic">
                                            Nenhuma doação registrada até o momento.
                                        </td>
                                    </tr>
                                ) : (
                                    donations.map(donation => (
                                        <tr key={donation.id} className="hover:bg-base-200/30 transition-colors">
                                            <td className="text-sm font-medium">
                                                {donation.date ? format(new Date(donation.date), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm tracking-tight">{donation.donor_name}</span>
                                                    <span className="text-[11px] opacity-60 font-medium">{donation.donor_email}</span>
                                                </div>
                                            </td>
                                            <td className="font-black text-base-content">
                                                R$ {Number(donation.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                <span className="badge badge-outline badge-sm font-bold uppercase tracking-wider opacity-60">
                                                    {donation.method}
                                                </span>
                                            </td>
                                            <td>
                                                {donation.status === 'confirmado' ? (
                                                    <div className="badge badge-success gap-1.5 font-bold text-[10px] uppercase">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Confirmado
                                                    </div>
                                                ) : (
                                                    <div className="badge badge-warning gap-1.5 font-bold text-[10px] uppercase">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        Pendente
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {donation.status === 'pendente' && (
                                                    <button 
                                                        onClick={() => {
                                                            if (confirm(`Confirmar recebimento de R$ ${donation.value} de ${donation.donor_name}?`)) {
                                                                confirmDonation(donation.id);
                                                            }
                                                        }}
                                                        className="btn btn-primary btn-xs font-bold"
                                                    >
                                                        Confirmar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Dica Informativa */}
            <div className="alert bg-primary/5 border border-primary/20 shadow-sm">
                <div className="flex gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Monitoramento Financeiro</h4>
                        <p className="text-xs opacity-70 leading-relaxed">
                            Este relatório exibe todas as doações capturadas via site. Doações pendentes (como transferências bancárias ou Pix manuais) precisam de confirmação manual do administrador após conferência bancária.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}