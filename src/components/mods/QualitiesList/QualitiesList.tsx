"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface QualitiesListProps {
  title?: string;
  items?: string[];
  titleColor?: 'primary' | 'secondary' | 'accent';
  iconColor?: 'primary' | 'secondary' | 'accent' | 'success';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
  textSize?: 'sm' | 'base' | 'lg' | 'xl';
  showIcons?: boolean;
}

const colorVariants = {
  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
  },
};

const bgColorVariants = {
  'base-100': 'bg-base-100',
  'base-200': 'bg-base-200',
  'base-300': 'bg-base-300',
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

const paddingYVariants = {
  sm: 'py-12',
  md: 'py-16',
  lg: 'py-20',
  xl: 'py-24',
};

const textSizeVariants = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export default function QualitiesList({
  title = "Quem Quer Caminhar Conosco?",
  items = [
    "Buscamos corações abertos à escuta e ao aprendizado contínuo.",
    "Almas que anseiam viver o Amor Misericordioso e o perdão.",
    "Pessoas dispostas à cura interior e ao autoconhecimento.",
    "Espíritos que desejam servir com amor aos mais necessitados.",
    "Quem busca a santidade na simplicidade do cotidiano.",
  ],
  titleColor = "primary",
  iconColor = "primary",
  maxWidth = "4xl",
  bgColor = "base-200",
  paddingY = "lg",
  textSize = "lg",
  showIcons = true,
}: QualitiesListProps) {
  return (
    <section className={`${bgColorVariants[bgColor]} ${paddingYVariants[paddingY]} px-6`}>
      <div className={`${maxWidthVariants[maxWidth]} mx-auto text-center`}>
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-3xl font-semibold ${colorVariants.text[titleColor]} mb-8`}
        >
          {title}
        </motion.h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`flex items-start gap-3 ${textSizeVariants[textSize]} text-left`}
            >
              {showIcons && (
                <Check className={`flex-shrink-0 w-5 h-5 mt-1 ${colorVariants.text[iconColor]}`} />
              )}
              <p className="text-base-content">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
