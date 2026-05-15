'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { userService } from '@/services/firebase/UserService';
import type { FirebaseUser } from '@/types/firebase-entities';

interface UserGrantPickerProps {
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  /** Texto curto pra rótulo. Default: "Usuários liberados (exceção)". */
  label?: string;
  /** Texto de ajuda abaixo do label. */
  helperText?: string;
}

export function UserGrantPicker({
  selectedUserIds,
  onChange,
  label = 'Usuários liberados (exceção)',
  helperText = 'Liberam este conteúdo independente do grupo/idade.',
}: UserGrantPickerProps) {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    userService
      .list('name')
      .then(list => {
        if (alive) setUsers(list);
      })
      .catch(err => console.error('[UserGrantPicker] erro carregar usuários:', err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const selectedSet = useMemo(() => new Set(selectedUserIds), [selectedUserIds]);

  const selectedUsers = useMemo(
    () => users.filter(u => selectedSet.has(u.id)),
    [users, selectedSet],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [] as FirebaseUser[];
    return users
      .filter(u => !selectedSet.has(u.id))
      .filter(u =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [search, users, selectedSet]);

  function toggle(uid: string) {
    if (selectedSet.has(uid)) onChange(selectedUserIds.filter(id => id !== uid));
    else onChange([...selectedUserIds, uid]);
  }

  return (
    <div className="form-control">
      <span className="label-text text-xs font-medium block mb-1">{label}</span>
      <p className="text-[10px] text-base-content/60 mb-2">{helperText}</p>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedUsers.map(u => (
            <button
              key={u.id}
              type="button"
              className="badge badge-accent gap-1 cursor-pointer"
              onClick={() => toggle(u.id)}
              title="Remover"
            >
              {u.name || u.email}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="w-3 h-3 absolute left-2 top-2.5 text-base-content/40" />
        <input
          type="text"
          className="input input-bordered input-sm w-full pl-7"
          placeholder={loading ? 'Carregando usuários...' : 'Buscar por nome ou email...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={loading}
        />
      </div>

      {search && (
        <div className="mt-1 max-h-48 overflow-y-auto border border-base-300 rounded bg-base-100">
          {filtered.length === 0 ? (
            <p className="text-xs text-base-content/50 p-2">Nenhum usuário encontrado.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {filtered.map(u => (
                <li key={u.id}>
                  <button
                    type="button"
                    className="w-full text-left px-2 py-1.5 hover:bg-base-200 text-xs"
                    onClick={() => {
                      toggle(u.id);
                      setSearch('');
                    }}
                  >
                    <span className="font-medium">{u.name || '—'}</span>
                    <span className="text-base-content/50 ml-2">{u.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
