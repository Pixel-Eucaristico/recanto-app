'use client';

import { useState } from 'react';
import { HeartHandshake, Settings } from 'lucide-react';
import { HabitChecklist, HabitConfig } from '@/features/habits';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

export default function HabitsPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<'my' | 'admin'>('my');

  if (!user) return <div className="p-6">Faça login.</div>;

  const isAdmin = user.role === 'admin' || user.features.includes('manage:habits') || user.features.includes('*');

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <HeartHandshake className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Hábitos diários</h1>
            <p className="text-base-content/60 text-sm">
              Regra dos 3 dias — registre seus hábitos espirituais todo dia. Hábitos que bloqueiam formação destravam ao serem registrados.
            </p>
          </div>
        </div>
      </header>

      {isAdmin && (
        <div className="tabs tabs-boxed bg-base-100 w-fit">
          <button className={`tab ${tab === 'my' ? 'tab-active' : ''}`} onClick={() => setTab('my')}>Meus hábitos</button>
          <button className={`tab ${tab === 'admin' ? 'tab-active' : ''}`} onClick={() => setTab('admin')}>
            <Settings className="w-3.5 h-3.5 mr-1" /> Gerenciar
          </button>
        </div>
      )}

      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        {tab === 'my' && <HabitChecklist userId={user.id} role={user.role} />}
        {tab === 'admin' && isAdmin && <HabitConfig userId={user.id} />}
      </div>
    </div>
  );
}
