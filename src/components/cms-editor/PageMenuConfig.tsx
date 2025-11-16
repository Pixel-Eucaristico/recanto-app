'use client';

import { useState } from 'react';
import { CMSPage } from '@/types/cms-types';
import { Settings, X } from 'lucide-react';
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

  const availableIcons = [
    { name: 'Sunset', label: 'Pôr do Sol' },
    { name: 'Crown', label: 'Coroa' },
    { name: 'Trees', label: 'Árvores' },
    { name: 'Book', label: 'Livro' },
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

  // Temas disponíveis (sem cores hardcoded - usa variáveis CSS do DaisyUI)
  const availableThemes = [
    // Temas customizados
    { value: 'recanto-light', label: 'Recanto Light' },
    { value: 'recanto-dark', label: 'Recanto Dark' },
    { value: 'nossa-senhora-light', label: 'Nossa Senhora Light' },
    { value: 'nossa-senhora-dark', label: 'Nossa Senhora Dark' },
    // Temas DaisyUI
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
      {/* Botão para abrir modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-sm btn-ghost gap-1"
        title="Configurações de menu"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                Configurações de Menu: {page.title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Tipo de URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Tipo de Link</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="menu_url_type"
                      className="radio radio-primary"
                      checked={config.menu_url_type === 'page'}
                      onChange={() => setConfig({ ...config, menu_url_type: 'page' })}
                    />
                    <span className="label-text">Página do CMS</span>
                  </label>
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="menu_url_type"
                      className="radio radio-primary"
                      checked={config.menu_url_type === 'external'}
                      onChange={() => setConfig({ ...config, menu_url_type: 'external' })}
                    />
                    <span className="label-text">URL Externa</span>
                  </label>
                </div>
              </div>

              {/* URL Externa */}
              {config.menu_url_type === 'external' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">URL Externa</span>
                  </label>
                  <input
                    type="url"
                    className="input input-bordered w-full"
                    placeholder="https://exemplo.com"
                    value={config.menu_external_url}
                    onChange={(e) => setConfig({ ...config, menu_external_url: e.target.value })}
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      {config.menu_url_type === 'page'
                        ? `URL atual: ${page.slug}`
                        : 'Digite a URL completa incluindo http:// ou https://'}
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
                  <span className="label-text">Descrição no Menu</span>
                  <span className="label-text-alt text-base-content/60">
                    (Aparece em submenus)
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Breve descrição desta página..."
                  rows={2}
                  value={config.menu_description}
                  onChange={(e) => setConfig({ ...config, menu_description: e.target.value })}
                />
              </div>

              {/* Ícone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Ícone</span>
                  <span className="label-text-alt text-base-content/60">
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

                {/* Grid de ícones */}
                <div className="grid grid-cols-5 gap-2 p-3 border border-base-300 rounded-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, menu_icon: '' })}
                    className={`btn btn-sm btn-square ${!config.menu_icon ? 'btn-primary' : 'btn-ghost'}`}
                    title="Sem ícone"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {availableIcons.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setConfig({ ...config, menu_icon: icon.name })}
                      className={`btn btn-sm btn-square ${
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
                    <span className="label-text font-semibold">☀️ Modo Claro</span>
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
                    className="select select-bordered w-full"
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
                    <span className="label-text font-semibold">🌙 Modo Escuro</span>
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
                    className="select select-bordered w-full"
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
                <div className="text-xs">
                  <strong>💡 Dica:</strong> Escolha temas diferentes para Light e Dark ou deixe vazio para usar o padrão do sistema.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-action">
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost"
                disabled={saving}
              >
                Cancelar
              </button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
