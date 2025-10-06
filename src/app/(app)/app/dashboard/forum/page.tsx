'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { forumTopicService, forumPostService } from '@/services/firebase';
import type { ForumTopic as ForumTopicType, ForumPost as ForumPostType } from '@/types/firebase-entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, Plus, Heart, Clock, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ForumPage() {
    const { user } = useAuth(); // Pega usuário autenticado do contexto
    const [topics, setTopics] = useState<ForumTopicType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicContent, setNewTopicContent] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<ForumTopicType | null>(null);
    const [posts, setPosts] = useState<ForumPostType[]>([]);
    const [newPost, setNewPost] = useState('');
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Buscar todos os tópicos ordenados por data
                const allTopics = await forumTopicService.list('created_at', 'desc');
                setTopics(allTopics);
            } catch (error) {
                console.error("Failed to load forum data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const createTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicTitle.trim() || !newTopicContent.trim() || !user) return;

        setIsCreating(true);
        try {
            const newTopic = await forumTopicService.create({
                title: newTopicTitle,
                description: newTopicContent,
                created_by: user.id,
                created_by_name: user.name,
                is_pinned: false,
                is_locked: false
            });
            setTopics([newTopic, ...topics]);
            setNewTopicTitle('');
            setNewTopicContent('');
            setOpenDialog(false);
        } catch (error) {
            console.error("Failed to create topic:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const openTopic = async (topic: ForumTopicType) => {
        setSelectedTopic(topic);
        setIsLoadingPosts(true);
        try {
            const topicPosts = await forumPostService.getPostsByTopic(topic.id);
            setPosts(topicPosts);
        } catch (error) {
            console.error("Failed to load posts for topic:", error);
            setPosts([]);
        } finally {
            setIsLoadingPosts(false);
        }
    };

    const addPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim() || !selectedTopic || !user) return;

        try {
            const post = await forumPostService.create({
                topic_id: selectedTopic.id,
                content: newPost,
                created_by: user.id,
                created_by_name: user.name,
                is_approved: true // Auto-approve for now, can be changed later
            });
            setPosts([...posts, post]);
            setNewPost('');
        } catch (error) {
            console.error("Failed to add post:", error);
        }
    };

    const deleteTopic = async (topicId: string) => {
        try {
            await forumTopicService.delete(topicId);
            setTopics(prevTopics => prevTopics.filter(t => t.id !== topicId));
            if (selectedTopic?.id === topicId) {
                setSelectedTopic(null);
            }
        } catch (error) {
            console.error("Failed to delete topic:", error);
        }
    };

    const deletePost = async (postId: string) => {
        try {
            await forumPostService.delete(postId);
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };


    if (isLoading) {
        return (
            <div className="flex justify-center mt-10">
                <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            </div>
        );
    }

    if (selectedTopic) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => setSelectedTopic(null)}>
                        ← Voltar ao fórum
                    </Button>
                    {user?.role === 'admin' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-2">
                                    <Trash2 className="w-4 h-4" /> Apagar Tópico
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogDescription>Tem certeza que deseja apagar este tópico e todos os seus comentários? Esta ação é irreversível.</AlertDialogDescription>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteTopic(selectedTopic.id)}>Apagar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                
                <Card className="bg-sky-50 border-sky-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-sky-600" />
                            {selectedTopic.title}
                        </CardTitle>
                        <p className="text-sm text-slate-600">
                            Iniciado em {format(new Date(selectedTopic.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {selectedTopic.description}
                        </p>
                    </CardContent>
                </Card>

                {isLoadingPosts ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-sky-600" /></div>
                ) : (
                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <p className="text-center text-slate-500 py-4">Ainda não há comentários neste tópico.</p>
                        ) : (
                            posts.map(post => (
                                <Card key={post.id} className="ml-4">
                                    <CardContent className="pt-4 flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-3">
                                                {post.content}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {post.created_by_name || 'Membro'} em {format(new Date(post.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                                            </p>
                                        </div>
                                        {user?.role === 'admin' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle></AlertDialogHeader>
                                                    <AlertDialogDescription>Tem certeza que deseja apagar este comentário?</AlertDialogDescription>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deletePost(post.id)}>Apagar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Compartilhar sua experiência</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={addPost} className="space-y-4">
                            <Textarea
                                placeholder="Compartilhe sua reflexão, experiência ou palavras de encorajamento..."
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <Button type="submit" className="gap-2">
                                <Heart className="w-4 h-4" />
                                Compartilhar com amor
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <header>
                    <h1 className="text-3xl font-bold text-slate-800">Fórum de Partilha e Apoio</h1>
                    <p className="text-slate-500 mt-2">
                        Um espaço sagrado para fortalecer os laços fraternos e crescer juntos no Amor Misericordioso.
                    </p>
                </header>
                
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-sky-600 hover:bg-sky-700">
                            <Plus className="w-4 h-4" />
                            Novo Tópico
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Novo Tópico de Partilha</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={createTopic} className="space-y-4">
                            <Input
                                placeholder="Título do tópico (ex: 'Pedido de oração', 'Reflexão sobre...')"
                                value={newTopicTitle}
                                onChange={(e) => setNewTopicTitle(e.target.value)}
                                required
                            />
                            <Textarea
                                placeholder="Compartilhe sua reflexão, dúvida ou pedido de oração. Lembre-se de que este é um espaço de acolhimento mútuo."
                                value={newTopicContent}
                                onChange={(e) => setNewTopicContent(e.target.value)}
                                className="min-h-[120px]"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? 'Criando...' : 'Criar com amor'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tópicos */}
            <div className="space-y-4">
                {topics.map(topic => (
                    <Card key={topic.id} className="hover:shadow-md transition-shadow group">
                        <div onClick={() => openTopic(topic)} className="cursor-pointer">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="hover:text-sky-700 transition-colors">
                                        {topic.title}
                                    </CardTitle>
                                    <Badge variant="outline" className="ml-2">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {format(new Date(topic.created_at), 'dd/MM', { locale: ptBR })}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 line-clamp-2 leading-relaxed">
                                    {topic.description}
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        Criado por {topic.created_by_name || 'Membro'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageCircle className="w-4 h-4" />
                                        Clique para participar
                                    </span>
                                </div>
                            </CardContent>
                        </div>
                        {user?.role === 'admin' && (
                            <div className="px-6 pb-4 flex justify-end">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:bg-red-50 hover:text-red-600 gap-1">
                                            <Trash2 className="w-3 h-3" /> Apagar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>Tem certeza que deseja apagar este tópico e todos os seus comentários? Esta ação é irreversível.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteTopic(topic.id)}>Apagar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </Card>
                ))}

                {topics.length === 0 && (
                    <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                            Seja o primeiro a compartilhar
                        </h3>
                        <p className="text-slate-500 mb-6">
                            Este fórum está esperando suas reflexões, experiências e pedidos de oração.
                        </p>
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Heart className="w-4 h-4" />
                                    Iniciar primeiro tópico
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Orientações */}
            <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4">
                    <p className="text-sm text-amber-800 leading-relaxed">
                        <strong>💚 Lembrete:</strong> Este é um espaço sagrado de partilha fraterna. 
                        Pratiquemos a escuta compassiva, o acolhimento sem julgamento e o amor misericordioso 
                        em cada palavra compartilhada.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
