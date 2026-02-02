"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export interface FormationStage {
  title: string;
  description: string;
  lottieUrl?: string;
}

export interface FormationStagesProps {
  title?: string;
  subtitle?: string;
  stages?: FormationStage[];
  columns?: '2' | '3' | '4';
  titleColor?: 'primary' | 'secondary' | 'accent';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
}

const colorVariants = {
  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  },
};

const bgColorVariants = {
  'base-100': 'bg-base-100',
  'base-200': 'bg-base-200',
  'base-300': 'bg-base-300',
};

const columnsVariants = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-3',
  '4': 'md:grid-cols-4',
};

const maxWidthVariants = {
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  'full': 'max-w-full',
};

const paddingYVariants = {
  sm: 'py-12',
  md: 'py-16',
  lg: 'py-20',
  xl: 'py-24',
};

function StageCard({ stage }: { stage: FormationStage }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (stage.lottieUrl && stage.lottieUrl.trim() !== '') {
      // Normalizar URL: se não começar com / ou http, adicionar /animations/
      let animationPath = stage.lottieUrl;
      if (!stage.lottieUrl.startsWith('/') && !stage.lottieUrl.startsWith('http')) {
        animationPath = `/animations/${stage.lottieUrl}`;
      }

      fetch(animationPath)
        .then((res) => {
          // Verificar se a resposta é JSON válido
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          }
          // Silenciosamente ignorar se não for JSON
          return null;
        })
        .then((data) => {
          if (data) {
            setAnimationData(data);
          }
        })
        .catch(() => {
          // Silenciosamente ignorar erros de carregamento
          setAnimationData(null);
        });
    }
  }, [stage.lottieUrl]);

  return (
    <div className="space-y-4 text-center">
      {animationData && (
        <Lottie
          animationData={animationData}
          className="h-32 mx-auto"
          loop
        />
      )}
      <h3 className="text-xl font-semibold text-base-content">
        <MarkdownRenderer content={stage.title} />
      </h3>
      <div className="text-base-content/80">
        <MarkdownRenderer content={stage.description} />
      </div>
    </div>
  );
}

export default function FormationStages({
  title = "",
  subtitle = "",
  stages = [],
  columns = "3",
  titleColor = "secondary",
  bgColor = "base-100",
  maxWidth = "5xl",
  paddingY = "lg",
}: FormationStagesProps) {
  // Não renderizar se não tiver conteúdo essencial
  if (!title && stages.length === 0) {
    return null;
  }
  return (
    <section className={`${bgColorVariants[bgColor]} ${paddingYVariants[paddingY]} px-6`}>
      <div className={`${maxWidthVariants[maxWidth]} mx-auto`}>
        {title && (
          <motion.h2
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-3xl font-semibold ${colorVariants.text[titleColor]} mb-6 text-center`}
          >
            <MarkdownRenderer content={title} />
          </motion.h2>
        )}
        <motion.div
          className={`grid ${columnsVariants[columns]} gap-8`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {stages.map((stage, index) => (
            <StageCard key={index} stage={stage} />
          ))}
        </motion.div>
          <div className="mt-8 p-4 bg-base-200 rounded-box text-center">
            <div className="text-base-content">
              <MarkdownRenderer content={subtitle} />
            </div>
          </div>
      </div>
    </section>
  );
}
