'use client';

import React, { useState, useEffect } from 'react';
import { Material } from '@/entities/Material';
import { UploadFile } from '@/integrations/Core';
import { useToast } from "@/components/ui/use-toast";
import { FileText, Type, Tag, Users, FileUp, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    setIsOpen: (o: boolean) => void;
    material: Material | null;
    onFinished: () => void;
}

export default function MaterialFormDialog({ isOpen, setIsOpen, material, onFinished }: Props) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formState, setFormState] = useState<any>({});
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (material) {
            setFormState(material);
        } else {
            setFormState({ title: '', description: '', category: '', type: 'text', authorized_roles: ['missionario'] });
        }
    }, [material, isOpen]);
    
    const handleChange = (field: string, value: any) => setFormState((prev: any) => ({...prev, [field]: value}));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let payload: any = {...formState};
            if (file) {
                const result = await UploadFile(file);
                payload.file_url = result.url;
            }
            if (material?.id) {
                await Material.update(material.id, payload);
                toast({ title: "Sucesso!", description: "Material atualizado." });
            } else {
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
    
    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl bg-base-100 border border-base-300 shadow-xl p-0 overflow-hidden rounded-2xl animate-in zoom-in-95 duration-200">
                {/* Header MD Standard */}
                <div className="bg-base-200 px-6 py-4 border-b border-base-300 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-base-content">
                        <FileText className="w-5 h-5 shrink-0 text-primary" />
                        {material ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                    </h3>
                    <button type="button" className="btn btn-ghost btn-circle btn-sm" onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <fieldset className="fieldset gap-4 p-0">
                        {/* Título e Mídia em Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="fieldset-label font-bold text-base-content/80 mb-1">Título</label>
                                <input 
                                    className="input input-bordered w-full h-[38px]" 
                                    placeholder="Título do material"
                                    value={formState.title || ''} 
                                    onChange={e => handleChange('title', e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="w-full">
                                <label className="fieldset-label font-bold text-base-content/80 mb-1">Formato</label>
                                <select 
                                    className="select select-bordered w-full h-[38px] min-h-0 text-xs" 
                                    value={formState.type || 'text'} 
                                    onChange={e => handleChange('type', e.target.value)}
                                >
                                    <option value="text">Artigo</option>
                                    <option value="pdf">PDF</option>
                                    <option value="video">Vídeo</option>
                                </select>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="w-full">
                            <label className="fieldset-label font-bold text-base-content/80 mb-1">Descrição</label>
                            <textarea 
                                className="textarea textarea-bordered w-full h-24 text-sm" 
                                placeholder="Pequena descrição..."
                                value={formState.description || ''} 
                                onChange={e => handleChange('description', e.target.value)} 
                            />
                        </div>

                        {/* Categoria e Público */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="fieldset-label font-bold text-base-content/80 mb-1">Categoria</label>
                                <input 
                                    className="input input-bordered w-full h-[38px]" 
                                    placeholder="Ex: Formação"
                                    value={formState.category || ''} 
                                    onChange={e => handleChange('category', e.target.value)} 
                                />
                            </div>

                            <div className="w-full">
                                <label className="fieldset-label font-bold text-base-content/80 mb-1 text-[11px] truncate">Público Alvo</label>
                                <select 
                                    className="select select-bordered w-full h-[38px] min-h-0 font-bold text-xs" 
                                    value={formState.authorized_roles ? formState.authorized_roles[0] : 'missionario'} 
                                    onChange={e => handleChange('authorized_roles', [e.target.value])}
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="missionario">Missionário</option>
                                    <option value="recantiano">Recantiano</option>
                                    <option value="all">Público</option>
                                </select>
                            </div>
                        </div>

                        {/* Upload */}
                        <div className="w-full">
                            <label className="fieldset-label font-bold text-base-content/80 mb-1">Arquivo</label>
                            <input 
                                type="file" 
                                className="file-input file-input-bordered file-input-primary file-input-xs w-full h-[38px]" 
                                onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                            />
                        </div>
                    </fieldset>

                    {/* Footer MD */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-base-300 mt-4">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-sm px-6 font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop bg-black/40" onClick={() => setIsOpen(false)}></div>
        </div>
    );
}
