import { useState, useEffect } from 'react';
import { MainPageContent, CommunityFeedback, Project, Evangelization } from '@/types/main-content';
import { useToast } from "@/components/ui/use-toast";

export function useAdminPageContent() {
    const { toast } = useToast();
    const [content, setContent] = useState<MainPageContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadContent = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/main-page-content');
            if (response.ok) {
                const data = await response.json();
                setContent(data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const saveContent = async (newContent: MainPageContent) => {
        try {
            const response = await fetch('/api/admin/main-page-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContent)
            });
            if (response.ok) {
                toast({ title: "Sucesso!", description: "Dados da página salvos." });
                setContent(newContent);
            }
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao salvar." });
        }
    };

    useEffect(() => {
        loadContent();
    }, []);

    return {
        content,
        setContent,
        isLoading,
        saveContent,
        refresh: loadContent
    };
}
