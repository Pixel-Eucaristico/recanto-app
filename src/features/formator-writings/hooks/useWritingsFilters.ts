'use client';

import { useMemo, useState } from 'react';
import type { StudentWriting } from '@/domain/formation/writings';
import type { KindFilter, StatusFilter } from '../components/WritingsFilters/WritingsFilters';

export interface WritingsFiltersState {
  trackFilter: string;
  setTrackFilter: (v: string) => void;
  kindFilter: KindFilter;
  setKindFilter: (v: KindFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  search: string;
  setSearch: (v: string) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  filtered: StudentWriting[];
}

/**
 * Filtro client-side sobre a lista já carregada.
 *
 * Os filtros ficam fora da query porque a busca é por texto e o volume por trilha é
 * pequeno; refazer round-trip a cada tecla custaria leituras do Firestore à toa.
 */
export function useWritingsFilters(writings: StudentWriting[]): WritingsFiltersState {
  const [trackFilter, setTrackFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = useMemo(() => {
    let list = writings;

    if (trackFilter !== 'all') list = list.filter(w => w.track_id === trackFilter);
    if (kindFilter !== 'all') list = list.filter(w => w.kind === kindFilter);
    if (statusFilter !== 'all') list = list.filter(w => w.status === statusFilter);
    if (from) list = list.filter(w => w.created_at.slice(0, 10) >= from);
    if (to) list = list.filter(w => w.created_at.slice(0, 10) <= to);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(w =>
        w.content.toLowerCase().includes(q)
        || (w.title ?? '').toLowerCase().includes(q)
        || w.student_name.toLowerCase().includes(q)
        || w.lesson_title.toLowerCase().includes(q));
    }

    return list;
  }, [writings, trackFilter, kindFilter, statusFilter, search, from, to]);

  return {
    trackFilter, setTrackFilter,
    kindFilter, setKindFilter,
    statusFilter, setStatusFilter,
    search, setSearch,
    from, setFrom,
    to, setTo,
    filtered,
  };
}
