'use client';

import React from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useAdminMaterials } from '../hooks/useAdminMaterials';
import MaterialFormDialog from './MaterialFormDialog';

export default function ContentTab() {
    const { 
        materials, isLoading, isDialogOpen, setIsDialogOpen, 
        editingMaterial, deleteMaterial, openEdit, openNew, fetchMaterials 
    } = useAdminMaterials();

    return (
        <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="card-title text-2xl font-bold">Materiais Formativos</h2>
                    <button onClick={openNew} className="btn btn-primary btn-sm gap-2">
                        <Plus className="w-4 h-4"/> Novo Material
                    </button>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <span className="loading loading-spinner text-primary loading-lg"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="text-base-content/70">
                                    <th>Título</th>
                                    <th>Categoria</th>
                                    <th>Tipo</th>
                                    <th className="text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 opacity-40 italic">Nenhum material encontrado.</td>
                                    </tr>
                                ) : (
                                    materials.map(mat => (
                                        <tr key={mat.id} className="hover:bg-base-200/50 transition-colors border-b border-base-200/50">
                                            <td className="text-base-content font-bold">{mat.title}</td>
                                            <td><span className="badge badge-outline badge-sm font-bold">{mat.category}</span></td>
                                            <td><span className="badge badge-ghost badge-sm">{mat.type}</span></td>
                                            <td className="text-right flex justify-end gap-1">
                                                <button className="btn btn-ghost btn-square btn-sm" onClick={() => openEdit(mat)}>
                                                    <Edit className="w-4 h-4 text-primary" />
                                                </button>
                                                <button className="btn btn-ghost btn-square btn-sm text-error" onClick={() => {
                                                    if(mat.id && confirm(`Deseja apagar o material "${mat.title}"?`)) deleteMaterial(mat.id);
                                                }}>
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
