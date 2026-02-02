'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { Role } from '@/features/auth/types/user';
import UserFormDialog from './UserFormDialog';

export default function UsersTab() {
    const { 
        users, isLoading, searchQuery, setSearchQuery, roleFilter, setRoleFilter, 
        deleteUser, saveUser 
    } = useAdminUsers();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isMac, setIsMac] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Detectar OS e Atalho de teclado Cmd/Ctrl + K
    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const openEdit = (user: any) => {
        setEditingUser(user);
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingUser(null);
        setIsDialogOpen(true);
    };

    const getInitials = (n: string) => {
        if (!n) return '?';
        const parts = n.split(' ').filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return n.substring(0, 2).toUpperCase();
    };

    const getRoleBadge = (role: Role) => {
        const badges: Record<string, string> = {
            admin: 'badge-error',
            missionario: 'badge-primary',
            recantiano: 'badge-ghost',
            pai: 'badge-secondary',
            colaborador: 'badge-accent',
            benfeitor: 'badge-info'
        };
        return <span className={`badge badge-sm uppercase font-bold px-3 ${badges[role as string] || 'badge-ghost'}`}>{role}</span>;
    };

    return (
        <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="card-title text-xl font-bold italic text-base-content">Gestão de Equipe</h2>
                        <p className="text-xs opacity-50">Controle de acessos da comunidade</p>
                    </div>
                    <button onClick={openNew} className="btn btn-primary btn-sm">
                        <Plus className="w-4 h-4" /> Novo Membro
                    </button>
                </div>

                {/* Filtros Avançados DaisyUI */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                    {/* Filtros de Categoria */}
                    <div className="filter bg-base-200/50 p-1 rounded-lg border border-base-300 flex-1 flex gap-1 w-full sm:w-auto overflow-x-auto">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'admin', label: 'Admin' },
                            { id: 'missionario', label: 'Missio' },
                            { id: 'recantiano', label: 'Recanto' },
                            { id: 'pai', label: 'Pais' },
                            { id: 'benfeitor', label: 'Amigos' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                className={`btn btn-sm border-none shadow-none flex-1 transition-all whitespace-nowrap px-4 ${
                                    roleFilter === btn.id 
                                    ? 'btn-primary text-primary-content' 
                                    : 'btn-ghost hover:bg-base-300'
                                }`}
                                onClick={() => setRoleFilter(btn.id)}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* Busca DaisyUI v5 Style com Atalho KBD Dinâmico */}
                    <label className="input input-sm input-bordered flex items-center gap-2 w-full sm:w-72 h-[38px] group">
                        <svg className="h-[1em] opacity-50 group-focus-within:opacity-100 transition-all" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                        <input 
                            ref={searchInputRef}
                            type="search" 
                            className="grow" 
                            placeholder="Buscar membros..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {!searchQuery && (
                            <div className="flex gap-1 items-center">
                                <kbd className="kbd kbd-sm h-5 min-h-0 px-1 text-[10px] opacity-60">{isMac ? '⌘' : 'Ctrl'}</kbd>
                                <kbd className="kbd kbd-sm h-5 min-h-0 px-1 text-[10px] opacity-60">K</kbd>
                            </div>
                        )}
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="btn btn-ghost btn-circle btn-xs h-4 w-4 min-h-0">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </label>
                </div>

                {/* Tabela MD */}
                {isLoading ? (
                    <div className="flex justify-center p-12"><span className="loading loading-spinner text-primary"></span></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-md w-full">
                            <thead>
                                <tr className="text-base-content/60 uppercase text-[10px] tracking-widest border-b border-base-300">
                                    <th>Membro</th>
                                    <th>Nível de Acesso</th>
                                    <th className="text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center py-12 italic opacity-40">Nenhum membro encontrado.</td></tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} className="hover:bg-base-200/50 transition-colors border-b border-base-300/30">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-neutral text-neutral-content w-8 h-8 rounded-full flex items-center justify-center">
                                                            <span className="text-[10px] font-bold uppercase select-none leading-none">{getInitials(u.name)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-base-content leading-tight">{u.name}</span>
                                                        <span className="text-[10px] opacity-40 italic truncate max-w-[150px]">{u.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{getRoleBadge(u.role as Role)}</td>
                                            <td>
                                                <div className="flex justify-end gap-1">
                                                    <button className="btn btn-ghost btn-square btn-xs" onClick={() => openEdit(u)} title="Editar">
                                                        <Edit className="w-3.5 h-3.5 text-primary" />
                                                    </button>
                                                    <button className="btn btn-ghost btn-square btn-xs" onClick={async () => {
                                                        if(u.id && confirm(`Remover "${u.name}"?`)) deleteUser(u.id);
                                                    }} title="Excluir">
                                                        <Trash2 className="w-3.5 h-3.5 text-error" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <UserFormDialog 
                isOpen={isDialogOpen} 
                setIsOpen={setIsDialogOpen} 
                user={editingUser} 
                onSave={saveUser} 
            />
        </div>
    );
}
