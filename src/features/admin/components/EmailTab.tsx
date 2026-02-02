'use client';

import React from 'react';
import { CheckCircle2, Mail, Info } from 'lucide-react';
import { useAdminEmail } from '../hooks/useAdminEmail';

export default function EmailTab() {
    const { config, setConfig, isLoading, isSaving, gmailStatus, saveConfig, disconnectGmail } = useAdminEmail();

    if (isLoading) return (
        <div className="flex justify-center p-12">
            <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Coluna Esquerda: Configurações Gerais */}
            <div className="card bg-base-100 shadow-sm border border-base-300">
                <div className="card-body gap-8 p-8">
                    <h3 className="card-title text-2xl font-bold text-base-content">Configurações de E-mail</h3>
                    
                    <fieldset className="fieldset bg-base-200/50 p-6 rounded-box border border-base-300">
                        <legend className="fieldset-legend text-base-content/60 font-bold uppercase tracking-wider">Identidade</legend>
                        
                        <div className="flex flex-col gap-6 w-full">
                            <label className="form-control w-full">
                                <div className="label pt-0"><span className="label-text font-bold">Nome do Administrador</span></div>
                                <input 
                                    className="input input-bordered w-full" 
                                    placeholder="Nome exibido nos e-mails"
                                    value={config.name || ''} 
                                    onChange={(e) => setConfig({ ...config, name: e.target.value })} 
                                />
                            </label>

                            <label className="form-control w-full">
                                <div className="label pt-0"><span className="label-text font-bold">E-mail de Notificação</span></div>
                                <input 
                                    className="input input-bordered w-full" 
                                    type="email" 
                                    placeholder="admin@exemplo.com"
                                    value={config.email || ''} 
                                    onChange={(e) => setConfig({ ...config, email: e.target.value })} 
                                />
                            </label>

                            <label className="form-control w-full">
                                <div className="label pt-0"><span className="label-text font-bold">Serviço de Envio</span></div>
                                <select 
                                    className="select select-bordered w-full" 
                                    value={config.provider || 'gmail'} 
                                    onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                                >
                                    <option value="gmail">Google Gmail API</option>
                                    <option value="smtp">Servidor SMTP Manual</option>
                                </select>
                            </label>
                        </div>
                    </fieldset>

                    <fieldset className="fieldset bg-base-200/50 p-6 rounded-box border border-base-300">
                        <legend className="fieldset-legend text-base-content/60 font-bold uppercase tracking-wider">Alertas</legend>
                        <div className="flex flex-col gap-5">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-primary" 
                                    checked={config.notify_on_contact} 
                                    onChange={(e) => setConfig({ ...config, notify_on_contact: e.target.checked })} 
                                />
                                <span className="label-text font-medium text-base group-hover:text-primary transition-colors">Novos formulários de contato</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-primary" 
                                    checked={config.notify_on_story} 
                                    onChange={(e) => setConfig({ ...config, notify_on_story: e.target.checked })} 
                                />
                                <span className="label-text font-medium text-base group-hover:text-primary transition-colors">Novas histórias de usuários</span>
                            </label>
                        </div>
                    </fieldset>

                    <div className="card-actions justify-end mt-4">
                        <button className="btn btn-primary px-10 shadow-md" onClick={() => saveConfig(config)} disabled={isSaving}>
                            {isSaving ? <span className="loading loading-spinner"></span> : "Salvar Tudo"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Coluna Direita: API e Informações */}
            <div className="flex flex-col gap-8">
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-8">
                        <h3 className="card-title text-2xl font-bold text-base-content mb-4">Conexão Gmail</h3>
                        
                        {gmailStatus?.connected ? (
                            <div className="p-6 rounded-2xl bg-success/10 border border-success/20 flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 shrink-0 text-success" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-success text-lg">Gmail Conectado</h4>
                                    <p className="text-sm opacity-80 text-base-content mt-1">O sistema está enviando e-mails via API oficial.</p>
                                    <button 
                                        className="btn btn-link btn-xs mt-3 p-0 h-auto text-error underline hover:text-error/80" 
                                        onClick={() => { if(confirm('Desconectar conta?')) disconnectGmail(); }}
                                    >
                                        Desconectar Conta Google
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-base-content/70 leading-relaxed italic">
                                    Vincule sua conta Google para garantir que os e-mails não caiam no SPAM e sejam entregues com segurança.
                                </p>
                                <button className="btn btn-outline btn-block gap-3 border-base-300 hover:border-primary" onClick={() => window.location.href = '/api/gmail/auth'}>
                                    <Mail className="w-5 h-5 shrink-0" /> Autorizar Acesso Google
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Importante / Info Alert */}
                <div className="p-6 rounded-2xl bg-info/10 border border-info/20 flex items-start gap-4">
                    <Info className="w-6 h-6 shrink-0 text-info" />
                    <div className="flex-1">
                        <h4 className="font-bold text-info text-sm uppercase tracking-widest mb-2">Atenção Especial</h4>
                        <p className="text-sm text-base-content/80 leading-relaxed">
                            O Recanto utiliza estas configurações para manter os administradores cientes de novas interações. Certifique-se de que o e-mail informado tem acesso constante.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
