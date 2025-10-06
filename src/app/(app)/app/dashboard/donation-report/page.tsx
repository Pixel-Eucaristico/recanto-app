'use client'

import React, { useState, useEffect } from 'react';
import { Donation } from '@/entities/Donation';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, DollarSign, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DonationReportPage() {
    const [donations, setDonations] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                
                if (currentUser.role === 'admin') {
                    const allDonations = await Donation.list('-date');
                    setDonations(allDonations);
                }
            } catch (error) {
                console.error("Failed to fetch donation data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const confirmDonation = async (donationId) => {
        try {
            await Donation.update(donationId, { status: 'confirmado' });
            setDonations(donations.map(d => 
                d.id === donationId ? { ...d, status: 'confirmado' } : d
            ));
        } catch (error) {
            console.error("Failed to confirm donation:", error);
        }
    };

    const totalValue = donations.reduce((sum, donation) => sum + (donation.value || 0), 0);
    const confirmedValue = donations
        .filter(d => d.status === 'confirmado')
        .reduce((sum, donation) => sum + (donation.value || 0), 0);
    const pendingCount = donations.filter(d => d.status === 'pendente').length;

    if (isLoading) {
        return (
            <div className="flex justify-center mt-10">
                <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            </div>
        );
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
                <h1 className="text-3xl font-bold text-slate-800">Relatório de Doações</h1>
                <p className="text-slate-500 mt-2">Gestão e acompanhamento das doações recebidas</p>
            </header>

            {/* Resumo */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Total Arrecadado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">R$ {confirmedValue.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Total Previsto
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-slate-700">R$ {totalValue.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Doadores
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-slate-700">{donations.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Pendentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela de Doações */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Doações</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Doador</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {donations.map(donation => (
                                <TableRow key={donation.id}>
                                    <TableCell>
                                        {format(new Date(donation.date), 'dd/MM/yyyy', { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{donation.donor_name}</p>
                                            <p className="text-sm text-slate-500">{donation.donor_email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        R$ {donation.value?.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {donation.method}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={donation.status === 'confirmado' ? 'default' : 'secondary'}>
                                            {donation.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {donation.status === 'pendente' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        Confirmar
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirmar Doação</AlertDialogTitle>
                                                    </AlertDialogHeader>
                                                    <AlertDialogDescription>
                                                        Confirmar recebimento da doação de R$ {donation.value?.toFixed(2)} 
                                                        de {donation.donor_name}?
                                                    </AlertDialogDescription>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => confirmDonation(donation.id)}>
                                                            Confirmar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}