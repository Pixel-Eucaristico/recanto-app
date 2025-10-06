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
import { Loader2, Trash2, Edit, Plus } from 'lucide-react';

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
                    {/* Placeholder for other tabs */}
                    <TabsTrigger value="users" disabled>Usuários</TabsTrigger>
                    <TabsTrigger value="events" disabled>Eventos</TabsTrigger>
                </TabsList>
                <TabsContent value="content"><ContentManagerTab /></TabsContent>
            </Tabs>
        </div>
    );
}