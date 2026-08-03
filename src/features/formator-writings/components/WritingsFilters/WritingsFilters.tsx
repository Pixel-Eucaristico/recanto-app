'use client';

import { Search } from 'lucide-react';
import type { FormationTrack } from '@/domain/formation/types';
import type { WritingKind } from '@/domain/formation/writings';
import type { ReflectionStatus } from '@/domain/spiritual-notebook/types';

export type KindFilter = 'all' | WritingKind;
export type StatusFilter = 'all' | ReflectionStatus;

interface WritingsFiltersProps {
  tracks: FormationTrack[];
  trackFilter: string;
  onTrackFilter: (value: string) => void;
  kindFilter: KindFilter;
  onKindFilter: (value: KindFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilter: (value: StatusFilter) => void;
  search: string;
  onSearch: (value: string) => void;
  from: string;
  onFrom: (value: string) => void;
  to: string;
  onTo: (value: string) => void;
}

const KIND_TABS: Array<{ value: KindFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'reflection', label: 'Reflexões' },
  { value: 'forum_post', label: 'Perguntas' },
  { value: 'forum_reply', label: 'Respostas' },
];

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Qualquer status' },
  { value: 'submitted', label: 'Aguardando revisão' },
  { value: 'reviewed', label: 'Revisados' },
  { value: 'draft', label: 'Rascunhos' },
];

export function WritingsFilters(props: WritingsFiltersProps) {
  const {
    tracks, trackFilter, onTrackFilter,
    kindFilter, onKindFilter, statusFilter, onStatusFilter,
    search, onSearch, from, onFrom, to, onTo,
  } = props;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-3 gap-2">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-base-content/50 shrink-0" />
          <input
            type="text"
            className="input input-bordered input-sm flex-1"
            placeholder="Buscar por texto, aluno ou aula..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>

        {tracks.length > 0 && (
          <select
            className="select select-bordered select-sm"
            value={trackFilter}
            onChange={e => onTrackFilter(e.target.value)}
          >
            <option value="all">Todas as trilhas ({tracks.length})</option>
            {tracks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        )}

        <div className="grid grid-cols-2 gap-2">
          <label className="form-control">
            <span className="label-text text-xs mb-1">De</span>
            <input
              type="date"
              className="input input-bordered input-sm"
              value={from}
              onChange={e => onFrom(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Até</span>
            <input
              type="date"
              className="input input-bordered input-sm"
              value={to}
              onChange={e => onTo(e.target.value)}
            />
          </label>
        </div>

        <div role="tablist" className="tabs tabs-bordered">
          {KIND_TABS.map(tab => (
            <button
              key={tab.value}
              role="tab"
              className={`tab tab-sm ${kindFilter === tab.value ? 'tab-active' : ''}`}
              onClick={() => onKindFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          className="select select-bordered select-sm"
          value={statusFilter}
          onChange={e => onStatusFilter(e.target.value as StatusFilter)}
        >
          {STATUS_TABS.map(tab => (
            <option key={tab.value} value={tab.value}>{tab.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
