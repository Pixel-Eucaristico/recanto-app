'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Film, X, Check, Trash2, Cloud, Search, ChevronLeft, ChevronRight, Upload, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface AnimationPickerProps {
  value: string;
  onChange: (value: string) => void;
}

interface Animation {
  id: string;
  name: string;
  file: string | null;
  isR2?: boolean;
}

export function AnimationPicker({ value = 'none', onChange }: AnimationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [availableAnimations, setAvailableAnimations] = useState<Animation[]>([{ id: 'none', name: 'Sem Animação', file: null }]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Controle de Paginação (O "Método Correto" para Ativos Pesados)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 itens é o equilíbrio perfeito para performance

  const fetchAnimations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/animations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAvailableAnimations(data);
        return data;
      }
    } catch (err) {
      console.error('Erro ao carregar animações:', err);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    fetchAnimations();
  }, []);

  const filteredAnimations = useMemo(() => {
    return availableAnimations.filter(a => 
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableAnimations, searchTerm]);

  // Lógica de Paginação
  const totalPages = Math.ceil(filteredAnimations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredAnimations.slice(startIndex, startIndex + itemsPerPage);

  // Resetar para página 1 ao pesquisar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSelect = (id: string) => {
    setSelected(id);
    onChange(id);
    setIsOpen(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar se é JSON
    if (!file.name.endsWith('.json')) {
      alert('Por favor, selecione um arquivo .json de animação Lottie.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'animations');
      formData.append('origin', 'cms');

      const response = await fetch('/api/upload/r2', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha no upload');
      }

      // IMPORTANTE: O storage agora salva em origin/type/year/month/day/file.json
      // Precisamos recarregar a lista para garantir que o novo arquivo apareça
      const animations = await fetchAnimations(); 
      
      // Selecionar automaticamente a nova animação enviada
      if (result.url) {
        // Encontrar o item na lista recém-carregada para garantir que temos o objeto Animation completo
        const newAnim = animations?.find((a: any) => a.file === result.url);
        
        setSelected(result.url);
        onChange(result.url);
        
        // Pequeno delay para garantir que o usuário veja a seleção antes de fechar
        setTimeout(() => {
          setIsOpen(false);
        }, 300);
      }
    } catch (err: any) {
      setError(err.message);
      alert('Erro no upload: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, anim: Animation) => {
    e.stopPropagation();
    if (!anim.file || !confirm(`Deseja excluir definitivamente a animação "${anim.name}"?`)) return;

    try {
      const response = await fetch(`/api/animations?url=${encodeURIComponent(anim.file)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir');

      if (selected === anim.id) {
        setSelected('none');
        onChange('none');
      }
      
      await fetchAnimations();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <div className="w-full">
      <button 
        type="button" 
        onClick={() => setIsOpen(true)} 
        className="btn btn-outline btn-sm md:btn-md w-full justify-start gap-2"
      >
        <Film className="w-4 h-4 text-primary" />
        <span className="truncate flex-1 text-left">
          {availableAnimations.find(a => a.id === selected)?.name || 'Selecionar Animação'}
        </span>
        {availableAnimations.find(a => a.id === selected)?.isR2 && (
          <div className="badge badge-primary badge-sm gap-1 font-black opacity-80">
            <Cloud className="w-2.5 h-2.5" /> CLOUD
          </div>
        )}
      </button>

      {isOpen && (
        <div className="modal modal-open z-[10000]">
          <div className="modal-box max-w-5xl p-0 w-[96vw] h-[90vh] md:h-[85vh] flex flex-col bg-base-100 overflow-hidden shadow-2xl rounded-2xl md:rounded-3xl border border-base-300">
            
            {/* Header Fixo */}
            <div className="p-4 md:p-6 border-b border-base-200 bg-base-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Film className="w-5 h-5" />
                   </div>
                   <h3 className="font-black text-lg uppercase tracking-tight">Biblioteca Recanto</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="btn btn-sm btn-circle btn-ghost"><X /></button>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                  <input 
                    className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/20" 
                    placeholder="Pesquisar animação..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <label className={`btn btn-primary btn-md flex-1 md:flex-none gap-2 shadow-lg shadow-primary/20 ${uploading ? 'loading' : ''}`}>
                    {!uploading && <Upload className="w-4 h-4" />}
                    {uploading ? 'ENVIANDO...' : 'UPLOAD JSON'}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".json" 
                      onChange={handleUpload} 
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Grid Estável (Sempre 12 itens) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200/50">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <span className="loading loading-spinner loading-lg text-primary" />
                  <p className="text-xs font-bold opacity-30">CARREGANDO ATIVOS...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pageItems.map(anim => (
                    <StaticCard 
                      key={anim.id} 
                      animation={anim} 
                      isSelected={selected === anim.id} 
                      onSelect={() => handleSelect(anim.id)}
                      onDelete={(e: any) => handleDelete(e, anim)}
                    />
                  ))}
                  {pageItems.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-30 italic">
                      Nenhuma animação encontrada para "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer de Navegação (DaisyUI Pagination) */}
            <div className="p-4 md:p-6 border-t border-base-200 bg-base-100 flex flex-col items-center gap-4">
              <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-4">
                <div className="text-[10px] font-black opacity-30 uppercase">
                   {filteredAnimations.length} animações • Página {currentPage} de {totalPages || 1}
                </div>

                <div className="join shadow-sm border border-base-300">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="join-item btn btn-sm md:btn-md"
                  >
                    «
                  </button>
                  
                  {/* Mostrar números de página limitados para não quebrar o layout */}
                  {[...Array(totalPages || 1)].map((_, i) => {
                    const pageNum = i + 1;
                    // Lógica simples para mostrar páginas próximas à atual
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`join-item btn btn-sm md:btn-md ${currentPage === pageNum ? 'btn-active btn-primary' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <button key={pageNum} className="join-item btn btn-sm md:btn-md btn-disabled">...</button>;
                    }
                    return null;
                  })}

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="join-item btn btn-sm md:btn-md"
                  >
                    »
                  </button>
                </div>

                <button 
                  onClick={() => setIsOpen(false)} 
                  className="btn btn-sm md:btn-md btn-primary px-10 font-black shadow-lg shadow-primary/20"
                >
                  PRONTO
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

// Card Estático que carrega apenas os dados necessários
const StaticCard = memo(({ animation, isSelected, onSelect, onDelete }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!animation.file || animation.id === 'none') return;
    
    setLoading(true);
    const url = animation.file.startsWith('http') 
        ? `/api/animations/proxy?url=${encodeURIComponent(animation.file)}` 
        : `/animations/${animation.file}`;

    fetch(url)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => setData(null); // Limpeza total da memória
  }, [animation.file, animation.id]);

  return (
    <div 
      onClick={onSelect}
      className={`relative h-44 md:h-48 bg-base-100 rounded-[2rem] border-2 cursor-pointer p-2 flex flex-col transition-all duration-300 group ${
        isSelected ? 'border-primary ring-4 ring-primary/10 bg-primary/[0.02]' : 'border-base-200 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 shadow-sm'
      }`}
    >
      <div className="flex-1 bg-base-200/30 rounded-[1.5rem] flex items-center justify-center overflow-hidden relative">
        {/* Badge de Nuvem Premium */}
        {animation.isR2 && (
          <div className="absolute top-3 left-3 z-20 transition-all duration-500 group-hover:opacity-40 group-hover:scale-90">
            <div className="flex items-center gap-1.5 bg-base-100/80 dark:bg-black/40 backdrop-blur-xl px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
              <Cloud className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black text-base-content/60 uppercase tracking-widest hidden sm:inline">R2 Cloud</span>
            </div>
          </div>
        )}
        
        {/* Botão de Excluir Integrado */}
        {animation.isR2 && !isSelected && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            className="absolute top-3 right-3 p-2 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white backdrop-blur-md rounded-full border border-red-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 active:scale-90 z-20"
            title="Excluir animação"
          >
             <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Seleção - Floating Check */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] flex items-center justify-center z-10">
             <div className="bg-primary text-white p-2.5 rounded-full shadow-2xl scale-110 animate-in zoom-in-50 duration-300">
                <Check className="w-5 h-5 stroke-[3]" />
             </div>
          </div>
        )}

        {data ? (
          <Lottie animationData={data} loop className="h-[80%] w-[80%]" renderer="svg" />
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-10">
             <Film className="w-10 h-10" />
             {loading && <span className="loading loading-spinner loading-xs text-primary"></span>}
          </div>
        )}
      </div>
      
      <div className="px-2 py-3">
        <p className="text-[10px] font-black text-center truncate opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-[0.1em]">
          {animation.name}
        </p>
      </div>
    </div>
  );
});

StaticCard.displayName = 'StaticCard';
