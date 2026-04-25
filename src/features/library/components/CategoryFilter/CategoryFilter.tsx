'use client';

import { Search, FolderOpen, X } from 'lucide-react';
import { BookCategory } from '@/domain/library/types';

interface CategoryFilterProps {
  categories: BookCategory[];
  activeCategoryId: string | null;
  onChangeCategory: (id: string | null) => void;
  search: string;
  onChangeSearch: (s: string) => void;
}

export function CategoryFilter({
  categories,
  activeCategoryId,
  onChangeCategory,
  search,
  onChangeSearch,
}: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      {/* Busca */}
      <label className="form-control">
        <div className="join w-full">
          <span className="join-item bg-base-200 flex items-center px-3">
            <Search className="w-4 h-4 opacity-60" />
          </span>
          <input
            type="text"
            placeholder="Buscar por título, autor ou tag..."
            className="input input-bordered input-sm join-item flex-1 w-full"
            value={search}
            onChange={e => onChangeSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="join-item btn btn-ghost btn-sm"
              onClick={() => onChangeSearch('')}
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </label>

      {/* Categorias */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-xs ${activeCategoryId === null ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onChangeCategory(null)}
          >
            Todos
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              type="button"
              className={`btn btn-xs gap-1 ${activeCategoryId === c.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onChangeCategory(c.id === activeCategoryId ? null : c.id)}
            >
              <FolderOpen className="w-3 h-3" />
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
