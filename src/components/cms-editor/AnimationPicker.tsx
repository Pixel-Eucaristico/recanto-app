'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Film, X, Check, Trash2, Cloud, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  // Controle de Paginação (O "Método Correto" para Ativos Pesados)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 itens é o equilíbrio perfeito para performance

  useEffect(() => {
    fetch('/api/animations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableAnimations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                <input 
                  className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/20" 
                  placeholder="Pesquisar animação..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
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
const StaticCard = memo(({ animation, isSelected, onSelect }: any) => {
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
      className={`h-40 md:h-44 bg-base-100 rounded-2xl border-2 cursor-pointer p-3 flex flex-col transition-all duration-200 group ${
        isSelected ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-base-300 hover:border-primary/40 shadow-sm'
      }`}
    >
      <div className="flex-1 bg-base-200/50 rounded-xl flex items-center justify-center overflow-hidden relative">
        {data ? (
          <Lottie animationData={data} loop className="h-full w-full" renderer="canvas" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-5">
             <Film className="w-8 h-8" />
             {loading && <span className="loading loading-dots loading-xs"></span>}
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-center mt-3 truncate opacity-50 uppercase tracking-tighter">
        {animation.name}
      </p>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-white p-0.5 rounded-full shadow-lg">
           <Check className="w-3 h-3" />
        </div>
      )}
    </div>
  );
});

StaticCard.displayName = 'StaticCard';
