"use client";

import { motion } from "framer-motion";

export interface TextWithQuoteProps {
  title?: string;
  content?: string;
  quoteText?: string;
  quoteReference?: string;
  afterQuote?: string;
  titleColor?: 'primary' | 'secondary' | 'accent';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
  textAlign?: 'left' | 'center' | 'justify';
  animationFile?: string;
}

const colorVariants = {
  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  },
};

const maxWidthVariants = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
};

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

const textAlignVariants = {
  left: 'text-left',
  center: 'text-center',
  justify: 'text-justify',
};

import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import { useState, useEffect } from 'react';

export default function TextWithQuote({
  title = "",
  content = "",
  quoteText = "",
  quoteReference = "",
  afterQuote = "",
  titleColor = "primary",
  maxWidth = "4xl",
  bgColor = "base-200",
  paddingY = "lg",
  textAlign = "center",
  animationFile = "",
}: TextWithQuoteProps) {
  // Não renderizar se não tiver conteúdo
  if (!title && !content && !quoteText && !afterQuote) {
    return null;
  }

  return (
    <section className={`${bgColorVariants[bgColor]} ${paddingYVariants[paddingY]} px-6`}>
      <div className={`${maxWidthVariants[maxWidth]} mx-auto ${textAlignVariants[textAlign]}`}>
        {/* Animação (se houver) */}
        {animationFile && animationFile !== 'none' && (
          <div className="w-32 h-32 mx-auto mb-6">
            <AnimationRenderer file={animationFile} />
          </div>
        )}

        {title && (
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-3xl font-semibold ${colorVariants.text[titleColor]} mb-6`}
          >
            <MarkdownRenderer content={title} />
          </motion.h2>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-6"
        >
          {content && (
            <div className="text-lg text-base-content">
              <MarkdownRenderer content={content} />
            </div>
          )}
          {quoteText && (
            <div className="italic border-l-4 border-primary pl-4 py-2">
              <div className="text-base-content/80">
                <MarkdownRenderer content={`“${quoteText}”`} />
              </div>
              {quoteReference && (
                <div className="text-sm text-base-content/60 mt-2">
                  <MarkdownRenderer content={quoteReference} />
                </div>
              )}
            </div>
          )}
          {afterQuote && (
            <div className="text-lg text-base-content mt-4">
              <MarkdownRenderer content={afterQuote} />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function AnimationRenderer({ file }: { file: string }) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    if (!file || file === 'none') return;

    const { getLottieUrl } = require("@/utils/lottie-utils");
    const finalUrl = getLottieUrl(file);

    fetch(finalUrl)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Erro ao carregar animação:', err));
  }, [file]);

  if (!animationData) return null;

  return <Lottie animationData={animationData} loop />;
}

