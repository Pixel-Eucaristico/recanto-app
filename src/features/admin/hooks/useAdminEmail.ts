import { useState, useEffect } from 'react';
import { AdminEmailConfig } from '@/types/form-submissions';
import { useToast } from "@/components/ui/use-toast";

export function useAdminEmail() {
    const { toast } = useToast();
    const [config, setConfig] = useState<Partial<AdminEmailConfig>>({
        email: '',
        name: '',
        notify_on_contact: true,
        notify_on_story: true,
        provider: 'gmail'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [gmailStatus, setGmailStatus] = useState<{ connected: boolean; expires_at?: string } | null>(null);

    const loadConfig = async () => {
        try {
            const response = await fetch('/api/admin/email-config');
            if (response.ok) {
                const data = await response.json();
                setConfig(data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const checkGmailStatus = async () => {
        try {
            const response = await fetch('/api/gmail/status');
            if (response.ok) {
                const data = await response.json();
                setGmailStatus(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadConfig();
        checkGmailStatus();
    }, []);

    const saveConfig = async (newConfig: Partial<AdminEmailConfig>) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/email-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            if (!response.ok) throw new Error('Failed to save');
            toast({ title: "Sucesso!", description: "Configurações salvas." });
            setConfig(newConfig);
            return true;
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const disconnectGmail = async () => {
        try {
            const response = await fetch('/api/gmail/status', { method: 'DELETE' });
            if (response.ok) {
                setGmailStatus({ connected: false });
                toast({ title: "Desconectado", description: "Conta desconectada." });
                return true;
            }
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao desconectar." });
        }
        return false;
    };

    return {
        config,
        setConfig,
        isLoading,
        isSaving,
        gmailStatus,
        saveConfig,
        disconnectGmail,
        refreshStatus: checkGmailStatus
    };
}
