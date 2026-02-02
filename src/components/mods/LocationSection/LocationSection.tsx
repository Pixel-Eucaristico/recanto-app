"use client";

import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export interface LocationSectionProps {
  title?: string;
  address?: string;
  visitInfo?: string;
  mapEmbedUrl?: string;
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
}

const bgColorVariants = {
  'base-100': 'bg-base-100',
  'base-200': 'bg-base-200',
  'base-300': 'bg-base-300',
};

const paddingYVariants = {
  sm: 'py-12',
  md: 'py-16',
  lg: 'py-20',
  xl: 'py-24',
};

export default function LocationSection({
  title = "Nossa Casa é Sua Casa",
  address = "Rua das Flores, 123 – Bairro da Esperança – Cidade/UF",
  visitInfo = "Agende uma visita previamente.",
  mapEmbedUrl = "",
  bgColor = "base-100",
  paddingY = "lg",
}: LocationSectionProps) {
  
  // Função auxiliar para processar URLs do Google Maps
  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    // Caso 1: Usuário colou o código HTML completo do iframe
    if (url.includes('<iframe') && url.includes('src="')) {
      const srcMatch = url.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }

    // Caso 2: Já é um link de embed correto
    if (url.includes('maps/embed')) {
      return url;
    }

    // Caso 3: Link de "Place" ou link direto (tentativa de conversão para modo search/legacy)
    // Ex: https://www.google.com/maps/place/Rua+Exemplo,+123
    // Extrai a parte da busca
    if (url.includes('maps/place/')) {
      const parts = url.split('maps/place/');
      if (parts[1]) {
        // Pega tudo até a primeira barra ou ?
        let query = parts[1].split('/')[0].split('?')[0];
        // Remove coordenadas se estiverem misturadas (ex: @-23.55...)
        // Mas geralmente a query vem antes do @
        return `https://maps.google.com/maps?q=${query}&output=embed`;
      }
    }

    // Caso 4: Retorna como está (pode falhar, mas é o fallback)
    return url;
  };

  const isShortLink = mapEmbedUrl.includes('goo.gl') || mapEmbedUrl.includes('maps.app.goo.gl');
  const processedMapUrl = !isShortLink ? getEmbedUrl(mapEmbedUrl) : null;

  return (
    <section className={`${bgColorVariants[bgColor]} ${paddingYVariants[paddingY]} px-6 w-full`}>
      <div className="max-w-5xl mx-auto text-center">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-primary mb-6"
          >
            <MarkdownRenderer content={title} />
          </motion.h2>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-2 mb-8 text-lg"
        >
          {address && (
            <div className="font-medium">
              <MarkdownRenderer content={address} />
            </div>
          )}
          {visitInfo && (
            <div className="text-base-content/80 italic">
              <MarkdownRenderer content={visitInfo} />
            </div>
          )}
        </motion.div>

        {isShortLink && (
           <div className="alert alert-warning shadow-lg max-w-2xl mx-auto mb-8">
             <div>
               <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               <span>
                 Links curtos (goo.gl) não podem ser incorporados. <br/>
                 <b>Por favor, clique no link, aguarde abrir o Google Maps e copie a URL completa da barra de endereços.</b>
               </span>
             </div>
           </div>
        )}

        {processedMapUrl && !isShortLink && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="rounded-box overflow-hidden shadow-lg h-[400px] w-full bg-base-200"
          >
            <iframe
              src={processedMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        )}
      </div>
    </section>
  );
}
