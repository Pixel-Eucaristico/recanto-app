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
      setError('O slug é obrigatório');
      return;
    }

    // Validate slug format (only lowercase letters, numbers, hyphens, and slashes)
    const slugRegex = /^[a-z0-9\-\/]+$/;
    if (!slugRegex.test(formData.slug)) {
      setError('O slug deve conter apenas letras minúsculas, números, hífens e barras');
      return;
    }

    try {
      setIsCreating(true);

      // Create new page with empty blocks array
      const newPage = await contentPageService.create({
        title: formData.title,
        slug: formData.slug.startsWith('/') ? formData.slug : `/${formData.slug}`,
        description: formData.description || undefined,
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
    // Special case for home page
    if (value.trim() === '/' || value.trim() === '') {
      setFormData({ ...formData, slug: value.trim() || '/' });
      return;
    }

    // Auto-format slug: remove spaces, convert to lowercase, replace special chars
    const formattedSlug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-\/]/g, '');

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

          {/* Slug */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Slug (URL) *</span>
            </label>
            <div className="flex w-full gap-1">
              {/* Mobile: apenas "/" */}
              <span className="md:hidden flex-shrink-0 flex items-center px-3 py-2 bg-base-200 rounded-l-lg text-base-content/60 text-sm">
                /
              </span>
              {/* Desktop: origin completo */}
              <span className="hidden md:flex flex-shrink-0 items-center px-4 py-2 bg-base-200 rounded-l-lg text-base-content/60">
                {typeof window !== 'undefined' ? window.location.origin : ''}/
              </span>
              <input
                type="text"
                placeholder="sobre-nos"
                className="input input-bordered flex-1 min-w-0"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
              />
            </div>
            <label className="label">
              <span className="label-text-alt text-base-content/60 text-xs md:text-sm">
                Apenas letras minúsculas, números e hífens. Ex: "sobre-nos", "galeria/fotos"
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
