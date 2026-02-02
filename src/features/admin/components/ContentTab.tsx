'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { useAdminMaterials } from '../hooks/useAdminMaterials';
import MaterialFormDialog from './MaterialFormDialog';

export default function ContentTab() {
    const { 
        materials, isLoading, isDialogOpen, setIsDialogOpen, 
        editingMaterial, deleteMaterial, openEdit, openNew, fetchMaterials,
        searchQuery, setSearchQuery, categoryFilter, setCategoryFilter
    } = useAdminMaterials();

    const [isMac, setIsMac] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Detectar OS e Atalho de teclado Cmd/Ctrl + K
    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Extrair categorias únicas para os filtros
    const categories = React.useMemo(() => {
        const cats = new Set(materials.map(m => m.category).filter(Boolean));
        return ['all', ...Array.from(cats)];
    }, [materials]);

    return (
        <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="card-title text-xl font-bold italic">Materiais Formativos</h2>
                        <p className="text-xs opacity-50">Gestão de conteúdo</p>
                    </div>
                    <button onClick={openNew} className="btn btn-primary btn-sm">
                        <Plus className="w-4 h-4"/> Novo Material
                    </button>
                </div>

                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                    {/* Busca DaisyUI v5 Style com Atalho KBD Dinâmico */}
                    <label className="input input-sm input-bordered flex items-center gap-2 flex-1 h-[38px] group">
                        <svg className="h-[1em] opacity-50 group-focus-within:opacity-100 transition-all" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                        <input 
                            ref={searchInputRef}
                            type="search" 
                            className="grow" 
                            placeholder="Buscar materiais..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {!searchQuery && (
                            <div className="flex gap-1 items-center">
                                <kbd className="kbd kbd-sm h-5 min-h-0 px-1 text-[10px] opacity-60">{isMac ? '⌘' : 'Ctrl'}</kbd>
                                <kbd className="kbd kbd-sm h-5 min-h-0 px-1 text-[10px] opacity-60">K</kbd>
                            </div>
                        )}
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="btn btn-ghost btn-circle btn-xs h-4 w-4 min-h-0">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </label>

                    {/* Filtro de Categoria (DaisyUI Style) */}
                    <div className="filter bg-base-200/50 p-1 rounded-lg border border-base-300 flex items-center h-[38px] w-full sm:w-auto">
                        <select 
                            className="select select-ghost select-sm font-bold text-xs uppercase tracking-tight focus:bg-transparent h-full w-full sm:w-auto"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">Filtro: Todos</option>
                            {categories.filter(c => c !== 'all').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <span className="loading loading-spinner text-primary"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-md w-full">
                            <thead>
                                <tr className="text-base-content/60 uppercase text-[10px] tracking-widest border-b border-base-300">
                                    <th>Conteúdo</th>
                                    <th>Categoria</th>
                                    <th>Tipo</th>
                                    <th className="text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 opacity-40 italic font-medium">Nenhum material encontrado.</td>
                                    </tr>
                                ) : (
                                    materials.map(mat => (
                                        <tr key={mat.id} className="hover:bg-base-200/50 transition-colors border-b border-base-300/30">
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-base-content leading-tight">{mat.title}</span>
                                                    <span className="text-[10px] opacity-40 truncate max-w-[200px]">{mat.description || 'Sem descrição'}</span>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-outline badge-xs font-bold uppercase tracking-tight">{mat.category}</span></td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${mat.type === 'video' ? 'bg-error' : mat.type === 'pdf' ? 'bg-primary' : 'bg-success'}`}></span>
                                                    <span className="text-[10px] uppercase font-bold opacity-60">{mat.type}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex justify-end gap-1">
                                                    <button className="btn btn-ghost btn-square btn-xs" onClick={() => openEdit(mat)} title="Editar">
                                                        <Edit className="w-3.5 h-3.5 text-primary" />
                                                    </button>
                                                    <button className="btn btn-ghost btn-square btn-xs" onClick={() => {
                                                        if(mat.id && confirm(`Deseja apagar "${mat.title}"?`)) deleteMaterial(mat.id);
                                                    }} title="Excluir">
                                                        <Trash2 className="w-3.5 h-3.5 text-error" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <MaterialFormDialog 
                isOpen={isDialogOpen} 
                setIsOpen={setIsDialogOpen} 
                material={editingMaterial}
                onFinished={fetchMaterials}
            />
        </div>
    );
}
