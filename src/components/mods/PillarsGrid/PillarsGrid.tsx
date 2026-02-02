'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ModComponents } from '@/components/mods'; // Import registry
import { Box } from 'lucide-react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

export interface Pillar {
  icon: string;
  lottie?: string;
  title: string;
  description: string;
  iconColor?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
  // Action System
  actionType?: 'url' | 'modal_block'; 
  buttonLink?: string;
  modalBlock?: {
    modId: string;
    props: Record<string, any>;
  };
}

export interface PillarsGridProps {
  title?: string;
  pillars?: Pillar[];
  columns?: '2' | '3' | '4';
  titleColor?: 'primary' | 'secondary' | 'accent';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

function PillarLottie({ file }: { file: string }) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    if (file) {
      if (file.startsWith('http')) {
        fetch(file).then((res) => res.json()).then(setAnimationData).catch(console.error);
      } else {
        fetch(`/animations/${file}`).then((res) => res.json()).then(setAnimationData).catch(console.error);
      }
    }
  }, [file]);

  if (!animationData) return <div className="h-40 w-40 bg-base-200 rounded animate-pulse" />;
  return <Lottie animationData={animationData} loop className="h-40 mx-auto" />;
}

export function PillarsGrid({
  title = "",
  pillars = [],
  columns = '4',
  titleColor = 'primary',
  bgColor = 'base-100',
  maxWidth = '6xl',
}: PillarsGridProps) {
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = (pillar: Pillar) => {
    setSelectedPillar(pillar);
    modalRef.current?.showModal();
  };

  if (!title && pillars.length === 0) {
    return null;
  }

  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const titleColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  };

  const bgColorClasses = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
    'base-300': 'bg-base-300',
  };

  const columnClasses = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-2 lg:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-4',
  };

  const iconColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  };

  return (
    <section className={`w-full py-20 px-6 ${bgColorClasses[bgColor]} ${maxWidthClasses[maxWidth]} mx-auto`}>
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`text-3xl md:text-4xl font-semibold ${titleColorClasses[titleColor]} mb-10 text-center`}
        >
          <MarkdownRenderer content={title} />
        </motion.h2>
      )}

      <div className={`grid grid-cols-1 ${columnClasses[columns]} gap-8`}>
        {pillars.map((pillar, index) => {
          const iconMapping: Record<string, string> = {
            'FaBook': 'Book',
            'FaHeart': 'Heart',
            'FaUsers': 'Users',
          };

          const iconName = iconMapping[pillar.icon] || pillar.icon;
          const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;

          // Determine button action
          const isModal = pillar.actionType === 'modal_block';
          const hasButton = pillar.buttonText && (pillar.buttonLink || isModal);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card bg-base-100 shadow-xl p-6 items-center text-center hover:shadow-2xl transition-shadow h-full"
            >
              <div className="mb-4">
                {pillar.lottie && pillar.lottie !== 'none' ? (
                  <PillarLottie file={pillar.lottie} />
                ) : (
                  <IconComponent
                    size={40}
                    className={iconColorClasses[pillar.iconColor || 'primary']}
                    strokeWidth={2}
                  />
                )}
              </div>
              <h3 className="font-bold text-lg mb-2 text-base-content">
                <MarkdownRenderer content={pillar.title} />
              </h3>
              <div className="text-sm text-base-content/80 mb-4 flex-grow">
                <MarkdownRenderer content={pillar.description} />
              </div>
              
              {hasButton && (
                 isModal ? (
                    <button 
                      onClick={() => openModal(pillar)}
                      className="btn btn-primary mt-auto gap-2"
                    >
                      {pillar.buttonText}
                      {/* Show icon based on mod type if possible, otherwise generic */}
                      {/* No icon needed */}
                    </button>
                 ) : (
                    <Link href={pillar.buttonLink || '#'} className="btn btn-primary mt-auto">
                      {pillar.buttonText}
                    </Link>
                 )
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Generic Block Modal */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box w-11/12 max-w-5xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          
           {/* Render Selected Mod */}
          {selectedPillar?.modalBlock && selectedPillar.modalBlock.modId && (
            <div className="py-4">
                {(() => {
                   const ModComponent = (ModComponents as any)[selectedPillar.modalBlock.modId];
                   if (!ModComponent) return <div className="text-error">Bloco {selectedPillar.modalBlock.modId} não encontrado.</div>;
                   
                   return <ModComponent {...selectedPillar.modalBlock.props} />;
                })()}
            </div>
          )}

          <div className="modal-action justify-center">
             <form method="dialog">
               <button className="btn">Fechar</button>
             </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
           <button>close</button>
        </form>
      </dialog>

    </section>
  );
}
