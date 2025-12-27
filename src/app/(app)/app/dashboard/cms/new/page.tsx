'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentPageService } from '@/services/firebase';
import { ArrowLeft, Plus } from 'lucide-react';

export default function NewCMSPagePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: ''
  });
  const [slugType, setSlugType] = useState<'home' | 'custom'>('home');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('O título é obrigatório');
      return;
    }

    if (!formData.slug.trim()) {
      setError('A URL é obrigatória');
      return;
    }

    // Preparar slug final baseado no tipo selecionado
    let finalSlug = formData.slug;
    if (slugType === 'home') {
      // Página interna: adicionar "/" se não tiver
      if (!finalSlug.startsWith('/')) {
        finalSlug = `/${finalSlug}`;
      }
    }

    // BLOQUEAR criação de páginas em rotas protegidas
    if (finalSlug.startsWith('/app')) {
      setError('Não é permitido criar páginas CMS em /app/* - essa área é reservada para o dashboard');
      return;
    }

    // Validate slug format
    // Se for URL externa (começa com http), permite qualquer formato
    // Se for interna, valida formato de slug
    if (!finalSlug.startsWith('http')) {
      const slugRegex = /^[a-z0-9\-\/]+$/;
      if (!slugRegex.test(finalSlug)) {
        setError('URLs internas devem conter apenas letras minúsculas, números, hífens e barras');
        return;
      }
    }

    try {
      setIsCreating(true);

      // Create new page with empty blocks array
      const newPage = await contentPageService.create({
        title: formData.title,
        slug: finalSlug,
        description: formData.description || null,
        blocks: [],
        is_published: false
      });

      // Redirect to edit page
      router.push(`/app/dashboard/cms/${newPage.id}/edit`);
    } catch (err: any) {
      console.error('Error creating page:', err);
      setError(err.message || 'Erro ao criar página');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSlugChange = (value: string) => {
    // Se for URL externa (começa com http), não formatar
    if (value.startsWith('http')) {
      setFormData({ ...formData, slug: value });
      return;
    }

    // Auto-format slug interno: remove spaces, convert to lowercase, replace special chars
    let formattedSlug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-\/]/g, '')
      .replace(/^\/+/, ''); // Remove barras do início (usuário não precisa digitá-las)

    setFormData({ ...formData, slug: formattedSlug });
  };

  return (
    <div className="container mx-auto p-3 md:p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link href="/app/dashboard/cms" className="btn btn-ghost btn-sm gap-2 mb-3 md:mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Criar Nova Página</h1>
        <p className="text-base-content/60 mt-1 text-sm md:text-base">
          Defina as informações básicas da página. Você poderá adicionar blocos na próxima etapa.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4 p-4 md:p-6">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Título da Página *</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Sobre Nós, Contato, Galeria de Fotos"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                O título aparecerá no navegador e nos resultados de busca
              </span>
            </label>
          </div>

          {/* Slug - Join do DaisyUI */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">URL *</span>
            </label>
            <div className="join w-full">
              <select
                className="select select-bordered join-item w-24"
                value={slugType}
                onChange={(e) => {
                  const newType = e.target.value as 'home' | 'custom';
                  setSlugType(newType);
                  // Não alterar o campo slug ao mudar o tipo
                }}
              >
                <option value="home">/</option>
                <option value="custom">URL</option>
              </select>
              <input
                type="text"
                placeholder={slugType === 'home' ? 'sobre-nos' : 'https://exemplo.com'}
                className="input input-bordered join-item flex-1"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
              />
            </div>
            <label className="label">
              <span className="label-text-alt text-base-content/60 text-xs md:text-sm">
                {slugType === 'home'
                  ? '✓ A barra "/" será adicionada automaticamente. Digite apenas: sobre, contatos, etc.'
                  : 'URL externa completa: "https://exemplo.com"'
                }
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Descrição (opcional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Breve descrição da página para SEO"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Esta descrição aparecerá nos resultados de busca (recomendado 150-160 caracteres)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="card-actions justify-end pt-4">
            <Link href="/app/dashboard/cms" className="btn btn-ghost">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Criar e Editar Página
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
