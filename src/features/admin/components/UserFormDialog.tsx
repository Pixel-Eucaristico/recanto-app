'use client';

import React, { useState, useEffect } from 'react';
import { Role } from '@/features/auth/types/user';
import { User as UserIcon, X, Shield, ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
    DEFAULT_ROLE_PERMISSIONS,
    FEATURES_INFO,
    FEATURE_CATEGORIES,
    getFeaturesByCategory,
    getFeatureInfo
} from '@/config/permissions';

interface Props {
    isOpen: boolean;
    setIsOpen: (o: boolean) => void;
    user: any;
    onSave: (id: string | undefined, data: any) => Promise<boolean>;
    availableRoles?: any[];
}

// Nomes amigáveis para os roles
const ROLE_DISPLAY_NAMES: Record<string, string> = {
    admin: 'Administrador',
    missionario: 'Missionário',
    recantiano: 'Recantiano',
    pai: 'Pai/Mãe',
    colaborador: 'Colaborador',
    benfeitor: 'Benfeitor',
    visitante: 'Visitante',
};

export default function UserFormDialog({ isOpen, setIsOpen, user, onSave, availableRoles = [] }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'recantiano' as Role,
        features: [] as string[]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const featuresByCategory = getFeaturesByCategory();

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                features: user.features || []
            });
        } else {
            setFormData({ name: '', email: '', phone: '', role: 'recantiano', features: [] });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await onSave(user?.id, formData);
        if (success) setIsOpen(false);
        setIsSubmitting(false);
    };

    const toggleFeature = (featureId: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(featureId)
                ? prev.features.filter(f => f !== featureId)
                : [...prev.features, featureId]
        }));
    };

    // Permissões herdadas do grupo (primeiro tenta dinâmico, depois fallback para padrão)
    const getRoleFeatures = (roleId: string | null): string[] => {
        if (!roleId) return [];
        const dynamicRole = availableRoles.find(r => r.id === roleId);
        if (dynamicRole?.features) return dynamicRole.features;
        return DEFAULT_ROLE_PERMISSIONS[roleId as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [];
    };

    const inheritedFeatures = getRoleFeatures(formData.role);
    const hasFullAccess = inheritedFeatures.includes('*') || formData.features.includes('*');

    const filteredFeaturesByCategory = Object.entries(featuresByCategory).reduce((acc, [catId, features]) => {
        const filtered = features.filter(f =>
            f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) acc[catId] = filtered;
        return acc;
    }, {} as Record<string, typeof FEATURES_INFO>);

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl p-0 overflow-hidden rounded-xl border border-base-300 shadow-2xl bg-base-100">
                {/* Header */}
                <div className="bg-base-200 px-6 py-4 border-b border-base-300 flex justify-between items-center">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-primary" />
                        {user ? 'Editar Membro' : 'Novo Membro'}
                    </h3>
                    <button type="button" className="btn btn-ghost btn-circle btn-xs" onClick={() => setIsOpen(false)}>
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-[10px] uppercase font-bold opacity-50">Nome Completo</legend>
                            <input
                                className="input input-xs input-bordered w-full"
                                placeholder="Nome do membro"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-[10px] uppercase font-bold opacity-50">E-mail</legend>
                            <input
                                className="input input-xs input-bordered w-full"
                                type="email"
                                placeholder="exemplo@recanto.org"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={!!user}
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-[10px] uppercase font-bold opacity-50">WhatsApp</legend>
                            <input
                                className="input input-xs input-bordered w-full"
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-[10px] uppercase font-bold opacity-50">Grupo de Acesso</legend>
                            <select
                                className="select select-xs select-bordered w-full"
                                value={formData.role || 'visitante'}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                            >
                                {availableRoles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.display_name || ROLE_DISPLAY_NAMES[role.id] || role.id}
                                    </option>
                                ))}
                            </select>
                        </fieldset>
                    </div>

                    {/* Permissions Section (Discord-style) */}
                    <div className="mt-6 border border-base-300 rounded-lg overflow-hidden bg-base-200/20">
                        <div className="bg-base-200 px-4 py-2 border-b border-base-300 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Permissões Específicas</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    className="input input-bordered input-xs w-32 pl-7 font-medium" 
                                    placeholder="Buscar..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Shield className="absolute left-2.5 top-1.5 w-3 h-3 opacity-30" />
                            </div>
                        </div>

                        <ul className="list p-1 max-h-[250px] overflow-y-auto scrollbar-none">
                            {Object.entries(FEATURE_CATEGORIES).map(([categoryId, category]) => {
                                const categoryFeatures = filteredFeaturesByCategory[categoryId] || [];
                                if (categoryFeatures.length === 0) return null;

                                const CategoryIcon = category.icon;

                                return (
                                    <li key={categoryId} className="flex flex-col p-1 gap-1 border-t border-base-300/30 first:border-0 pt-3 first:pt-1">
                                        <div className="h-6 flex items-center mb-1">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 select-none w-fit border-r-2 border-base-300 -rotate-180 origin-center bg-base-200/50 rounded-r-sm">
                                                <CategoryIcon className={`w-3 h-3 text-${category.color} opacity-60 rotate-180`} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight opacity-40 rotate-180">{category.label}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-0.5">
                                                {categoryFeatures.map(feature => {
                                                    const isInherited = inheritedFeatures.includes(feature.id) || (hasFullAccess && feature.id !== '*');
                                                    const isIndividual = formData.features.includes(feature.id);
                                                    const isActive = isIndividual || isInherited;

                                                    return (
                                                        <label
                                                            key={feature.id}
                                                            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-all active:scale-95
                                                                ${isActive ? 'bg-primary/5' : 'hover:bg-base-200'}
                                                                ${isInherited ? 'opacity-50 !cursor-default' : ''}
                                                            `}
                                                            title={feature.description}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className={`checkbox checkbox-xs ${isInherited ? 'checkbox-ghost' : 'checkbox-primary'} shrink-0`}
                                                                checked={isActive}
                                                                disabled={isInherited}
                                                                onChange={() => toggleFeature(feature.id)}
                                                            />
                                                            <div className="flex flex-col min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className={`text-[11px] font-bold leading-none ${isActive ? 'text-primary' : 'opacity-80'}`}>
                                                                        {feature.label}
                                                                    </span>
                                                                    {isInherited && (
                                                                        <span className="badge badge-ghost text-[8px] h-3 px-1 leading-none uppercase font-bold opacity-30 shrink-0">Cargo</span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[9px] opacity-40 truncate leading-none mt-0.5">{feature.description}</span>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-base-300">
                        <button type="button" className="btn btn-ghost btn-xs" onClick={() => setIsOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-xs px-4" disabled={isSubmitting}>
                            {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : (user ? "Salvar" : "Criar Membro")}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop bg-black/40" onClick={() => setIsOpen(false)}></div>
        </div>
    );
}
