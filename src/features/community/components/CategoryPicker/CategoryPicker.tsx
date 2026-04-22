'use client';

import { useEffect, useState } from 'react';
import { CommunityCategory, CommunityVisibility } from '@/domain/community/types';
import { CommunityCategoryEntity } from '@/domain/community/entities/CommunityCategory';
import { communityService } from '@/application/community/CommunityService';

interface CategoryPickerProps {
  value: string | undefined;
  onChange: (categoryId: string | undefined) => void;
  visibility: CommunityVisibility;
  /** Trava seleção — útil quando o contexto (ex: aula) define categoria natural. */
  lockedTo?: string;
}

export function CategoryPicker({ value, onChange, visibility, lockedTo }: CategoryPickerProps) {
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    communityService
      .listCategories()
      .then(list => {
        if (!active) return;
        setCategories(list);
        if (!value) {
          const natural = CommunityCategoryEntity.findForScope(list, visibility);
          if (natural) onChange(natural.id);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <span className="text-xs text-base-content/60">Carregando categorias...</span>;
  }

  if (categories.length === 0) {
    return (
      <span className="text-xs text-base-content/60">
        Nenhuma categoria cadastrada. Peça ao admin pra criar categorias.
      </span>
    );
  }

  return (
    <select
      className="select select-bordered select-sm"
      value={value ?? ''}
      disabled={!!lockedTo}
      onChange={e => onChange(e.target.value || undefined)}
    >
      <option value="">Sem categoria</option>
      {categories.map(c => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
