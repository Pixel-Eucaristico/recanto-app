'use client'

import React, { useState } from 'react';
import { Donation } from '@/entities/Donation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, QrCode, Landmark, Heart } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function DonatePage() {
    const { toast } = useToast();
    const [amount, setAmount] = useState(50);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDonationSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            await Donation.create({
                value: Number(amount),
                method: 'pix', // Defaulting to PIX for this example
                donor_name: name,
                donor_email: email,
                date: new Date().toISOString(),
                status: 'pendente'
            });
            setStep(2);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível registrar sua intenção de doação. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (step === 2) {
        return (
             <div className="max-w-2xl mx-auto">
                <Card className="text-center shadow-lg">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                            <Heart className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">Muito Obrigado!</CardTitle>
                        <CardDescription>Sua intenção de doação foi registrada. Que Deus lhe pague!</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-slate-600">Agora, por favor, conclua sua doação usando a chave PIX abaixo.</p>
                        <div className="p-4 bg-slate-100 rounded-lg">
                            <p className="text-sm text-slate-500">Chave PIX (CNPJ)</p>
                            <p className="text-lg font-mono font-semibold text-slate-800 break-all">12.345.678/0001-99</p>
                        </div>
                        <p className="text-xs text-slate-400">Recanto do Amor Misericordioso</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Apoie a Obra</h1>
                <p className="text-slate-500 mt-1">Sua compaixão e generosidade sustentam nossa missão.</p>
            </header>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Fazer uma Doação</CardTitle>
                    <CardDescription>Preencha os dados abaixo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleDonationSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor da Doação (R$)</Label>
                             <div className="grid grid-cols-3 gap-2 mb-2">
                                {[25, 50, 100].map(val => (
                                    <Button key={val} type="button" variant={amount === val ? "default" : "outline"} onClick={() => setAmount(val)}>R$ {val}</Button>
                                ))}
                            </div>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min="5"
                                placeholder="Outro valor"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="name">Seu Nome</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nome Completo" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Seu E-mail</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
                        </div>
                        <Button type="submit" disabled={isProcessing} className="w-full bg-sky-600 hover:bg-sky-700">
                           {isProcessing ? "Processando..." : "Continuar para Doação"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}