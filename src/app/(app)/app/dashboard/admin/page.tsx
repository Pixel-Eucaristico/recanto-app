'use client'

import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Material } from '@/entities/Material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UploadFile } from '@/integrations/Core';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Edit, Plus, Mail, Check, Eye, Archive, MessageSquare } from 'lucide-react';
import { MainPageContent, CommunityFeedback, Project, Evangelization } from '@/types/main-content';
import { FormSubmission, ContactFormData, StoryFormData, AdminEmailConfig } from '@/types/form-submissions';
import { Badge } from '@/components/ui/badge';

const ContentManagerTab = () => {
    const { toast } = useToast();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setIsLoading(true);
        const materialList = await Material.list('-created_date');
        setMaterials(materialList);
        setIsLoading(false);
    };

    const handleDelete = async (materialId) => {
        try {
            await Material.delete(materialId);
            toast({ title: "Sucesso!", description: "Material apagado." });
            fetchMaterials();
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao apagar material.", variant: "destructive" });
        }
    };

    const openEditDialog = (material) => {
        setEditingMaterial(material);
        setIsDialogOpen(true);
    };
    
    const openNewDialog = () => {
        setEditingMaterial(null);
        setIsDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Gerenciar Conteúdo Formativo</CardTitle>
                <Button onClick={openNewDialog} className="gap-2"><Plus className="w-4 h-4"/> Novo Material</Button>
            </CardHeader>
            <CardContent>
                {isLoading ? <Loader2 className="animate-spin" /> : (
                    <Table>
                        <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Categoria</TableHead><TableHead>Tipo</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {materials.map(mat => (
                                <TableRow key={mat.id}>
                                    <TableCell>{mat.title}</TableCell>
                                    <TableCell>{mat.category}</TableCell>
                                    <TableCell>{mat.type}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(mat)}><Edit className="w-4 h-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle></AlertDialogHeader>
                                                <AlertDialogDescription>Tem certeza que deseja apagar o material "{mat.title}"?</AlertDialogDescription>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(mat.id)}>Apagar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            <MaterialFormDialog 
                isOpen={isDialogOpen} 
                setIsOpen={setIsDialogOpen} 
                material={editingMaterial}
                onFinished={fetchMaterials}
            />
        </Card>
    );
};

const MaterialFormDialog = ({ isOpen, setIsOpen, material, onFinished }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formState, setFormState] = useState({});
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (material) {
            setFormState(material);
        } else {
            setFormState({ title: '', description: '', category: '', type: 'text', authorized_roles: ['missionario'] });
        }
    }, [material, isOpen]);
    
    const handleChange = (field, value) => setFormState(prev => ({...prev, [field]: value}));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let payload = {...formState};
            if (file) {
                const result = await UploadFile({ file });
                payload.file_url = result.file_url;
            }
            if (material) { // Update
                await Material.update(material.id, payload);
                toast({ title: "Sucesso!", description: "Material atualizado." });
            } else { // Create
                await Material.create(payload);
                toast({ title: "Sucesso!", description: "Material criado." });
            }
            setIsOpen(false);
            onFinished();
        } catch (error) {
            toast({ title: "Erro", description: "Ocorreu um erro.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{material ? 'Editar' : 'Novo'} Material</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Título" value={formState.title || ''} onChange={e => handleChange('title', e.target.value)} required />
                    <Textarea placeholder="Descrição" value={formState.description || ''} onChange={e => handleChange('description', e.target.value)} />
                    <Input placeholder="Categoria" value={formState.category || ''} onChange={e => handleChange('category', e.target.value)} />
                    <Select onValueChange={v => handleChange('type', v)} value={formState.type || 'text'}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="text">Texto</SelectItem><SelectItem value="pdf">PDF</SelectItem><SelectItem value="video">Vídeo</SelectItem></SelectContent>
                    </Select>
                    <Select onValueChange={v => handleChange('authorized_roles', [v])} value={formState.authorized_roles ? formState.authorized_roles[0] : 'missionario'}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="missionario">Missionário</SelectItem><SelectItem value="recantiano">Recantiano</SelectItem><SelectItem value="all">Todos</SelectItem></SelectContent>
                    </Select>
                    <Input type="file" onChange={e => setFile(e.target.files[0])} />
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const MainPageContentTab = () => {
    const { toast } = useToast();
    const [content, setContent] = useState<MainPageContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<'feedbacks' | 'projects' | 'evangelization'>('feedbacks');

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
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    if (!content) {
        return <div className="text-center p-12">Erro ao carregar conteúdo.</div>;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Gerenciar Conteúdo da Página Principal</CardTitle>
                <Button onClick={saveContent} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </CardHeader>
            <CardContent>
                <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as typeof activeSection)}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="feedbacks">Feedbacks da Comunidade</TabsTrigger>
                        <TabsTrigger value="projects">Nossos Projetos</TabsTrigger>
                        <TabsTrigger value="evangelization">Nossa Evangelização</TabsTrigger>
                    </TabsList>

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
            </CardContent>
        </Card>
    );
};

const FormSubmissionsTab = () => {
    const { toast } = useToast();
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
    const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/forms/submissions');
            if (!response.ok) throw new Error('Failed to load submissions');
            const data = await response.json();
            setSubmissions(data);
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao carregar submissões.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/forms/submissions/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'read' })
            });
            loadSubmissions();
            toast({ title: "Sucesso!", description: "Marcado como lido." });
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao atualizar status.", variant: "destructive" });
        }
    };

    const archiveSubmission = async (id: string) => {
        try {
            await fetch(`/api/forms/submissions/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'archived' })
            });
            loadSubmissions();
            toast({ title: "Sucesso!", description: "Arquivado com sucesso." });
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao arquivar.", variant: "destructive" });
        }
    };

    const filteredSubmissions = submissions.filter(s => {
        if (filter === 'all') return true;
        return s.status === filter;
    });

    const getStatusBadge = (status: FormSubmission['status']) => {
        const styles = {
            new: 'bg-blue-100 text-blue-800',
            read: 'bg-gray-100 text-gray-800',
            replied: 'bg-green-100 text-green-800',
            archived: 'bg-slate-100 text-slate-600'
        };
        const labels = {
            new: 'Novo',
            read: 'Lido',
            replied: 'Respondido',
            archived: 'Arquivado'
        };
        return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Submissões de Formulários</h3>
                <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="new">Novos</SelectItem>
                        <SelectItem value="read">Lidos</SelectItem>
                        <SelectItem value="replied">Respondidos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {filteredSubmissions.length === 0 ? (
                <Card className="p-12 text-center text-gray-500">
                    Nenhuma submissão encontrada
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredSubmissions.map((submission) => {
                        const isContact = submission.type === 'contact';
                        const data = submission.data as (ContactFormData | StoryFormData);

                        return (
                            <Card key={submission.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {isContact ? <Mail className="w-5 h-5 text-blue-600" /> : <MessageSquare className="w-5 h-5 text-purple-600" />}
                                            <h4 className="font-semibold text-lg">{data.name}</h4>
                                            {getStatusBadge(submission.status)}
                                            <Badge variant="outline">{isContact ? 'Contato' : 'História'}</Badge>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600 ml-8">
                                            <p><strong>Email:</strong> {data.email}</p>
                                            {isContact && (data as ContactFormData).subject && (
                                                <p><strong>Assunto:</strong> {(data as ContactFormData).subject}</p>
                                            )}
                                            <p><strong>Recebido em:</strong> {new Date(submission.submitted_at).toLocaleString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedSubmission(submission)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" /> Ver Detalhes
                                        </Button>
                                        {submission.status === 'new' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => markAsRead(submission.id)}
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => archiveSubmission(submission.id)}
                                        >
                                            <Archive className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {selectedSubmission && (
                <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedSubmission.type === 'contact' ? 'Detalhes do Contato' : 'História Compartilhada'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {selectedSubmission.type === 'contact' ? (
                                <>
                                    <div><strong>Nome:</strong> {(selectedSubmission.data as ContactFormData).name}</div>
                                    <div><strong>Email:</strong> {(selectedSubmission.data as ContactFormData).email}</div>
                                    {(selectedSubmission.data as ContactFormData).phone && (
                                        <div><strong>Telefone:</strong> {(selectedSubmission.data as ContactFormData).phone}</div>
                                    )}
                                    <div><strong>Assunto:</strong> {(selectedSubmission.data as ContactFormData).subject}</div>
                                    <div>
                                        <strong>Mensagem:</strong>
                                        <p className="mt-2 p-3 bg-gray-50 rounded">{(selectedSubmission.data as ContactFormData).message}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div><strong>Nome:</strong> {(selectedSubmission.data as StoryFormData).name}</div>
                                    <div><strong>Email:</strong> {(selectedSubmission.data as StoryFormData).email}</div>
                                    {(selectedSubmission.data as StoryFormData).phone && (
                                        <div><strong>Telefone:</strong> {(selectedSubmission.data as StoryFormData).phone}</div>
                                    )}
                                    {(selectedSubmission.data as StoryFormData).age && (
                                        <div><strong>Idade:</strong> {(selectedSubmission.data as StoryFormData).age} anos</div>
                                    )}
                                    {(selectedSubmission.data as StoryFormData).city && (
                                        <div><strong>Cidade:</strong> {(selectedSubmission.data as StoryFormData).city}</div>
                                    )}
                                    <div>
                                        <strong>História:</strong>
                                        <p className="mt-2 p-3 bg-gray-50 rounded whitespace-pre-wrap">{(selectedSubmission.data as StoryFormData).story}</p>
                                    </div>
                                    <div><strong>Consentimento:</strong> {(selectedSubmission.data as StoryFormData).consent ? '✅ Sim' : '❌ Não'}</div>
                                </>
                            )}
                            <div className="text-sm text-gray-500">
                                Recebido em {new Date(selectedSubmission.submitted_at).toLocaleString('pt-BR')}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

const EmailConfigTab = () => {
    const { toast } = useToast();
    const [config, setConfig] = useState<Partial<AdminEmailConfig>>({
        email: '',
        name: '',
        notify_on_contact: true,
        notify_on_story: true,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [gmailStatus, setGmailStatus] = useState<{ connected: boolean; expires_at?: string } | null>(null);

    useEffect(() => {
        loadConfig();
        checkGmailStatus();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await fetch('/api/admin/email-config');
            if (response.ok) {
                const data = await response.json();
                setConfig(data);
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkGmailStatus = async () => {
        try {
            const response = await fetch('/api/gmail/status');
            if (response.ok) {
                const data = await response.json();
                setGmailStatus(data);
            }
        } catch (error) {
            console.error('Failed to check Gmail status:', error);
        }
    };

    const saveConfig = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/email-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (!response.ok) throw new Error('Failed to save');
            toast({ title: "Sucesso!", description: "Configurações salvas." });
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const connectGmail = () => {
        window.location.href = '/api/gmail/auth';
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Configurações de Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email do Administrador</label>
                        <Input
                            type="email"
                            value={config.email || ''}
                            onChange={(e) => setConfig({ ...config, email: e.target.value })}
                            placeholder="admin@recanto.org.br"
                        />
                        <p className="text-sm text-gray-500 mt-1">Email que receberá as notificações</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Nome do Administrador</label>
                        <Input
                            value={config.name || ''}
                            onChange={(e) => setConfig({ ...config, name: e.target.value })}
                            placeholder="Nome completo"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium">Notificações</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="notify_contact"
                                checked={config.notify_on_contact}
                                onChange={(e) => setConfig({ ...config, notify_on_contact: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="notify_contact" className="text-sm">Notificar em novos contatos</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="notify_story"
                                checked={config.notify_on_story}
                                onChange={(e) => setConfig({ ...config, notify_on_story: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="notify_story" className="text-sm">Notificar em novas histórias</label>
                        </div>
                    </div>

                    <Button onClick={saveConfig} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Salvar Configurações
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Conexão Gmail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {gmailStatus?.connected ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                            <Check className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-medium text-green-900">Gmail conectado</p>
                                {gmailStatus.expires_at && (
                                    <p className="text-sm text-green-700">
                                        Expira em: {new Date(gmailStatus.expires_at).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                                Conecte sua conta Gmail para enviar notificações automáticas quando alguém enviar um formulário.
                            </p>
                            <Button onClick={connectGmail} variant="outline">
                                <Mail className="w-4 h-4 mr-2" />
                                Conectar Gmail
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default function AdminPage() {
    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Painel Administrativo</h1>
                <p className="text-slate-500 mt-1">Gestão central da comunidade.</p>
            </header>
            <Tabs defaultValue="content" className="w-full">
                <TabsList>
                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                    <TabsTrigger value="main-page">Página Principal</TabsTrigger>
                    <TabsTrigger value="submissions">Formulários</TabsTrigger>
                    <TabsTrigger value="email">Email & Notificações</TabsTrigger>
                    {/* Placeholder for other tabs */}
                    <TabsTrigger value="users" disabled>Usuários</TabsTrigger>
                    <TabsTrigger value="events" disabled>Eventos</TabsTrigger>
                </TabsList>
                <TabsContent value="content"><ContentManagerTab /></TabsContent>
                <TabsContent value="main-page"><MainPageContentTab /></TabsContent>
                <TabsContent value="submissions"><FormSubmissionsTab /></TabsContent>
                <TabsContent value="email"><EmailConfigTab /></TabsContent>
            </Tabs>
        </div>
    );
}