'use client';

import React, { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { Role } from '@/features/auth/types/user';
import UserFormDialog from './UserFormDialog';

export default function UsersTab() {
    const { 
        users, isLoading, setSearchQuery, roleFilter, setRoleFilter, 
        deleteUser, saveUser 
    } = useAdminUsers();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const openEdit = (user: any) => {
        setEditingUser(user);
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingUser(null);
        setIsDialogOpen(true);
    };

    const getRoleBadge = (role: Role) => {
        const badges: Record<string, string> = {
            admin: 'badge-error',
            missionario: 'badge-primary',
            recantiano: 'badge-ghost',
            pai: 'badge-secondary'
        };
        return <span className={`badge badge-sm uppercase font-bold px-3 ${badges[role as string] || 'badge-ghost'}`}>{role}</span>;
    };

    return (
        <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h2 className="card-title text-2xl font-bold">Gestão de Equipe</h2>
                        <p className="text-sm opacity-60">Controle de acessos e permissões do Recanto</p>
                    </div>
                    <button onClick={openNew} className="btn btn-primary">
                        <Plus className="w-5 h-5 mr-1" /> Novo Usuário
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-20"><span className="loading loading-spinner text-primary loading-lg"></span></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="text-base-content/70">
                                    <th>Membro</th>
                                    <th>Acesso</th>
                                    <th className="text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center py-20 italic opacity-40">Nenhum usuário encontrado na busca.</td></tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} className="hover:bg-base-200/30 transition-colors border-b border-base-200/30">
                                            <td className="py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-base-content">{u.name}</span>
                                                    <span className="text-[10px] opacity-50 italic font-medium leading-tight">{u.email}</span>
                                                </div>
                                            </td>
                                            <td>{getRoleBadge(u.role as Role)}</td>
                                            <td className="text-right flex justify-end gap-1">
                                                <button className="btn btn-ghost btn-square btn-sm hover:bg-primary/10 transition-colors" onClick={() => openEdit(u)}>
                                                    <Edit className="w-4 h-4 text-primary" />
                                                </button>
                                                <button className="btn btn-ghost btn-square btn-sm hover:bg-error/10 transition-colors" onClick={async () => {
                                                    if(u.id && confirm(`Remover acesso de "${u.name}" permanentemente?`)) deleteUser(u.id);
                                                }}>
                                                    <Trash2 className="w-4 h-4 text-error" />
                                                </button>
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
