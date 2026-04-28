'use client';

import { MessageCircle } from 'lucide-react';
import { ForumHome } from '@/features/community';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

export default function ForumPage() {
  const user = useCurrentUser();

  if (!user) return <div className="p-6">Faça login para entrar no fórum.</div>;

  const isAdmin = user.role === 'admin' || user.features.includes('manage:community') || user.features.includes('*');

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Fórum da comunidade</h1>
            <p className="text-base-content/60 text-sm">
              Discussões organizadas por categoria + enquetes. Escolha uma categoria pra ver os tópicos.
            </p>
          </div>
        </div>
      </header>

      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <ForumHome
          scope={{ scope: 'global' }}
          userId={user.id}
          userName={user.name || 'anônimo'}
          canManage={isAdmin}
        />
      </div>
    </div>
  );
}
