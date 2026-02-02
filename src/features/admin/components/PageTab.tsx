'use client';

import React from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useAdminPageContent } from '../hooks/useAdminPageContent';
import { CommunityFeedback, Project, MainPageContent } from '@/types/main-content';

export default function PageTab() {
    const { content, setContent, isLoading, saveContent } = useAdminPageContent();

    if (isLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>;
    if (!content) return <div className="p-12 text-center opacity-50">Nenhum conteúdo encontrado.</div>;

    const addFeedback = () => {
        const newFeedback: CommunityFeedback = { id: Date.now(), name: '', comment: '', role: '', avatar: '', date: new Date().toLocaleDateString() };
        setContent({ ...content, communityFeedbacks: [...(content.communityFeedbacks || []), newFeedback] });
    };

    const updateFeedback = (id: number, field: keyof CommunityFeedback, value: string) => {
        const updated = content.communityFeedbacks.map(f => f.id === id ? { ...f, [field]: value } : f);
        setContent({ ...content, communityFeedbacks: updated });
    };

    const deleteFeedback = (id: number) => {
        setContent({ ...content, communityFeedbacks: content.communityFeedbacks.filter(f => f.id !== id) });
    };

    const addProject = () => {
        const newProject: Project = { id: Date.now(), title: '', description: '', image: '', category: 'social' };
        setContent({ ...content, projects: [...(content.projects || []), newProject] });
    };

    const updateProject = (id: number, field: keyof Project, value: string) => {
        setContent({ ...content, projects: content.projects.map(p => p.id === id ? { ...p, [field]: value } : p) });
    };

    const deleteProject = (id: number) => {
        setContent({ ...content, projects: content.projects.filter(p => p.id !== id) });
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-base-content">Conteúdo da Página Principal</h2>
                <button className="btn btn-primary" onClick={() => saveContent(content)}>
                    <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                </button>
            </div>

            {/* Feedbacks Section */}
            <div className="card bg-base-100 shadow border border-base-200">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Feedback da Comunidade</h3>
                        <button className="btn btn-ghost btn-outline btn-sm" onClick={addFeedback}><Plus className="w-4 h-4 mr-1" /> Adicionar</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {content.communityFeedbacks?.map(f => (
                            <div key={f.id} className="p-4 bg-base-200/50 rounded-lg space-y-3 relative">
                                <button className="btn btn-circle btn-xs btn-error absolute top-2 right-2" onClick={() => deleteFeedback(f.id)}><Trash2 className="w-3 h-3" /></button>
                                <input className="input input-bordered input-sm w-full font-bold" value={f.name} placeholder="Nome" onChange={e => updateFeedback(f.id, 'name', e.target.value)} />
                                <input className="input input-bordered input-sm w-full" value={f.role} placeholder="Cargo/Papel" onChange={e => updateFeedback(f.id, 'role', e.target.value)} />
                                <textarea className="textarea textarea-bordered w-full h-20 text-sm" value={f.comment} placeholder="Depoimento" onChange={e => updateFeedback(f.id, 'comment', e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Projects Section */}
            <div className="card bg-base-100 shadow border border-base-200">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Nossos Projetos</h3>
                        <button className="btn btn-ghost btn-outline btn-sm" onClick={addProject}><Plus className="w-4 h-4 mr-1" /> Adicionar</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {content.projects?.map(p => (
                            <div key={p.id} className="p-4 bg-base-200/50 rounded-lg space-y-3 relative">
                                <button className="btn btn-circle btn-xs btn-error absolute top-2 right-2" onClick={() => deleteProject(p.id)}><Trash2 className="w-3 h-3" /></button>
                                <input className="input input-bordered input-sm w-full font-bold" value={p.title} placeholder="Título" onChange={e => updateProject(p.id, 'title', e.target.value)} />
                                <textarea className="textarea textarea-bordered w-full h-20 text-sm" value={p.description} placeholder="Descrição" onChange={e => updateProject(p.id, 'description', e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
