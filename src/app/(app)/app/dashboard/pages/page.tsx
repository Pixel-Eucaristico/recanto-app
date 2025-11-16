'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { contentPageService } from '@/services/firebase';
import type { CMSPage } from '@/types/cms-types';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function CMSPagesListPage() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const allPages = await contentPageService.getAll();
      setPages(allPages);
    } catch (err) {
      console.error('Error loading pages:', err);
      setError('Erro ao carregar páginas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string, pageTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir a página "${pageTitle}"?`)) {
      return;
    }

    try {
      await contentPageService.delete(pageId);
      setPages(pages.filter(p => p.id !== pageId));
    } catch (err) {
      console.error('Error deleting page:', err);
      alert('Erro ao excluir página');
    }
  };

  const handleTogglePublish = async (page: CMSPage) => {
    try {
      await contentPageService.update(page.id!, {
        is_published: !page.is_published
      });
      setPages(pages.map(p =>
        p.id === page.id ? { ...p, is_published: !p.is_published } : p
      ));
    } catch (err) {
      console.error('Error toggling publish status:', err);
      alert('Erro ao alterar status de publicação');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Páginas CMS</h1>
          <p className="text-base-content/60 mt-1">
            Crie e edite páginas personalizadas usando blocos modulares
          </p>
        </div>
        <Link href="/app/dashboard/pages/new" className="btn btn-primary gap-2">
          <Plus className="w-5 h-5" />
          Nova Página
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="card bg-base-200">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Nenhuma página criada ainda</h2>
            <p className="text-base-content/60">
              Comece criando sua primeira página CMS
            </p>
            <Link href="/app/dashboard/pages/new" className="btn btn-primary mt-4 gap-2">
              <Plus className="w-5 h-5" />
              Criar Primeira Página
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Título</th>
                <th>Slug</th>
                <th>Blocos</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td>
                    <div className="font-semibold">{page.title}</div>
                    {page.description && (
                      <div className="text-sm text-base-content/60 truncate max-w-xs">
                        {page.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <code className="text-sm bg-base-200 px-2 py-1 rounded">
                      {page.slug}
                    </code>
                  </td>
                  <td>
                    <span className="badge badge-ghost">
                      {page.blocks.length} {page.blocks.length === 1 ? 'bloco' : 'blocos'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleTogglePublish(page)}
                      className={`badge gap-1 cursor-pointer ${
                        page.is_published ? 'badge-success' : 'badge-ghost'
                      }`}
                    >
                      {page.is_published ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Publicada
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Rascunho
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        href={`/app/dashboard/pages/${page.id}/edit`}
                        className="btn btn-sm btn-ghost gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(page.id!, page.title)}
                        className="btn btn-sm btn-ghost text-error gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
