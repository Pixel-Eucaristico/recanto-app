'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CMSPage } from '@/types/cms-types';
import { Settings, X, Sun, Moon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as LucideIcons from 'lucide-react';

interface PageMenuConfigProps {
  page: CMSPage;
  onSave: (updates: Partial<CMSPage>) => Promise<void>;
}

export function PageMenuConfig({ page, onSave }: PageMenuConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    menu_description: page.menu_description || '',
    menu_icon: page.menu_icon || '',
    menu_url_type: page.menu_url_type || 'page',
    menu_external_url: page.menu_external_url || '',
    theme_light: page.theme_light || '',
    theme_dark: page.theme_dark || '',
  });

  // Detectar tema atual do DaisyUI - sempre observando
  const [currentTheme, setCurrentTheme] = useState<string>('');

  useEffect(() => {
    // Buscar o tema em vários lugares possíveis
    const detectTheme = () => {
      // Procurar no html, body, ou em qualquer elemento pai com data-theme
      let theme = document.documentElement.getAttribute('data-theme');

      if (!theme) {
        theme = document.body.getAttribute('data-theme');
      }

      if (!theme) {
        // Buscar em elementos pais
        const elementsWithTheme = document.querySelectorAll('[data-theme]');
        if (elementsWithTheme.length > 0) {
          theme = elementsWithTheme[elementsWithTheme.length - 1].getAttribute('data-theme');
        }
      }

      // Fallback para tema padrão
      if (!theme) {
        theme = 'recanto-light';
      }

      console.log('🎨 Tema detectado:', theme);
      setCurrentTheme(theme);
    };

    // Detectar tema inicial
    detectTheme();

    // Observer para detectar mudanças de tema em tempo real
    const observer = new MutationObserver(() => {
      console.log('🔄 Mudança de tema detectada');
      detectTheme();
    });

    // Observar todos os elementos que podem ter data-theme
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // Observar também mudanças no DOM que podem adicionar elementos com data-theme
    const allElementsWithTheme = document.querySelectorAll('[data-theme]');
    allElementsWithTheme.forEach(el => {
      observer.observe(el, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    });

    return () => observer.disconnect();
  }, []); // Observar sempre, não apenas quando modal abre

  // Bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const availableIcons = [
    { name: 'Sunset', label: 'Pôr do Sol' },
    { name: 'Crown', label: 'Coroa' },
    { name: 'TreePine', label: 'Árvore' },
    { name: 'Trees', label: 'Árvores' },
    { name: 'Palmtree', label: 'Palmeira' },
    { name: 'Book', label: 'Livro' },
    { name: 'BookOpen', label: 'Livro Aberto' },
    { name: 'Zap', label: 'Raio' },
    { name: 'Heart', label: 'Coração' },
    { name: 'Home', label: 'Casa' },
    { name: 'Users', label: 'Pessoas' },
    { name: 'Calendar', label: 'Calendário' },
    { name: 'Mail', label: 'Email' },
    { name: 'Phone', label: 'Telefone' },
    { name: 'Gift', label: 'Presente' },
    { name: 'Star', label: 'Estrela' },
    { name: 'Settings', label: 'Configurações' },
    { name: 'Globe', label: 'Globo' },
    { name: 'Link', label: 'Link' },
    { name: 'ExternalLink', label: 'Link Externo' },
    { name: 'FileText', label: 'Documento' },
    { name: 'Image', label: 'Imagem' },
    { name: 'Video', label: 'Vídeo' },
    { name: 'Music', label: 'Música' },
    { name: 'Cross', label: 'Cruz' },
    { name: 'Church', label: 'Igreja' },
    { name: 'Handshake', label: 'Aperto de Mão' },
    { name: 'MessageCircle', label: 'Mensagem' },
  ];

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

  // Componente de preview de tema com cores semânticas
  const ThemePreview = ({ themeName }: { themeName: string }) => (
    <div data-theme={themeName} className="flex gap-1">
      <div className="w-3 h-3 rounded bg-primary" title="Primary" />
      <div className="w-3 h-3 rounded bg-secondary" title="Secondary" />
      <div className="w-3 h-3 rounded bg-accent" title="Accent" />
      <div className="w-3 h-3 rounded bg-neutral" title="Neutral" />
    </div>
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(config);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving menu config:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <>
      {/* Botão para abrir modal - Responsivo */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-sm btn-ghost gap-2 w-full justify-start md:justify-center md:w-auto"
        title="Configurações de menu"
      >
        <Settings className="w-4 h-4" />
        <span className="md:hidden">Configurar Menu</span>
      </button>

      {/* Full Screen Overlay - Renderizado no body via Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] w-screen h-screen max-w-none max-h-none m-0 p-0 bg-base-100 md:bg-black/50 md:flex md:items-center md:justify-center" data-theme={currentTheme}>
          {/* Content Container */}
          <div className="w-screen h-screen max-w-none max-h-none m-0 p-0 flex flex-col bg-base-100 md:w-11/12 md:max-w-2xl md:h-auto md:max-h-[90vh] md:rounded-2xl md:shadow-2xl md:m-4 border border-base-300">
            {/* Header */}
            <div className="flex-shrink-0 bg-base-100 border-b border-base-300 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg md:text-xl pr-4">
                  Configurações de Menu
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-sm btn-circle btn-ghost flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-base-content/60 mt-1">{page.title}</p>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* Tipo de URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">Tipo de Link</span>
                </label>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  <label className="label cursor-pointer gap-3 min-h-[48px] p-3 border border-base-300 rounded-lg hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="menu_url_type"
                      className="radio radio-primary"
                      checked={config.menu_url_type === 'page'}
                      onChange={() => setConfig({ ...config, menu_url_type: 'page' })}
                    />
                    <span className="label-text text-base">Página do CMS</span>
                  </label>
                  <label className="label cursor-pointer gap-3 min-h-[48px] p-3 border border-base-300 rounded-lg hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="menu_url_type"
                      className="radio radio-primary"
                      checked={config.menu_url_type === 'external'}
                      onChange={() => setConfig({ ...config, menu_url_type: 'external' })}
                    />
                    <span className="label-text text-base">URL Externa</span>
                  </label>
                </div>
              </div>

              {/* URL Externa */}
              {config.menu_url_type === 'external' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base">URL Externa</span>
                  </label>
                  <input
                    type="url"
                    className="input input-bordered w-full min-h-[48px] text-base"
                    placeholder="https://exemplo.com"
                    value={config.menu_external_url}
                    onChange={(e) => setConfig({ ...config, menu_external_url: e.target.value })}
                  />
                  <label className="label">
                    <span className="label-text-alt text-sm">
                      Digite a URL completa incluindo http:// ou https://
                    </span>
                  </label>
                </div>
              )}

              {/* URL da Página (readonly) */}
              {config.menu_url_type === 'page' && (
                <div className="alert alert-info">
                  <span className="text-sm">
                    <strong>URL da página:</strong> {page.slug}
                  </span>
                </div>
              )}

              {/* Descrição */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">Descrição no Menu</span>
                  <span className="label-text-alt text-sm text-base-content/60">
                    (Aparece em submenus)
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered min-h-[80px] text-base"
                  placeholder="Breve descrição desta página..."
                  rows={3}
                  value={config.menu_description}
                  onChange={(e) => setConfig({ ...config, menu_description: e.target.value })}
                />
              </div>

              {/* Ícone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">Ícone</span>
                  <span className="label-text-alt text-sm text-base-content/60">
                    (Para submenus)
                  </span>
                </label>

                {/* Preview do ícone selecionado */}
                {config.menu_icon && (
                  <div className="alert alert-info mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {renderIcon(config.menu_icon)}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {availableIcons.find(i => i.name === config.menu_icon)?.label || config.menu_icon}
                        </div>
                        <div className="text-xs opacity-70">Ícone selecionado</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid de ícones - Responsive */}
                <div className="grid grid-cols-5 md:grid-cols-6 gap-3 p-4 border border-base-300 rounded-lg max-h-80 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, menu_icon: '' })}
                    className={`btn btn-square min-h-[48px] min-w-[48px] ${!config.menu_icon ? 'btn-primary' : 'btn-ghost'}`}
                    title="Sem ícone"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {availableIcons.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setConfig({ ...config, menu_icon: icon.name })}
                      className={`btn btn-square min-h-[48px] min-w-[48px] ${
                        config.menu_icon === icon.name ? 'btn-primary' : 'btn-ghost'
                      }`}
                      title={icon.label}
                    >
                      {renderIcon(icon.name)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temas da Página */}
              <div className="divider">Temas da Página</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tema Light */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Modo Claro
                    </span>
                  </label>

                  {config.theme_light && (
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg mb-2">
                      <ThemePreview themeName={config.theme_light} />
                      <span className="text-sm font-semibold">
                        {availableThemes.find(t => t.value === config.theme_light)?.label}
                      </span>
                    </div>
                  )}

                  <select
                    className="select select-bordered w-full min-h-[48px] text-base"
                    value={config.theme_light}
                    onChange={(e) => setConfig({ ...config, theme_light: e.target.value })}
                  >
                    <option value="">Padrão do sistema</option>
                    {availableThemes.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tema Dark */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Modo Escuro
                    </span>
                  </label>

                  {config.theme_dark && (
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg mb-2">
                      <ThemePreview themeName={config.theme_dark} />
                      <span className="text-sm font-semibold">
                        {availableThemes.find(t => t.value === config.theme_dark)?.label}
                      </span>
                    </div>
                  )}

                  <select
                    className="select select-bordered w-full min-h-[48px] text-base"
                    value={config.theme_dark}
                    onChange={(e) => setConfig({ ...config, theme_dark: e.target.value })}
                  >
                    <option value="">Padrão do sistema</option>
                    {availableThemes.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="alert alert-info mt-3">
                <Info className="w-5 h-5" />
                <div className="text-xs">
                  <strong>Dica:</strong> Escolha temas diferentes para Light e Dark ou deixe vazio para usar o padrão do sistema.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-base-100 border-t border-base-300 p-4 md:p-6">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost flex-1 md:flex-initial min-h-[52px]"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex-1 md:flex-initial min-h-[52px]"
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    'Salvar Configurações'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
