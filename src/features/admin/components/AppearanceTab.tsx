'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Info } from 'lucide-react';
import { appConfigService, AppGlobalConfigType } from '@/services/firebase/AppConfigService';
import { useToast } from "@/components/ui/use-toast";

// Temas disponíveis (mesmos usados em PageMenuConfig)
const availableThemes = [
  { value: 'recanto-light', label: 'Recanto Light' },
  { value: 'recanto-dark', label: 'Recanto Dark' },
  { value: 'nossa-senhora-light', label: 'Nossa Senhora Light' },
  { value: 'nossa-senhora-dark', label: 'Nossa Senhora Dark' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'cupcake', label: 'Cupcake' },
  { value: 'bumblebee', label: 'Bumblebee' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'synthwave', label: 'Synthwave' },
  { value: 'retro', label: 'Retro' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'valentine', label: 'Valentine' },
  { value: 'halloween', label: 'Halloween' },
  { value: 'garden', label: 'Garden' },
  { value: 'forest', label: 'Forest' },
  { value: 'aqua', label: 'Aqua' },
  { value: 'lofi', label: 'Lofi' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'black', label: 'Black' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'cmyk', label: 'CMYK' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'business', label: 'Business' },
  { value: 'acid', label: 'Acid' },
  { value: 'lemonade', label: 'Lemonade' },
  { value: 'night', label: 'Night' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'winter', label: 'Winter' },
  { value: 'dim', label: 'Dim' },
  { value: 'nord', label: 'Nord' },
  { value: 'sunset', label: 'Sunset' },
];

// Componente de preview de tema com cores semânticas
const ThemePreview = ({ themeName }: { themeName: string }) => (
  <div data-theme={themeName} className="flex gap-1 h-10 w-full p-2 rounded-lg bg-base-100 border border-base-300">
    <div className="w-6 h-full rounded bg-primary" title="Primary" />
    <div className="w-6 h-full rounded bg-secondary" title="Secondary" />
    <div className="w-6 h-full rounded bg-accent" title="Accent" />
    <div className="w-6 h-full rounded bg-neutral" title="Neutral" />
  </div>
);

export default function AppearanceTab() {
  const { toast } = useToast();
  const [config, setConfig] = useState<AppGlobalConfigType>({
      id: 'global',
      dashboard_theme_light: 'recanto-light',
      dashboard_theme_dark: 'recanto-dark',
      updated_at: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await appConfigService.getGlobalConfig();
        setConfig(data);
      } catch (error) {
        console.error("Error loading config:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await appConfigService.updateGlobalConfig({
        dashboard_theme_light: config.dashboard_theme_light,
        dashboard_theme_dark: config.dashboard_theme_dark,
      });
      toast({ title: "Sucesso!", description: "Temas do painel atualizados. Recarregando..." });
      
      // Force some data-theme updates to preview live if possible
      document.documentElement.setAttribute('data-theme', config.dashboard_theme_light); 
      // Em modo escuro real isso seria config.dashboard_theme_dark. Deixando para o Provider oficial resolver a longo termo no reload.
      
      // Refresh the page after a short delay so the user can see the success toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar aparência.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            <h3 className="card-title text-lg font-bold text-base-content m-0">Aparência do Dashboard</h3>
          </div>
          
          <p className="text-sm text-base-content/70">
            Personalize as cores deste painel administrativo. Você pode definir os temas DaisyUI exatos que o sistema usará para as versões Claro e Escuro.
          </p>

          <fieldset className="fieldset bg-base-200/50 p-5 rounded-box border border-base-300 gap-4 mt-2">
            <legend className="fieldset-legend text-[10px] font-bold uppercase opacity-60 flex gap-2"><Sun className="w-3 h-3"/> Dashboard Modo Claro</legend>
            <div className="w-full">
               <select 
                  className="select select-bordered w-full bg-base-100" 
                  value={config.dashboard_theme_light} 
                  onChange={(e) => setConfig({ ...config, dashboard_theme_light: e.target.value })}
                >
                  {availableThemes.map((theme) => (
                    <option key={theme.value} value={theme.value}>{theme.label}</option>
                  ))}
               </select>
            </div>
            {config.dashboard_theme_light && (
              <div className="mt-1">
                <span className="text-[10px] font-bold uppercase opacity-50 mb-1 block">Pré-visualização das Cores do Tema:</span>
                <ThemePreview themeName={config.dashboard_theme_light} />
              </div>
            )}
          </fieldset>

          <fieldset className="fieldset bg-base-200/50 p-5 rounded-box border border-base-300 gap-4 mt-2">
            <legend className="fieldset-legend text-[10px] font-bold uppercase opacity-60 flex gap-2"><Moon className="w-3 h-3"/> Dashboard Modo Escuro</legend>
            <div className="w-full">
               <select 
                  className="select select-bordered w-full bg-base-100" 
                  value={config.dashboard_theme_dark} 
                  onChange={(e) => setConfig({ ...config, dashboard_theme_dark: e.target.value })}
                >
                  {availableThemes.map((theme) => (
                    <option key={theme.value} value={theme.value}>{theme.label}</option>
                  ))}
               </select>
            </div>
             {config.dashboard_theme_dark && (
              <div className="mt-1">
                <span className="text-[10px] font-bold uppercase opacity-50 mb-1 block">Pré-visualização das Cores do Tema:</span>
                <ThemePreview themeName={config.dashboard_theme_dark} />
              </div>
            )}
          </fieldset>

          <div className="card-actions justify-end mt-4">
            <button className="btn btn-primary px-8" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <span className="loading loading-spinner loading-xs"></span> : "Salvar Aparência"}
            </button>
          </div>
        </div>
      </div>

      {/* Coluna Direita: API / Info */}
      <div className="flex flex-col gap-6">
        <div className="p-5 rounded-xl bg-info/5 border border-info/20 flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-info" />
            <div className="flex-1">
                <h4 className="font-bold text-info text-[10px] uppercase tracking-wider mb-1">Dica de Tema</h4>
                <p className="text-[11px] text-base-content/70 leading-relaxed italic">
                    Ao salvar, o sistema começará a usar esses temas para todo o painel interno. Os visitantes do seu site (área externa) continuarão vendo os temas que você cadastrou página por página no construtor de páginas CMS.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
