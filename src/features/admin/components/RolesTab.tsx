'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Save, Trash2, X, AlertCircle, Check, Info } from 'lucide-react';
import {
  DEFAULT_ROLE_PERMISSIONS,
  FEATURES_INFO,
  FEATURE_CATEGORIES,
  getFeaturesByCategory,
  getFeatureInfo
} from '@/config/permissions';
import { permissionsConfigService, PermissionsConfig } from '@/entities/PermissionsConfig';
import { useToast } from "@/components/ui/use-toast";

// Nomes amigáveis padrão para roles conhecidas
const DEFAULT_ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: 'Administrador',
  missionario: 'Missionário',
  recantiano: 'Recantiano',
  pai: 'Pai/Responsável',
  colaborador: 'Colaborador',
  benfeitor: 'Benfeitor',
  visitante: 'Visitante',
};

export default function RolesTab() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<PermissionsConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleId, setNewRoleId] = useState('');
  const [newRoleDisplayName, setNewRoleDisplayName] = useState('');

  const featuresByCategory = getFeaturesByCategory();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const data = await permissionsConfigService.list();

      if (data.length === 0) {
        // Se o banco estiver vazio, carrega os padrões em memória
        const defaultRoles = Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([role, features]) => ({
          id: role,
          display_name: DEFAULT_ROLE_DISPLAY_NAMES[role] || role,
          features: [...features],
        }));
        setRoles(defaultRoles);

        // Auto-seed: salva automaticamente no Firestore para que as regras de segurança funcionem pra todos
        console.log("Auto-initializing default roles in Firestore...");
        Promise.all(defaultRoles.map(r => 
          permissionsConfigService.update(r.id, {
            features: r.features,
            display_name: r.display_name
          }).catch(e => console.error(`Failed to auto-seed role ${r.id}:`, e))
        )).then(() => console.log("Auto-seed complete."));

      } else {
        // Adicionar display_name padrão se não existir
        setRoles(data.map(r => ({
          ...r,
          display_name: r.display_name || DEFAULT_ROLE_DISPLAY_NAMES[r.id] || r.id
        })));
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao carregar grupos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (role: PermissionsConfig) => {
    setIsSaving(true);
    try {
      await permissionsConfigService.update(role.id, {
        features: role.features,
        display_name: role.display_name,
        updated_at: new Date().toISOString()
      });
      toast({ title: "Salvo!", description: `Permissões de "${role.display_name || role.id}" atualizadas.` });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFeature = (roleId: string, feature: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        const has = r.features.includes(feature);
        return {
          ...r,
          features: has ? r.features.filter(f => f !== feature) : [...r.features, feature]
        };
      }
      return r;
    }));
  };

  const updateDisplayName = (roleId: string, displayName: string) => {
    setRoles(prev => prev.map(r =>
      r.id === roleId ? { ...r, display_name: displayName } : r
    ));
  };

  const addNewRole = async () => {
    if (!newRoleId || !newRoleDisplayName) {
      toast({ title: "Atenção", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }

    const cleanId = newRoleId.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    if (roles.find(r => r.id === cleanId)) {
      toast({ title: "Erro", description: "Já existe um grupo com este identificador.", variant: "destructive" });
      return;
    }

    try {
      const newRole: PermissionsConfig = {
        id: cleanId,
        display_name: newRoleDisplayName.trim(),
        features: []
      };
      await permissionsConfigService.create(newRole as any);
      setRoles([...roles, newRole]);
      setNewRoleId('');
      setNewRoleDisplayName('');
      setShowNewRoleModal(false);
      toast({ title: "Criado!", description: `Grupo "${newRoleDisplayName}" criado com sucesso.` });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao criar grupo.", variant: "destructive" });
    }
  };

  const deleteRole = async (id: string, displayName?: string) => {
    if (!confirm(`Tem certeza que deseja excluir o grupo "${displayName || id}"?\n\nIsso pode afetar usuários que possuem este papel.`)) return;
    try {
      await permissionsConfigService.delete(id);
      setRoles(roles.filter(r => r.id !== id));
      toast({ title: "Removido!", description: "Grupo excluído com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao remover.", variant: "destructive" });
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const countActiveFeatures = (features: string[]) => {
    if (features.includes('*')) return 'Acesso Total';
    return `${features.length} ${features.length === 1 ? 'perm.' : 'perms.'}`;
  };

  const filteredFeaturesByCategory = Object.entries(featuresByCategory).reduce((acc, [catId, features]) => {
    const filtered = features.filter(f =>
      f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) acc[catId] = filtered;
    return acc;
  }, {} as Record<string, typeof FEATURES_INFO>);

  if (isLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner text-primary"></span></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="card-title text-xl font-bold text-base-content flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Grupos de Acesso
              </h2>
              <p className="text-sm text-base-content/60 mt-1">
                Defina o que cada tipo de membro pode fazer no sistema
              </p>
            </div>
            <button onClick={() => setShowNewRoleModal(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Novo Grupo
            </button>
          </div>
        </div>
      </div>

      {/* Modal para novo grupo */}
      {showNewRoleModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Criar Novo Grupo</h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nome do Grupo</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Coordenador de Eventos"
                  className="input input-bordered w-full"
                  value={newRoleDisplayName}
                  onChange={(e) => setNewRoleDisplayName(e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Este nome será exibido na interface
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Identificador (ID)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: coordenador_eventos"
                  className="input input-bordered w-full font-mono text-sm"
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Apenas letras minúsculas, números e underline (_)
                  </span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowNewRoleModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={addNewRole}>
                <Plus className="w-4 h-4" /> Criar Grupo
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-base-300/50" onClick={() => setShowNewRoleModal(false)} />
        </div>
      )}

      {/* Lista de Grupos */}
      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="card bg-base-100 shadow-sm border border-base-300">
            <div className="collapse collapse-arrow">
              <input type="checkbox" />
              <div className="collapse-title pr-12">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-base-content">
                      {role.display_name || DEFAULT_ROLE_DISPLAY_NAMES[role.id] || role.id}
                    </span>
                    <span className="text-xs text-base-content/50 font-mono">
                      {role.id}
                    </span>
                  </div>
                  <span className={`badge ${role.features.includes('*') ? 'badge-error' : 'badge-primary'} badge-sm`}>
                    {countActiveFeatures(role.features)}
                  </span>
                </div>
              </div>

              <div className="collapse-content">
                {/* Barra de Pesquisa e Nome */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="label py-1">
                      <span className="label-text-xs font-bold opacity-50 uppercase">Nome de Exibição</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full h-[32px] text-xs"
                      value={role.display_name || ''}
                      onChange={(e) => updateDisplayName(role.id, e.target.value)}
                      placeholder="Ex: Administrador"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="label py-1">
                      <span className="label-text-xs font-bold opacity-50 uppercase">Filtrar Permissões</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full h-[32px] text-xs pl-8"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <X 
                        className={`absolute right-2 top-2 w-3.5 h-3.5 opacity-30 cursor-pointer hover:opacity-100 ${!searchTerm && 'hidden'}`}
                        onClick={() => setSearchTerm('')}
                      />
                      <Shield className="absolute left-2.5 top-2 w-3.5 h-3.5 opacity-30" />
                    </div>
                  </div>
                </div>

                {/* Permissões por categoria (Estilo Discord) */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-base-300">
                  {Object.entries(FEATURE_CATEGORIES).map(([categoryId, category]) => {
                    const categoryFeatures = filteredFeaturesByCategory[categoryId] || [];
                    if (categoryFeatures.length === 0) return null;

                    const CategoryIcon = category.icon;
                    const activeCount = categoryFeatures.filter(f => role.features.includes(f.id)).length;

                    return (
                      <div key={categoryId} className="border-t border-base-300/50 pt-3 first:border-0 first:pt-0">
                        <div className="h-7 flex items-center mb-1"> {/* Wrapper para evitar sobreposição */}
                          <div className="flex items-center gap-1.5 px-2 py-0.5 select-none w-fit border-r-2 border-base-300 -rotate-180 origin-center bg-base-200/50 rounded-r-sm">
                            <CategoryIcon className={`w-3 h-3 text-${category.color} opacity-60 rotate-180`} />
                            <span className="text-[10px] font-bold uppercase tracking-tight opacity-40 rotate-180">{category.label}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {categoryFeatures.map(feature => {
                            const isActive = role.features.includes(feature.id);
                            const isFullAccess = role.features.includes('*') && feature.id !== '*';

                            return (
                              <label
                                key={feature.id}
                                className={`
                                  group flex items-center justify-between p-1.5 rounded hover:bg-base-200/50 transition-colors cursor-pointer
                                  ${isActive && !isFullAccess ? 'bg-primary/5' : ''}
                                `}
                              >
                                <div className="flex flex-col min-w-0 pr-4">
                                  <span className={`text-xs font-medium leading-none ${isActive ? 'text-primary' : 'text-base-content/80'}`}>
                                    {feature.label}
                                  </span>
                                  <span className="text-[10px] opacity-40 truncate">
                                    {feature.description}
                                  </span>
                                </div>
                                <div className="flex items-center shrink-0">
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-xs checkbox-primary"
                                    checked={isActive || (role.features.includes('*') && feature.id !== '*')}
                                    disabled={role.features.includes('*') && feature.id !== '*'}
                                    onChange={() => toggleFeature(role.id, feature.id)}
                                  />
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(filteredFeaturesByCategory).length === 0 && (
                    <div className="py-8 text-center opacity-30 text-xs italic">
                      Nenhuma permissão encontrada para "{searchTerm}"
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-base-300">
                  <button
                    onClick={() => deleteRole(role.id, role.display_name)}
                    className="btn btn-ghost btn-sm text-error gap-1"
                    disabled={role.id === 'admin'}
                  >
                    <Trash2 className="w-4 h-4" /> Excluir Grupo
                  </button>
                  <button
                    onClick={() => handleSave(role)}
                    className="btn btn-primary gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? <span className="loading loading-spinner loading-xs"></span> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dica */}
      <div className="alert bg-info/10 border-info/20">
        <Info className="w-5 h-5 text-info" />
        <div>
          <p className="font-semibold text-sm">Como funciona?</p>
          <p className="text-xs text-base-content/70">
            Marque "Acesso Total" para dar todas as permissões a um grupo.
            Ou selecione permissões específicas para controle mais granular.
          </p>
        </div>
      </div>
    </div>
  );
}
