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
        <div className="modal modal-open items-center justify-center p-4">
            <div className="modal-box w-full max-w-xl bg-base-100 border border-base-300 shadow-2xl p-0 overflow-hidden rounded-3xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-base-200/80 p-6 border-b border-base-300 flex justify-between items-center">
                    <h3 className="text-2xl font-bold flex items-center gap-3 text-base-content">
                        <FileText className="w-6 h-6 shrink-0 text-primary" />
                        {material ? 'Editar Recurso' : 'Novo Recurso'}
                    </h3>
                    <button className="btn btn-ghost btn-circle btn-sm" onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-8">
                    <fieldset className="fieldset p-0 m-0 border-none bg-transparent flex flex-col gap-8 text-base-content">
                        {/* Título */}
                        <div className="form-control w-full">
                            <label className="label pt-0 pb-1">
                                <span className="label-text font-bold text-base flex items-center gap-2">
                                    <Type className="w-4 h-4 shrink-0 opacity-40" /> Título do Material
                                </span>
                            </label>
                            <input 
                                className="input input-bordered w-full bg-base-100 h-12" 
                                placeholder="Título claro e objetivo"
                                value={formState.title || ''} 
                                onChange={e => handleChange('title', e.target.value)} 
                                required 
                            />
                        </div>

                        {/* Descrição */}
                        <div className="form-control w-full">
                            <label className="label pt-0 pb-1">
                                <span className="label-text font-bold text-base">Descrição Resumida</span>
                            </label>
                            <textarea 
                                className="textarea textarea-bordered w-full bg-base-100 h-28 text-base py-3" 
                                placeholder="O que este material aborda?"
                                value={formState.description || ''} 
                                onChange={e => handleChange('description', e.target.value)} 
                            />
                        </div>

                        {/* Categoria e Público */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="form-control w-full">
                                <label className="label pt-0 pb-1">
                                    <span className="label-text font-bold text-base flex items-center gap-2">
                                        <Tag className="w-4 h-4 shrink-0 opacity-40" /> Categoria
                                    </span>
                                </label>
                                <input 
                                    className="input input-bordered w-full bg-base-100 h-12" 
                                    placeholder="Ex: Formação, Espiritualidade"
                                    value={formState.category || ''} 
                                    onChange={e => handleChange('category', e.target.value)} 
                                />
                            </div>

                            <div className="form-control w-full">
                                <label className="label pt-0 pb-1">
                                    <span className="label-text font-bold text-base flex items-center gap-2">
                                        <Users className="w-4 h-4 shrink-0 opacity-40" /> Visibilidade
                                    </span>
                                </label>
                                <select 
                                    className="select select-bordered w-full bg-base-100 h-12 font-semibold" 
                                    value={formState.authorized_roles ? formState.authorized_roles[0] : 'missionario'} 
                                    onChange={e => handleChange('authorized_roles', [e.target.value])}
                                >
                                    <option value="admin">Administradores</option>
                                    <option value="missionario">Missionários</option>
                                    <option value="recantiano">Recantianos</option>
                                    <option value="all">Público Aberto</option>
                                </select>
                            </div>
                        </div>

                        {/* Tipo e Upload */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div className="form-control w-full">
                                <label className="label pt-0 pb-1">
                                    <span className="label-text font-bold text-base">Tipo de Mídia</span>
                                </label>
                                <select 
                                    className="select select-bordered w-full bg-base-100 h-12" 
                                    value={formState.type || 'text'} 
                                    onChange={e => handleChange('type', e.target.value)}
                                >
                                    <option value="text">Artigo / Link Externo</option>
                                    <option value="pdf">Documento PDF</option>
                                    <option value="video">Vídeo / Aula</option>
                                </select>
                            </div>

                            <div className="form-control w-full">
                                <label className="label pt-0 pb-1">
                                    <span className="label-text font-bold text-base flex items-center gap-2">
                                        <FileUp className="w-4 h-4 shrink-0 opacity-40" /> Anexar Arquivo
                                    </span>
                                </label>
                                <input 
                                    type="file" 
                                    className="file-input file-input-bordered file-input-primary w-full bg-base-100 h-12" 
                                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Footer */}
                    <div className="bg-base-200/50 -mx-10 -mb-10 p-8 flex justify-end gap-4 border-t border-base-300">
                        <button type="button" className="btn btn-ghost px-8" onClick={() => setIsOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary px-12 shadow-md" disabled={isSubmitting}>
                            {isSubmitting ? <span className="loading loading-spinner"></span> : "Salvar Conteúdo"}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
        </div>
    );
}
