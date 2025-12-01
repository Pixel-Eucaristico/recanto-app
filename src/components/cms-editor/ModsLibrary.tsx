'use client';

import { useState, useMemo } from 'react';
import { availableMods } from '@/components/mods';
import { Plus, Filter, GripVertical, Search } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

interface ModsLibraryProps {
  onAddMod: (modId: string) => void;
}

interface DraggableModItemProps {
  modId: string;
  modConfig: any;
  onAddMod: (modId: string) => void;
}

function DraggableModItem({ modId, modConfig, onAddMod }: DraggableModItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `mod-${modId}`,
    data: { type: 'mod', modId }
  });

  return (
    <div
      ref={setNodeRef}
      className={`card bg-base-100 hover:bg-base-300 transition-all select-none ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      }`}
    >
      <div className="card-body p-4">
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing pt-1 touch-none"
            style={{ touchAction: 'none' }}
          >
            <GripVertical className="w-4 h-4 text-base-content/40 pointer-events-none" />
          </div>

          {/* Content */}
          <div className="flex-1 cursor-pointer" onClick={() => onAddMod(modId)}>
            <h3 className="font-semibold text-sm">{modConfig.name}</h3>
            <p className="text-xs text-base-content/60 mt-1">
              {modConfig.description}
            </p>
            {modConfig.category && (
              <span className="badge badge-sm badge-ghost mt-2">
                {modConfig.category}
              </span>
            )}
          </div>

          {/* Add Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddMod(modId);
            }}
            className="btn btn-circle btn-sm btn-ghost flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModsLibrary({ onAddMod }: ModsLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    Object.values(availableMods).forEach((mod) => {
      if (mod.category) cats.add(mod.category);
    });
    return ['all', ...Array.from(cats).sort()];
  }, []);

  // Filter mods by category and search query
  const filteredMods = useMemo(() => {
    let filtered = Object.entries(availableMods);

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        ([, modConfig]) => modConfig.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(([modId, modConfig]) => {
        const name = modConfig.name?.toLowerCase() || '';
        const description = modConfig.description?.toLowerCase() || '';
        const category = modConfig.category?.toLowerCase() || '';
        return (
          name.includes(query) ||
          description.includes(query) ||
          category.includes(query) ||
          modId.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Category labels (Portuguese)
  const categoryLabels: Record<string, string> = {
    all: 'Todos',
    hero: 'Hero',
    content: 'Conteúdo',
    testimonial: 'Depoimentos',
    form: 'Formulários',
    gallery: 'Galerias',
    chart: 'Gráficos',
    cta: 'Call-to-Action',
    other: 'Outros'
  };

  return (
    <div className="w-80 bg-base-200 p-4 overflow-y-auto flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Biblioteca de Blocos</h2>
        <p className="text-sm text-base-content/60">
          Clique ou arraste blocos para adicionar
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Pesquisar Blocos
        </label>
        <input
          type="text"
          placeholder="Digite para buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered input-sm w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-base-content/60 hover:text-base-content mt-1 underline"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtrar por Categoria
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select select-bordered select-sm w-full"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat] || cat}
            </option>
          ))}
        </select>
      </div>

      {/* Mods Count */}
      <div className="text-xs text-base-content/50 mb-3">
        {filteredMods.length} {filteredMods.length === 1 ? 'bloco' : 'blocos'}
      </div>

      {/* Mods List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {filteredMods.length === 0 ? (
          <div className="card bg-base-100">
            <div className="card-body p-8 text-center">
              <p className="text-sm text-base-content/60">
                {searchQuery
                  ? `Nenhum bloco encontrado para "${searchQuery}"`
                  : 'Nenhum bloco nesta categoria'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-sm btn-ghost mt-2"
                >
                  Limpar busca
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredMods.map(([modId, modConfig]) => (
            <DraggableModItem
              key={modId}
              modId={modId}
              modConfig={modConfig}
              onAddMod={onAddMod}
            />
          ))
        )}
      </div>
    </div>
  );
}
