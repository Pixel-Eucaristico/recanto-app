'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { UserPen, Mail, Phone, User, Shield, Lock, Loader2, Info, Camera, Check, X, Palette, Sun, Moon } from 'lucide-react';
import { UploadFile } from '@/integrations/Core';
import { authService } from '@/services/firebase/AuthService';
import { userService } from '@/services/firebase/UserService';
import { useToast } from '@/components/ui/use-toast';

// Temas disponíveis categorizados e em ordem alfabética
const availableThemes = [
  { value: 'acid', label: 'Acid (Claro)' },
  { value: 'aqua', label: 'Aqua (Escuro)' },
  { value: 'autumn', label: 'Autumn (Claro)' },
  { value: 'black', label: 'Black (Escuro)' },
  { value: 'bumblebee', label: 'Bumblebee (Claro)' },
  { value: 'business', label: 'Business (Escuro)' },
  { value: 'cmyk', label: 'CMYK (Claro)' },
  { value: 'coffee', label: 'Coffee (Escuro)' },
  { value: 'corporate', label: 'Corporate (Claro)' },
  { value: 'cupcake', label: 'Cupcake (Claro)' },
  { value: 'cyberpunk', label: 'Cyberpunk (Claro)' },
  { value: 'dark', label: 'Dark (Escuro)' },
  { value: 'dim', label: 'Dim (Escuro)' },
  { value: 'dracula', label: 'Dracula (Escuro)' },
  { value: 'emerald', label: 'Emerald (Claro)' },
  { value: 'fantasy', label: 'Fantasy (Claro)' },
  { value: 'forest', label: 'Forest (Escuro)' },
  { value: 'garden', label: 'Garden (Claro)' },
  { value: 'halloween', label: 'Halloween (Escuro)' },
  { value: 'lemonade', label: 'Lemonade (Claro)' },
  { value: 'light', label: 'Light (Claro)' },
  { value: 'lofi', label: 'Lofi (Claro)' },
  { value: 'luxury', label: 'Luxury (Escuro)' },
  { value: 'night', label: 'Night (Escuro)' },
  { value: 'nord', label: 'Nord (Claro)' },
  { value: 'nossa-senhora-dark', label: 'Nossa Senhora Dark (Escuro)' },
  { value: 'nossa-senhora-light', label: 'Nossa Senhora Light (Claro)' },
  { value: 'pastel', label: 'Pastel (Claro)' },
  { value: 'recanto-dark', label: 'Recanto Dark (Escuro)' },
  { value: 'recanto-light', label: 'Recanto Light (Claro)' },
  { value: 'retro', label: 'Retro (Claro)' },
  { value: 'sunset', label: 'Sunset (Escuro)' },
  { value: 'synthwave', label: 'Synthwave (Escuro)' },
  { value: 'valentine', label: 'Valentine (Claro)' },
  { value: 'winter', label: 'Winter (Claro)' },
  { value: 'wireframe', label: 'Wireframe (Claro)' }
];

// Componente de preview de tema
const ThemePreview = ({ themeName }: { themeName: string }) => (
  <div data-theme={themeName} className="flex gap-1 h-10 w-full p-2 rounded-lg bg-base-100 border border-base-300">
    <div className="w-6 h-full rounded bg-primary" title="Primary" />
    <div className="w-6 h-full rounded bg-secondary" title="Secondary" />
    <div className="w-6 h-full rounded bg-accent" title="Accent" />
    <div className="w-6 h-full rounded bg-neutral" title="Neutral" />
  </div>
);

