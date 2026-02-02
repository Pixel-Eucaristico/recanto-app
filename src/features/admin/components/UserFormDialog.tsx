'use client';

import React, { useState, useEffect } from 'react';
import { Role } from '@/features/auth/types/user';
import { User as UserIcon, Mail, Phone, ShieldCheck, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    setIsOpen: (o: boolean) => void;
    user: any;
    onSave: (id: string | undefined, data: any) => Promise<boolean>;
}

export default function UserFormDialog({ isOpen, setIsOpen, user, onSave }: Props) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'recantiano' as Role });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role });
        } else {
            setFormData({ name: '', email: '', phone: '', role: 'recantiano' });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await onSave(user?.id, formData);
        if (success) setIsOpen(false);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open items-center justify-center p-4">
            <div className="modal-box w-full max-w-lg bg-base-100 border border-base-300 shadow-2xl p-0 overflow-hidden rounded-3xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-base-200/80 p-6 border-b border-base-300 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-base-content flex items-center gap-3">
                            <UserIcon className="w-6 h-6 shrink-0 text-primary" />
                            {user ? 'Editar Membro' : 'Novo Membro'}
                        </h3>
                    </div>
                    <button className="btn btn-ghost btn-circle btn-sm" onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-8">
                    <fieldset className="fieldset p-0 m-0 border-none bg-transparent flex flex-col gap-8">
                        {/* Nome */}
                        <div className="form-control w-full">
                            <label className="label pt-0 pb-1">
                                <span className="label-text font-bold text-base flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 shrink-0 opacity-40" /> Nome Completo
                                </span>
                            </label>
                            <input 
                                className="input input-bordered w-full bg-base-100 h-12" 
                                placeholder="Ex: Maria Oliveira"
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>

                        {/* E-mail */}
                        <div className="form-control w-full">
                            <label className="label pt-0 pb-1">
                                <span className="label-text font-bold text-base flex items-center gap-2">
                                    <Mail className="w-4 h-4 shrink-0 opacity-40" /> E-mail de Acesso
                                </span>
                            </label>
                            <input 
                                className="input input-bordered w-full bg-base-100 h-12" 
                                type="email" 
                                placeholder="email@recanto.org"
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                required 
                                disabled={!!user} 
                            />
                        </div>

                        {/* Grid Telefona e Funçao */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="form-control w-full">
                                <label className="label pt-0 pb-1">
                                    <span className="label-text font-bold text-base flex items-center gap-2">
                                        <Phone className="w-4 h-4 shrink-0 opacity-40" /> WhatsApp
                                    </span>
                                </label>
                                <input 
                                    className="input input-bordered w-full bg-base-100 h-12" 
                                    placeholder="(00) 00000-0000"
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                />
                            </div>

                            <div className="form-control w-full">
                                <label className="label pt-0 pb-1">
                                    <span className="label-text font-bold text-base flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 shrink-0 opacity-40" /> Nível de Acesso
                                    </span>
                                </label>
                                <select 
                                    className="select select-bordered w-full bg-base-100 h-12 font-semibold" 
                                    value={formData.role || 'recantiano'} 
                                    onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="missionario">Missionário</option>
                                    <option value="recantiano">Recantiano</option>
                                    <option value="pai">Pai/Mãe de Acolhimento</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* Footer / Ações */}
                    <div className="bg-base-200/50 -mx-10 -mb-10 p-8 flex justify-end gap-4 border-t border-base-300">
                        <button type="button" className="btn btn-ghost px-8" onClick={() => setIsOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary px-12 shadow-md" disabled={isSubmitting}>
                            {isSubmitting ? <span className="loading loading-spinner"></span> : (user ? "Salvar Alterações" : "Criar Membro")}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
        </div>
    );
}
