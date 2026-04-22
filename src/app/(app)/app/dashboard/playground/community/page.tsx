'use client';

import { useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { ForumThread, PollList, SharingWall } from '@/features/community';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

const DEMO_SCOPE = {
  scope: 'lesson' as const,
  track_id: 'playground-track',
  lesson_id: 'playground-lesson-community',
};

export default function CommunityPlaygroundPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<'forum' | 'polls' | 'wall'>('forum');

  if (!user) return <div className="p-6">Faça login para testar.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <MessagesSquare className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground: Comunidade</h1>
            <p className="text-base-content/60 text-sm">
              Fórum + enquetes por aula. Escopo de teste: <code>lesson/playground-lesson-community</code>.
            </p>
          </div>
        </div>
      </header>

      <div className="tabs tabs-boxed bg-base-100 w-fit">
        <button className={`tab ${tab === 'forum' ? 'tab-active' : ''}`} onClick={() => setTab('forum')}>Fórum</button>
        <button className={`tab ${tab === 'polls' ? 'tab-active' : ''}`} onClick={() => setTab('polls')}>Enquetes</button>
        <button className={`tab ${tab === 'wall' ? 'tab-active' : ''}`} onClick={() => setTab('wall')}>Mural</button>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        {tab === 'forum' && (
          <ForumThread scope={DEMO_SCOPE} userId={user.id} userName={user.name || 'anônimo'} />
        )}
        {tab === 'polls' && (
          <PollList scope={DEMO_SCOPE} userId={user.id} userName={user.name || 'anônimo'} />
        )}
        {tab === 'wall' && (
          <SharingWall scope={DEMO_SCOPE} userId={user.id} userName={user.name || 'anônimo'} />
        )}
      </div>
    </div>
  );
}
