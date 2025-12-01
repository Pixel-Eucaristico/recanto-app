'use client';

import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

export interface HeroStructureProps {
  title?: string;
  description?: string;
  animationUrl?: string;
  quote?: string;
  quoteReference?: string;
  titleColor?: 'primary' | 'secondary' | 'accent';
  quoteColor?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning';
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
}

/**
 * HeroStructure - Hero com animação Lottie e citação bíblica
 * Perfeito para páginas institucionais com mensagens inspiradoras
 */
export function HeroStructure({
  title = "",
  description = "",
  animationUrl = "",
  quote = "",
  quoteReference = "",
  titleColor = 'primary',
  quoteColor = 'secondary',
  maxWidth = '5xl',
  bgColor = 'base-100',
}: HeroStructureProps) {
  // Não renderizar se não tiver conteúdo essencial
  if (!title && !description && !quote) {
    return null;
  }
  const titleColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  };

  const quoteColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
  };

  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const bgColorClasses = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
    'base-300': 'bg-base-300',
  };

  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎬 [HeroStructure] useEffect chamado', { animationUrl });

    // Só buscar animação se animationUrl não for vazio e diferente de 'none'
    if (!animationUrl || animationUrl === 'none') {
      console.warn('⚠️ [HeroStructure] animationUrl está vazio, undefined ou "none"');
      setIsLoading(false);
      setError(null); // Não é erro, apenas sem animação
      return;
    }

    console.log('🔄 [HeroStructure] Iniciando fetch da animação:', animationUrl);
    setIsLoading(true);
    setError(null);

    // Construir URL correta baseado no tipo de valor
    // Se começar com http, usar direto. Caso contrário, buscar de /animations/
    const fetchUrl = animationUrl.startsWith('http')
      ? animationUrl
      : `/animations/${animationUrl}`;

    console.log('🌐 [HeroStructure] URL final do fetch:', fetchUrl);

    fetch(fetchUrl)
      .then((res) => {
        console.log('📥 [HeroStructure] Resposta recebida:', res.status, res.ok);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('✅ [HeroStructure] Animação carregada com sucesso:', {
          hasData: !!data,
          dataType: typeof data,
          keys: data ? Object.keys(data).slice(0, 5) : []
        });
        setAnimationData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('❌ [HeroStructure] Erro ao carregar animação:', err);
        setError(err.message || 'Erro ao carregar animação');
        setIsLoading(false);
      });
  }, [animationUrl]);

  return (
    <motion.section
      className={`w-full ${bgColorClasses[bgColor]} py-12 md:py-20 px-6`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`${maxWidthClasses[maxWidth]} mx-auto space-y-6 md:space-y-8 text-center`}>
        {/* Título */}
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-3xl md:text-4xl lg:text-5xl font-bold ${titleColorClasses[titleColor]}`}
          >
            {title}
          </motion.h1>
        )}

        {/* Descrição */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base md:text-lg lg:text-xl text-base-content"
          >
            {description}
          </motion.p>
        )}

        {/* Animação Lottie */}
        <div className="max-w-xs md:max-w-md mx-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-sm text-base-content/60 mt-4">Carregando animação...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold">Erro ao carregar animação</h3>
                <div className="text-xs">{error}</div>
              </div>
            </div>
          )}

          {!isLoading && !error && animationData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Lottie
                animationData={animationData}
                loop
                style={{ width: '100%', height: 'auto' }}
              />
            </motion.div>
          )}

          {!isLoading && !error && !animationData && (
            <div className="text-sm text-base-content/40 text-center py-8">
              Nenhuma animação configurada
            </div>
          )}
        </div>

        {/* Citação Bíblica */}
        {quote && (
          <motion.blockquote
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`${quoteColorClasses[quoteColor]} italic text-base md:text-lg space-y-2`}
          >
            <p>&ldquo;{quote}&rdquo;</p>
            {quoteReference && (
              <cite className="text-sm not-italic font-medium">
                {quoteReference}
              </cite>
            )}
          </motion.blockquote>
        )}
      </div>
    </motion.section>
  );
}
