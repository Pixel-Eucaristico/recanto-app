import { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Role } from '@/features/auth/types/user';
import { useToast } from "@/components/ui/use-toast";

export function useAdminUsers() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const userList = await User.list('name');
            setUsers(userList as any);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        let filtered = users;
        if (searchQuery) {
            filtered = filtered.filter(u => 
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }
        setFilteredUsers(filtered);
    }, [users, searchQuery, roleFilter]);

    const deleteUser = async (id: string) => {
        try {
            await User.delete(id);
            toast({ title: "Sucesso!", description: "Usuário removido." });
            loadUsers();
            return true;
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao remover usuário." });
            return false;
        }
    };

    const saveUser = async (id: string | undefined, data: any) => {
        try {
            if (id) {
                await User.update(id, data);
                toast({ title: "Sucesso!", description: "Usuário atualizado." });
            } else {
                await User.create({ ...data, created_at: new Date().toISOString() } as any);
                toast({ title: "Sucesso!", description: "Usuário criado." });
            }
            loadUsers();
            return true;
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao salvar usuário." });
            return false;
        }
    };

    return {
        users: filteredUsers,
        isLoading,
        searchQuery,
        setSearchQuery,
        roleFilter,
        setRoleFilter,
        deleteUser,
        saveUser,
        refresh: loadUsers
    };
}
