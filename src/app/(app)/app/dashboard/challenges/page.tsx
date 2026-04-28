'use client'

import React, { useState, useEffect } from 'react';
import { Desafio } from '@/entities/Desafio';
import { DesafioRegistro } from '@/entities/DesafioRegistro';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Heart, Star, BookOpen, CheckCircle2, MessageCircle, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ChallengesPage() {
    const { user } = useAuth();
    const [desafios, setDesafios] = useState<Desafio[]>([]);
    const [meusPontos, setMeusPontos] = useState(0);
    const [meusRegistros, setMeusRegistros] = useState<DesafioRegistro[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDesafio, setSelectedDesafio] = useState<Desafio | null>(null);
    const [diario, setDiario] = useState('');

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                const allDesafios = await Desafio.list();
                setDesafios(allDesafios);

                const meusRegistrosData = await DesafioRegistro.filter({ recantiano_id: user.id });
                setMeusRegistros(meusRegistrosData);
                
                // Calcular pontos totais
                const pontosTotais = meusRegistrosData.reduce((total, registro) => {
                    const desafio = allDesafios.find(d => d.id === registro.desafio_id);
                    return total + (desafio?.pontos || 0);
                }, 0);
                setMeusPontos(pontosTotais);
                
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    const handleRegistrarDesafio = async () => {
        if (!diario.trim() || !selectedDesafio || !user) return;

        try {
            const novoRegistro = await DesafioRegistro.create({
                recantiano_id: user.id,
                desafio_id: selectedDesafio.id ?? '',
                diario: diario
            });

            setMeusRegistros([...meusRegistros, novoRegistro]);
            setMeusPontos(meusPontos + (selectedDesafio.pontos ?? 0));
            setDiario('');
            setSelectedDesafio(null);
        } catch (error) {
            console.error("Failed to register challenge:", error);
        }
    };

    const jaFizDesafio = (desafioId?: string): boolean => {
        if (!desafioId) return false;
        return meusRegistros.some(r => r.desafio_id === desafioId);
    };

    if (isLoading) {
        return <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 text-info animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-base-content mb-2">Desafios da Compaixão</h1>
                <p className="text-base-content/60">Pequenos gestos, grandes transformações no coração</p>
                
                <Card className="mt-6 bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30 max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center gap-4">
                            <Trophy className="w-8 h-8 text-warning" />
                            <div>
                                <p className="text-2xl font-bold text-warning">{meusPontos}</p>
                                <p className="text-sm text-warning">Pontos de Compaixão</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {desafios.map(desafio => {
                    const concluido = jaFizDesafio(desafio.id);
                    return (
                        <Card key={desafio.id} className={`transition-all duration-300 ${concluido ? 'bg-success/10 border-success/30' : 'hover:shadow-lg'}`}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {concluido ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Heart className="w-5 h-5 text-error" />}
                                        {desafio.title}
                                    </CardTitle>
                                    <Badge variant="outline" className="ml-2">
                                        <Star className="w-3 h-3 mr-1" />
                                        {desafio.pontos ?? 0}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base-content/70 leading-relaxed mb-4">{desafio.description}</p>
                                
                                {concluido ? (
                                    <div className="text-center">
                                        <Badge className="bg-success/20 text-success">
                                            ✓ Desafio Concluído!
                                        </Badge>
                                    </div>
                                ) : (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button 
                                                className="w-full btn-error" 
                                                onClick={() => setSelectedDesafio(desafio)}
                                            >
                                                <Heart className="w-4 h-4 mr-2" />
                                                Aceitar Desafio
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{desafio.title}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <p className="text-base-content/70">{desafio.description}</p>
                                                <div className="bg-info/10 p-4 rounded-lg">
                                                    <p className="text-sm font-medium text-info mb-2">
                                                        💫 Reflexão: Como este desafio tocou seu coração?
                                                    </p>
                                                    <Textarea 
                                                        placeholder="Partilhe sua experiência: o que sentiu? Como foi colocar em prática? O que aprendeu sobre si mesmo e sobre o amor de Deus?"
                                                        value={diario}
                                                        onChange={(e) => setDiario(e.target.value)}
                                                        className="min-h-[100px]"
                                                    />
                                                </div>
                                                <Button 
                                                    onClick={handleRegistrarDesafio} 
                                                    className="w-full btn-error"
                                                    disabled={!diario.trim()}
                                                >
                                                    Completar Desafio (+{desafio.pontos ?? 0} pontos)
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Meu Diário de Desafios */}
            {meusRegistros.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-info" />
                            Meu Diário de Desafios
                        </CardTitle>
                        <CardDescription>Suas reflexões e experiências guardadas com carinho</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {meusRegistros.map(registro => {
                                const desafio = desafios.find(d => d.id === registro.desafio_id);
                                return (
                                    <div key={registro.id} className="border-l-4 border-info/30 pl-4 py-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-base-content">{desafio?.title}</h4>
                                            {registro.created_date && (
                                                <Badge variant="outline" className="text-xs">
                                                    {format(new Date(registro.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-base-content/70 italic leading-relaxed">
                                            "{registro.diario}"
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Motivação */}
            <Card className="bg-gradient-to-br from-info/10 to-primary/10 border-info/30">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <Heart className="w-8 h-8 text-info mx-auto mb-3" />
                        <p className="text-info font-medium italic">
                            "Cada pequeno gesto de amor planta uma semente de esperança no mundo. 
                            Continue crescendo em compaixão!"
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}