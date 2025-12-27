'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Plus } from 'lucide-react';
import { MainPageContent, HeroMission, CommunityFeedback, Project, Evangelization } from '@/types/main-content';

export default function CMSPage() {
    const { toast } = useToast();
    const [content, setContent] = useState<MainPageContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<'hero' | 'feedbacks' | 'projects' | 'evangelization'>('hero');

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/main-content');
            if (!response.ok) throw new Error('Failed to load content');
            const data = await response.json();
            setContent(data);
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao carregar conteúdo.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const saveContent = async () => {
        if (!content) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/main-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            if (!response.ok) throw new Error('Failed to save content');
            toast({ title: "Sucesso!", description: "Conteúdo salvo com sucesso." });
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao salvar conteúdo.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const updateHeroMission = (field: keyof HeroMission, value: string) => {
        if (!content) return;
        setContent({
            ...content,
            heroMission: {
                ...content.heroMission,
                [field]: value
            }
        });
    };

    const addFeedback = () => {
        if (!content) return;
        const newId = Math.max(0, ...content.communityFeedbacks.map(f => f.id)) + 1;
        setContent({
            ...content,
            communityFeedbacks: [...content.communityFeedbacks, {
                id: newId,
                name: '',
                role: '',
                avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
                comment: '',
                date: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            }]
        });
    };

    const updateFeedback = (id: number, field: keyof CommunityFeedback, value: string) => {
        if (!content) return;
        setContent({
            ...content,
            communityFeedbacks: content.communityFeedbacks.map(f =>
                f.id === id ? { ...f, [field]: value } : f
            )
        });
    };

    const deleteFeedback = (id: number) => {
        if (!content) return;
        setContent({
            ...content,
            communityFeedbacks: content.communityFeedbacks.filter(f => f.id !== id)
        });
    };

    const addProject = () => {
        if (!content) return;
        const newId = Math.max(0, ...content.projects.map(p => p.id)) + 1;
        setContent({
            ...content,
            projects: [...content.projects, {
                id: newId,
                title: '',
                description: '',
                image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400',
                category: 'formacao',
                link: ''
            }]
        });
    };

    const updateProject = (id: number, field: keyof Project, value: string) => {
        if (!content) return;
        setContent({
            ...content,
            projects: content.projects.map(p =>
                p.id === id ? { ...p, [field]: value } : p
            )
        });
    };

    const deleteProject = (id: number) => {
        if (!content) return;
        setContent({
            ...content,
            projects: content.projects.filter(p => p.id !== id)
        });
    };

    const addEvangelization = () => {
        if (!content) return;
        const newId = Math.max(0, ...content.evangelization.map(e => e.id)) + 1;
        setContent({
            ...content,
            evangelization: [...content.evangelization, {
                id: newId,
                title: '',
                description: '',
                icon: 'BookOpen',
                audience: ''
            }]
        });
    };

    const updateEvangelization = (id: number, field: keyof Evangelization, value: string) => {
        if (!content) return;
        setContent({
            ...content,
            evangelization: content.evangelization.map(e =>
                e.id === id ? { ...e, [field]: value } : e
            )
        });
    };

    const deleteEvangelization = (id: number) => {
        if (!content) return;
        setContent({
            ...content,
            evangelization: content.evangelization.filter(e => e.id !== id)
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin w-8 h-8 text-sky-600" />
            </div>
        );
    }

    if (!content) {
        return <div className="text-center p-12">Erro ao carregar conteúdo.</div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Gerenciar Site (CMS)</h1>
                    <p className="text-slate-500 mt-2">
                        Edite o conteúdo da página principal do site público
                    </p>
                </div>
                <Button onClick={saveContent} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </header>

            <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as typeof activeSection)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="hero">Seção Principal (Hero)</TabsTrigger>
                    <TabsTrigger value="feedbacks">Feedbacks da Comunidade</TabsTrigger>
                    <TabsTrigger value="projects">Nossos Projetos</TabsTrigger>
                    <TabsTrigger value="evangelization">Nossa Evangelização</TabsTrigger>
                </TabsList>

                <TabsContent value="hero">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Editar Seção Hero (Banner Principal)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Título</label>
                                <Input
                                    value={content.heroMission.title}
                                    onChange={(e) => updateHeroMission('title', e.target.value)}
                                    placeholder="Recanto do Amor Misericordioso"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Descrição</label>
                                <Textarea
                                    value={content.heroMission.description}
                                    onChange={(e) => updateHeroMission('description', e.target.value)}
                                    placeholder="Descrição da comunidade..."
                                    rows={5}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Texto do Botão</label>
                                    <Input
                                        value={content.heroMission.buttonText}
                                        onChange={(e) => updateHeroMission('buttonText', e.target.value)}
                                        placeholder="Participe de um Retiro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Link do Botão</label>
                                    <Input
                                        value={content.heroMission.buttonLink}
                                        onChange={(e) => updateHeroMission('buttonLink', e.target.value)}
                                        placeholder="/sobre"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Imagem de Fundo (URL)</label>
                                <Input
                                    value={content.heroMission.backgroundImage}
                                    onChange={(e) => updateHeroMission('backgroundImage', e.target.value)}
                                    placeholder="/assets/img/hero-recanto.jpg"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Caminho relativo da imagem ou URL completa
                                </p>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="feedbacks">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">O que nossa comunidade fala</h3>
                            <Button onClick={addFeedback} size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Adicionar Feedback
                            </Button>
                        </div>
                        {content.communityFeedbacks.map((feedback) => (
                            <Card key={feedback.id} className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Nome"
                                        value={feedback.name}
                                        onChange={(e) => updateFeedback(feedback.id, 'name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Função/Papel"
                                        value={feedback.role}
                                        onChange={(e) => updateFeedback(feedback.id, 'role', e.target.value)}
                                    />
                                    <Input
                                        placeholder="URL do Avatar"
                                        value={feedback.avatar}
                                        onChange={(e) => updateFeedback(feedback.id, 'avatar', e.target.value)}
                                        className="col-span-2"
                                    />
                                    <Textarea
                                        placeholder="Comentário"
                                        value={feedback.comment}
                                        onChange={(e) => updateFeedback(feedback.id, 'comment', e.target.value)}
                                        className="col-span-2"
                                        rows={3}
                                    />
                                    <Input
                                        placeholder="Data (ex: Mar 2024)"
                                        value={feedback.date}
                                        onChange={(e) => updateFeedback(feedback.id, 'date', e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteFeedback(feedback.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="projects">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Nossos Projetos</h3>
                            <Button onClick={addProject} size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Adicionar Projeto
                            </Button>
                        </div>
                        {content.projects.map((project) => (
                            <Card key={project.id} className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Título"
                                        value={project.title}
                                        onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                                    />
                                    <Select
                                        value={project.category}
                                        onValueChange={(v) => updateProject(project.id, 'category', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="formacao">Formação</SelectItem>
                                            <SelectItem value="evangelizacao">Evangelização</SelectItem>
                                            <SelectItem value="social">Social</SelectItem>
                                            <SelectItem value="retiro">Retiro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Textarea
                                        placeholder="Descrição"
                                        value={project.description}
                                        onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                                        className="col-span-2"
                                        rows={3}
                                    />
                                    <Input
                                        placeholder="URL da Imagem"
                                        value={project.image}
                                        onChange={(e) => updateProject(project.id, 'image', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Link (opcional)"
                                        value={project.link || ''}
                                        onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                                    />
                                    <div className="col-span-2 flex justify-end">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteProject(project.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="evangelization">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Nossa Evangelização</h3>
                            <Button onClick={addEvangelization} size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Adicionar Evangelização
                            </Button>
                        </div>
                        {content.evangelization.map((item) => (
                            <Card key={item.id} className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Título"
                                        value={item.title}
                                        onChange={(e) => updateEvangelization(item.id, 'title', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Ícone (Lucide icon name)"
                                        value={item.icon}
                                        onChange={(e) => updateEvangelization(item.id, 'icon', e.target.value)}
                                    />
                                    <Textarea
                                        placeholder="Descrição"
                                        value={item.description}
                                        onChange={(e) => updateEvangelization(item.id, 'description', e.target.value)}
                                        className="col-span-2"
                                        rows={3}
                                    />
                                    <Input
                                        placeholder="Público-alvo"
                                        value={item.audience}
                                        onChange={(e) => updateEvangelization(item.id, 'audience', e.target.value)}
                                        className="col-span-2"
                                    />
                                    <div className="col-span-2 flex justify-end">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteEvangelization(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