export default function ProfilePage() {
  const { user, authProviders, linkGoogleAccount, createLocalPassword } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados locais para edição
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '');
  const [themeLight, setThemeLight] = useState(user?.theme_light || 'recanto-light');
  const [themeDark, setThemeDark] = useState(user?.theme_dark || 'recanto-dark');
  const [birthdate, setBirthdate] = useState(user?.birthdate || '');

  // Estados de vinculação
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadFile(file);
      if (result.success && result.url) {
        setPhotoUrl(result.url);
        // Atualiza imediatamente no banco
        await authService.updateProfilePicture(user.id, result.url);
        toast({ title: "Sucesso!", description: "Foto de perfil atualizada." });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
       toast({ title: "Erro", description: "Falha ao enviar imagem.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!user) return;
      
      const payload: Record<string, unknown> = {
        name,
        phone,
        theme_light: themeLight,
        theme_dark: themeDark,
      };
      if (birthdate) payload.birthdate = birthdate;
      await userService.update(user.id, payload);
      
      toast({ title: "Perfil salvo!", description: "Suas alterações foram aplicadas com sucesso. A página será recarregada para aplicar temas." });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar as alterações.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkGoogle = async () => {
    setIsLinking(true);
    try {
      await linkGoogleAccount();
      toast({ title: "Sucesso!", description: "Conta Google vinculada com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível vincular a conta.", variant: "destructive" });
    } finally {
      setIsLinking(false);
    }
  };

  const handleCreatePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Erro", description: "A senha precisa ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setIsLinking(true);
    try {
      await createLocalPassword(newPassword);
      setShowPasswordInput(false);
      setNewPassword('');
      toast({ title: "Sucesso!", description: "Senha local criada com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível criar a senha.", variant: "destructive" });
    } finally {
      setIsLinking(false);
    }
  };

  const getInitials = (n: string) => n.split(' ').map(i => i[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <header>
        <h1 className="text-2xl font-bold text-base-content">
          Editar Perfil
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Gerencie suas informações pessoais e de segurança
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card de informações do usuário */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 border-b border-base-200 pb-8">
                {/* Avatar Section */}
                <div className="relative group">
                  <div className="avatar placeholder ring ring-primary ring-offset-base-100 ring-offset-2 rounded-full">
                    <div className="bg-neutral text-neutral-content w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center">
                      {photoUrl ? (
                        <img src={photoUrl} alt={user.name} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-3xl font-bold select-none leading-none">
                          {getInitials(user.name)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 btn btn-primary btn-circle btn-sm shadow-lg group-hover:scale-110 transition-transform"
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-base-content">{user.name}</h3>
                  <p className="text-sm opacity-60 mb-3">{user.email}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="badge badge-primary badge-sm font-bold uppercase">{user.role}</span>
                    <span className="badge badge-outline badge-sm">Membro desde {new Date(user.created_at).getFullYear()}</span>
                  </div>
                </div>
              </div>

              <h2 className="card-title text-base flex items-center gap-2 mb-4">
                <UserPen className="w-4 h-4" />
                Dados Cadastrais
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <fieldset className="fieldset gap-4 p-0">
                  {/* Nome */}
                  <div className="w-full">
                    <label className="fieldset-label font-bold text-base-content/70">Nome Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input input-bordered w-full h-11"
                      placeholder="Digite seu nome completo"
                    />
                  </div>

                  {/* Email */}
                  <div className="w-full">
                    <label className="fieldset-label font-bold text-base-content/70">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      className="input input-bordered w-full h-11 opacity-50 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  {/* Telefone */}
                  <div className="w-full">
                    <label className="fieldset-label font-bold text-base-content/70">Telefone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input input-bordered w-full h-11"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  {/* Data de nascimento */}
                  <div className="w-full">
                    <label className="fieldset-label font-bold text-base-content/70">Data de nascimento</label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="input input-bordered w-full h-11"
                    />
                    <span className="text-[11px] text-base-content/60 mt-1 block">
                      Usada para liberar conteúdos por classificação indicativa.
                    </span>
                  </div>
                </fieldset>

                <div className="divider opacity-50 my-6">Personalização Visual</div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-base-content m-0">Temas do Painel</h3>
                </div>
                
                <fieldset className="fieldset bg-base-200/50 p-5 rounded-box border border-base-300 gap-4">
                  <legend className="fieldset-legend text-[10px] font-bold uppercase opacity-60 flex gap-2"><Sun className="w-3 h-3"/> Modo Claro</legend>
                  <div className="w-full">
                     <select 
                        className="select select-bordered w-full bg-base-100" 
                        value={themeLight} 
                        onChange={(e) => setThemeLight(e.target.value)}
                      >
                        {availableThemes.map((theme) => (
                          <option key={theme.value} value={theme.value}>{theme.label}</option>
                        ))}
                     </select>
                  </div>
                  {themeLight && (
                    <div className="mt-1">
                      <span className="text-[10px] font-bold uppercase opacity-50 mb-1 block">Pré-visualização:</span>
                      <ThemePreview themeName={themeLight} />
                    </div>
                  )}
                </fieldset>

                <fieldset className="fieldset bg-base-200/50 p-5 rounded-box border border-base-300 gap-4 mt-4">
                  <legend className="fieldset-legend text-[10px] font-bold uppercase opacity-60 flex gap-2"><Moon className="w-3 h-3"/> Modo Escuro</legend>
                  <div className="w-full">
                     <select 
                        className="select select-bordered w-full bg-base-100" 
                        value={themeDark} 
                        onChange={(e) => setThemeDark(e.target.value)}
                      >
                        {availableThemes.map((theme) => (
                          <option key={theme.value} value={theme.value}>{theme.label}</option>
                        ))}
                     </select>
                  </div>
                   {themeDark && (
                    <div className="mt-1">
                      <span className="text-[10px] font-bold uppercase opacity-50 mb-1 block">Pré-visualização:</span>
                      <ThemePreview themeName={themeDark} />
                    </div>
                  )}
                </fieldset>

                <div className="card-actions justify-end mt-4">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { 
                    setName(user.name); 
                    setPhone(user.phone || ''); 
                    setThemeLight(user.theme_light || 'recanto-light');
                    setThemeDark(user.theme_dark || 'recanto-dark');
                  }}>
                    Resetar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-8" disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Card de segurança */}
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-6">
              <h2 className="card-title text-base flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                Segurança e Acesso
              </h2>

              <div className="flex flex-col gap-3">
                {authProviders?.includes('password') ? (
                  <button className="btn btn-outline btn-sm justify-start gap-3">
                    <Lock className="w-4 h-4 opacity-50" />
                    Alterar Senha de Acesso
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm opacity-70">Você acessou usando o Google. Que tal criar uma senha parar logar diretamente no futuro?</p>
                    {showPasswordInput ? (
                       <div className="flex gap-2">
                         <input 
                           type="password" 
                           placeholder="Nova Senha (mín. 6)" 
                           className="input input-sm input-bordered w-full" 
                           value={newPassword}
                           onChange={(e) => setNewPassword(e.target.value)}
                         />
                         <button 
                           onClick={handleCreatePassword} 
                           className="btn btn-primary btn-sm"
                           disabled={isLinking || newPassword.length < 6}
                         >
                           {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                         </button>
                         <button onClick={() => setShowPasswordInput(false)} className="btn btn-ghost btn-sm px-2 text-error">
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                    ) : (
                      <button onClick={() => setShowPasswordInput(true)} className="btn btn-outline btn-sm justify-start gap-3">
                        <Lock className="w-4 h-4 opacity-50" />
                        Criar Senha Local
                      </button>
                    )}
                  </div>
                )}

                {/* Google link / unlink status */}
                {!authProviders?.includes('google.com') ? (
                  <button 
                    onClick={handleLinkGoogle} 
                    className="btn btn-outline btn-sm justify-start gap-3 w-full sm:w-auto"
                    disabled={isLinking}
                  >
                    {isLinking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="font-bold flex items-center justify-center bg-white text-black w-4 h-4 rounded-full text-[10px]">G</span>
                    )}
                    Vincular Conta Google
                  </button>
                ) : (
                  <button className="btn btn-ghost btn-sm justify-start gap-3 w-full sm:w-auto text-success opacity-80 pointer-events-none">
                    <Check className="w-4 h-4" />
                    Conta Google Vinculada
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Badge */}
          <div className="card bg-primary text-primary-content shadow-sm overflow-hidden border-none">
            <div className="absolute top-0 right-0 p-2 opacity-10">
               <Shield className="w-20 h-20 -mr-4 -mt-4" />
            </div>
            <div className="card-body p-5">
              <h3 className="text-[10px] font-bold uppercase opacity-80 tracking-widest mb-1">Status da Conta</h3>
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 p-1 bg-white/20 rounded-full" />
                <div>
                  <p className="font-black text-xl leading-tight uppercase">{user.role}</p>
                  <p className="text-[10px] opacity-80 font-bold tracking-tight">Verificado pelo Recanto</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Adicionais */}
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h3 className="text-[10px] font-bold uppercase opacity-40 mb-4 tracking-widest">
                Informações de Registro
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="text-[10px] text-base-content/40 font-bold uppercase mb-0.5">ID Único</p>
                    <code className="text-[11px] text-base-content/70 font-mono break-all leading-none bg-base-200 px-1 py-0.5 rounded">
                      {user.id}
                    </code>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="text-[10px] text-base-content/40 font-bold uppercase mb-0.5">Criado em</p>
                    <p className="text-sm text-base-content font-bold">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dica */}
          <div className="alert bg-base-200 border-base-300 p-4 flex items-start gap-3 rounded-xl">
             <Info className="w-4 h-4 shrink-0 text-primary mt-0.5" />
             <div className="text-[11px]">
                <h3 className="font-bold text-base-content mb-0.5 uppercase tracking-wide">Privacidade</h3>
                <div className="opacity-60 leading-relaxed italic">
                  Sua foto e dados são visíveis apenas para os administradores do sistema.
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
