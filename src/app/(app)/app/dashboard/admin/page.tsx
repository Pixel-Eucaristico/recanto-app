'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/daisyui/tabs";

import ContentTab from '@/features/admin/components/ContentTab';
import EmailTab from '@/features/admin/components/EmailTab';
import UsersTab from '@/features/admin/components/UsersTab';

const AdminPage = () => {
    const { toast } = useToast();
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            toast({ 
                title: "Erro de Conexão", 
                description: searchParams.get('details') || "Erro ao conectar Gmail.", 
                variant: "destructive" 
            });
        } else if (searchParams.get('gmail_connected')) {
            toast({ 
                title: "Sucesso!", 
                className: "bg-success text-success-content", 
                description: "Gmail conectado com sucesso." 
            });
        }
    }, [searchParams]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-base-content">Painel Administrativo</h1>
                <p className="text-base-content/60">Gerencie o conteúdo e a equipe do Recanto</p>
            </header>

            <Tabs defaultValue="content" variant="boxed" size="lg">
                <TabsList className="bg-base-200">
                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                    <TabsTrigger value="users">Equipe</TabsTrigger>
                    <TabsTrigger value="email">Configurações</TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                    <ContentTab />
                </TabsContent>
                
                <TabsContent value="users">
                    <UsersTab />
                </TabsContent>

                <TabsContent value="email">
                    <EmailTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default function AdminPageWrapper() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        }>
            <AdminPage />
        </Suspense>
    );
}