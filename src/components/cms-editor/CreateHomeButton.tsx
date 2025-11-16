'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { contentPageService } from '@/services/firebase';
import { getDefaultHomePage } from '@/lib/cms-helpers';
import { Edit } from 'lucide-react';

export default function CreateHomeButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    try {
      setIsCreating(true);

      // Pega a home padrão
      const defaultHome = getDefaultHomePage();

      // Cria no banco sem o ID (será gerado pelo Firestore)
      const { id, ...pageData } = defaultHome;

      const createdPage = await contentPageService.create(pageData);

      // Redireciona para o editor
      router.push(`/app/dashboard/cms/${createdPage.id}/edit`);
    } catch (error) {
      console.error('Error creating home page:', error);
      alert('Erro ao criar página inicial');
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isCreating}
      className="btn btn-sm btn-ghost gap-1"
    >
      {isCreating ? (
        <>
          <span className="loading loading-spinner loading-xs"></span>
          Criando...
        </>
      ) : (
        <>
          <Edit className="w-4 h-4" />
          Personalizar
        </>
      )}
    </button>
  );
}
