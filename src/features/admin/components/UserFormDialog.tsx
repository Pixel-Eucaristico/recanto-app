'use client';

import React, { useState, useEffect } from 'react';
import { Role } from '@/features/auth/types/user';
import { User as UserIcon, X } from 'lucide-react';

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
        <div className="modal modal-open">
            <div className="modal-box max-w-lg bg-base-100 border border-base-300 shadow-xl p-0 overflow-hidden rounded-2xl animate-in zoom-in-95 duration-200">
                {/* Header MD (Padronizado) */}
                <div className="bg-base-200 px-6 py-4 border-b border-base-300 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-primary" />
                        {user ? 'Editar Membro' : 'Novo Membro'}
                    </h3>
                    <button type="button" className="btn btn-ghost btn-circle btn-sm" onClick={() => setIsOpen(false)}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <fieldset className="fieldset gap-4 p-0">
                        {/* Nome e Email em Grid 2 colunas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="fieldset-label font-bold text-base-content/70">Nome Completo</label>
                                <input 
                                    className="input input-bordered w-full h-[38px]" 
                                    placeholder="Nome do membro"
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>

                            <div className="w-full">
                                <label className="fieldset-label font-bold text-base-content/70">E-mail</label>
                                <input 
                                    className="input input-bordered w-full h-[38px]" 
                                    type="email" 
                                    placeholder="exemplo@recanto.org"
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    required 
                                    disabled={!!user} 
                                />
                            </div>
                        </div>

                        {/* WhatsApp e Função em Grid 2 colunas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="fieldset-label font-bold text-base-content/70">WhatsApp / Telefone</label>
                                <input 
                                    className="input input-bordered w-full h-[38px]" 
                                    placeholder="(00) 00000-0000"
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                />
                            </div>

                            <div className="w-full">
                                <label className="fieldset-label font-bold text-base-content/70">Função/Acesso</label>
                                <select 
                                    className="select select-bordered w-full h-[38px] min-h-0" 
                                    value={formData.role || 'recantiano'} 
                                    onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="missionario">Missionário</option>
                                    <option value="recantiano">Recantiano</option>
                                    <option value="pai">Pai/Mãe</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* Footer Standard MD */}
                    <div className="card-actions justify-end mt-6 gap-2 border-t border-base-300 pt-4">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-sm px-6 font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : (user ? "Salvar" : "Criar Membro")}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop bg-black/50" onClick={() => setIsOpen(false)}></div>
        </div>
    );
}
