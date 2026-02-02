'use client';

import React from 'react';
import { CheckCircle2, Mail, Info } from 'lucide-react';
import { useAdminEmail } from '../hooks/useAdminEmail';

export default function EmailTab() {
    const { config, setConfig, isLoading, isSaving, gmailStatus, saveConfig, disconnectGmail } = useAdminEmail();

    if (isLoading) return (
        <div className="flex justify-center p-10">
            <span className="loading loading-spinner text-primary"></span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Coluna Esquerda: Configurações */}
            <div className="card bg-base-100 shadow-sm border border-base-300">
                <div className="card-body gap-6 p-6">
                    <h3 className="card-title text-lg font-bold text-base-content">Configurações de E-mail</h3>
                    
                    <fieldset className="fieldset bg-base-200/50 p-5 rounded-box border border-base-300 gap-4">
                        <legend className="fieldset-legend text-[10px] font-bold uppercase opacity-60">Identidade</legend>
                        
                        <div className="w-full">
                            <label className="fieldset-label font-bold text-xs text-base-content/70 mb-1">Nome do Remetente</label>
                            <input 
                                className="input input-bordered w-full bg-base-100" 
                                placeholder="Ex: Admin Recanto"
                                value={config.name || ''} 
                                onChange={(e) => setConfig({ ...config, name: e.target.value })} 
                            />
                        </div>

                        <div className="w-full">
                            <label className="fieldset-label font-bold text-xs text-base-content/70 mb-1">E-mail de Notificação</label>
                            <input 
                                className="input input-bordered w-full bg-base-100" 
                                type="email" 
                                placeholder="admin@recanto.org"
                                value={config.email || ''} 
                                onChange={(e) => setConfig({ ...config, email: e.target.value })} 
                            />
                        </div>

                        <div className="w-full">
                            <label className="fieldset-label font-bold text-xs text-base-content/70 mb-1">Provedor</label>
                            <select 
                                className="select select-bordered w-full bg-base-100 h-[38px] min-h-0" 
                                value={config.provider || 'gmail'} 
                                onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                            >
                                <option value="gmail">Gmail API</option>
                                <option value="smtp">SMTP Manual</option>
                            </select>
                        </div>

                        {/* Configurações SMTP (Visível apenas se provedor for SMTP) */}
                        {config.provider === 'smtp' && (
                            <div className="animate-in slide-in-from-top-2 duration-300 flex flex-col gap-4 mt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="w-full">
                                        <label className="fieldset-label font-bold text-[10px] uppercase opacity-60 mb-1">Servidor SMTP</label>
                                        <input 
                                            className="input input-bordered w-full bg-base-100 h-[38px]" 
                                            placeholder="smtp.example.com"
                                            value={config.smtp?.host || ''} 
                                            onChange={(e) => setConfig({ 
                                                ...config, 
                                                smtp: { ...(config.smtp || { host: '', port: 587, user: '', pass: '' }), host: e.target.value } 
                                            })} 
                                        />
                                    </div>
                                    <div className="w-full">
                                        <label className="fieldset-label font-bold text-[10px] uppercase opacity-60 mb-1">Porta</label>
                                        <input 
                                            className="input input-bordered w-full bg-base-100 h-[38px]" 
                                            type="number"
                                            placeholder="587"
                                            value={config.smtp?.port || ''} 
                                            onChange={(e) => setConfig({ 
                                                ...config, 
                                                smtp: { ...(config.smtp || { host: '', port: 587, user: '', pass: '' }), port: parseInt(e.target.value) } 
                                            })} 
                                        />
                                    </div>
                                </div>

                                <div className="w-full">
                                    <label className="fieldset-label font-bold text-[10px] uppercase opacity-60 mb-1">Usuário / E-mail</label>
                                    <input 
                                        className="input input-bordered w-full bg-base-100 h-[38px]" 
                                        placeholder="user@example.com"
                                        value={config.smtp?.user || ''} 
                                        onChange={(e) => setConfig({ 
                                            ...config, 
                                            smtp: { ...(config.smtp || { host: '', port: 587, user: '', pass: '' }), user: e.target.value } 
                                        })} 
                                    />
                                </div>

                                <div className="w-full">
                                    <label className="fieldset-label font-bold text-[10px] uppercase opacity-60 mb-1">Senha / Token de App</label>
                                    <input 
                                        className="input input-bordered w-full bg-base-100 h-[38px]" 
                                        type="password"
                                        placeholder="••••••••"
                                        value={config.smtp?.pass || ''} 
                                        onChange={(e) => setConfig({ 
                                            ...config, 
                                            smtp: { ...(config.smtp || { host: '', port: 587, user: '', pass: '' }), pass: e.target.value } 
                                        })} 
                                    />
                                </div>
                            </div>
                        )}
                    </fieldset>

                    <fieldset className="fieldset bg-base-200/50 p-5 rounded-box border border-base-300 gap-3">
                        <legend className="fieldset-legend text-[10px] font-bold uppercase opacity-60">Alertas Automáticos</legend>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-sm checkbox-primary" 
                                    checked={config.notify_on_contact} 
                                    onChange={(e) => setConfig({ ...config, notify_on_contact: e.target.checked })} 
                                />
                                <span className="label-text text-sm group-hover:text-primary transition-colors">Novos contatos do site</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-sm checkbox-primary" 
                                    checked={config.notify_on_story} 
                                    onChange={(e) => setConfig({ ...config, notify_on_story: e.target.checked })} 
                                />
                                <span className="label-text text-sm group-hover:text-primary transition-colors">Novos depoimentos</span>
                            </label>
                        </div>
                    </fieldset>

                    <div className="card-actions justify-end">
                        <button className="btn btn-primary btn-md px-8" onClick={() => saveConfig(config)} disabled={isSaving}>
                            {isSaving ? <span className="loading loading-spinner loading-xs"></span> : "Salvar Tudo"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Coluna Direita: API */}
            <div className="flex flex-col gap-6">
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-6">
                        <h3 className="card-title text-lg font-bold text-base-content mb-2">Conexão Gmail</h3>
                        
                        {gmailStatus?.connected ? (
                            <div className="p-5 rounded-xl bg-success/5 border border-success/20 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 shrink-0 text-success" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-success text-sm">Gmail Conectado</h4>
                                    <p className="text-xs opacity-70 text-base-content mt-1">Envios via API oficial ativos.</p>
                                    <button 
                                        className="btn btn-link btn-xs mt-2 p-0 h-auto text-error no-underline hover:underline" 
                                        onClick={() => { if(confirm('Desconectar conta?')) disconnectGmail(); }}
                                    >
                                        Desconectar Google
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs text-base-content/60 leading-relaxed italic">
                                    Conecte sua conta Google para evitar que e-mails caiam no SPAM.
                                </p>
                                <button className="btn btn-outline btn-sm btn-block gap-2 border-base-300" onClick={() => window.location.href = '/api/gmail/auth'}>
                                    <Mail className="w-4 h-4 shrink-0" /> Autorizar Google
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 rounded-xl bg-info/5 border border-info/20 flex items-start gap-3">
                    <Info className="w-5 h-5 shrink-0 text-info" />
                    <div className="flex-1">
                        <h4 className="font-bold text-info text-[10px] uppercase tracking-wider mb-1">Aviso</h4>
                        <p className="text-[11px] text-base-content/70 leading-relaxed italic">
                            O sistema utiliza estas configurações para alertas administrativos. Verifique se o e-mail informado está correto.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
