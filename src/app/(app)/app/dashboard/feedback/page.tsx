'use client'

import React, { useState } from 'react';
import { User } from '@/entities/User';
import { SendEmail } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, Heart, Bug, Lightbulb, Star } from 'lucide-react';

export default function FeedbackPage() {
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('normal');
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        User.me().then(setUser).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const emailBody = `
FEEDBACK DO RECANTO DIGITAL
===========================

Usuário: ${user?.full_name || 'Anônimo'} (${user?.email || 'N/A'})
Papel: ${user?.role || 'N/A'}
Categoria: ${category}
Prioridade: ${priority}

ASSUNTO:
${subject}

MENSAGEM:
${message}

---
Enviado via Recanto Digital em ${new Date().toLocaleString('pt-BR')}
            `;

            await SendEmail({
                to: 'admin@recanto.org.br', // Email do administrador
                subject: `[Recanto Digital] ${category}: ${subject}`,
                body: emailBody,
                from_name: 'Sistema de Feedback'
            });

            toast({
                title: "Feedback enviado!",
                description: "Muito obrigado pela sua contribuição. Sua opinião é valiosa para nós!",
            });

            // Reset form
            setCategory('');
            setSubject('');
            setMessage('');
            setPriority('normal');
            
        } catch (error) {
            toast({
                title: "Erro ao enviar",
                description: "Não foi possível enviar seu feedback. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { value: 'bug', label: 'Problema/Bug', icon: Bug, description: 'Algo não está funcionando como esperado' },
        { value: 'melhoria', label: 'Sugestão de Melhoria', icon: Lightbulb, description: 'Ideias para aprimorar a plataforma' },
        { value: 'elogio', label: 'Elogio/Gratidão', icon: Heart, description: 'Compartilhar algo positivo sobre a experiência' },
        { value: 'novo-recurso', label: 'Novo Recurso', icon: Star, description: 'Proposta de nova funcionalidade' },
        { value: 'geral', label: 'Feedback Geral', icon: MessageCircle, description: 'Comentários gerais sobre a plataforma' }
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Feedback da Comunidade</h1>
                <p className="text-slate-500 mt-2">
                    Sua opinião é fundamental para aprimorarmos o Recanto Digital. 
                    Compartilhe conosco suas experiências, sugestões e ideias.
                </p>
            </header>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-sky-600" />
                        Enviar Feedback
                    </CardTitle>
                    <CardDescription>
                        Ajude-nos a construir uma plataforma ainda melhor para nossa comunidade.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label>Categoria do Feedback</Label>
                            <div className="grid gap-3">
                                {categories.map(cat => (
                                    <div
                                        key={cat.value}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            category === cat.value 
                                                ? 'border-sky-300 bg-sky-50' 
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                        onClick={() => setCategory(cat.value)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <cat.icon className={`w-5 h-5 ${
                                                category === cat.value ? 'text-sky-600' : 'text-slate-500'
                                            }`} />
                                            <div>
                                                <h4 className="font-medium text-slate-800">{cat.label}</h4>
                                                <p className="text-sm text-slate-500">{cat.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Prioridade</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="baixa">Baixa - Pode aguardar</SelectItem>
                                    <SelectItem value="normal">Normal - Próximas atualizações</SelectItem>
                                    <SelectItem value="alta">Alta - Precisa de atenção</SelectItem>
                                    <SelectItem value="urgente">Urgente - Problema crítico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Assunto</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Resuma seu feedback em poucas palavras..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Mensagem Detalhada</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Compartilhe detalhes sobre sua experiência, sugestões ou problemas encontrados..."
                                className="min-h-[120px]"
                                required
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !category}
                            className="w-full bg-sky-600 hover:bg-sky-700"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <Heart className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                        <p className="text-amber-800 font-medium">
                            "Obrigado por dedicar seu tempo para nos ajudar a crescer. 
                            Cada feedback é uma semente de melhoria plantada com amor."
                        </p>
                        <p className="text-sm text-amber-600 mt-2">
                            — Equipe do Recanto Digital
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}