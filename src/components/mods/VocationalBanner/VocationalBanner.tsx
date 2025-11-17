"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface VocationalBannerProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  lottieUrl?: string;
  backgroundOpacity?: 'light' | 'medium' | 'dark';
  titleColor?: 'primary' | 'secondary' | 'accent';
  subtitleColor?: 'primary' | 'secondary' | 'accent';
  animationSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const opacityVariants = {
  light: 'opacity-10',
  medium: 'opacity-20',
  dark: 'opacity-30',
};

const colorVariants = {
  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  },
};

const animationSizeVariants = {
  sm: 'w-48 h-48',
  md: 'w-64 h-64',
  lg: 'w-80 h-80',
  xl: 'w-96 h-96',
};

export default function VocationalBanner({
  title = "Vocacional: Acolha o Chamado",
  subtitle = "Sente no coração o desejo de uma vida plena no Amor Misericordioso?",
  backgroundImage = "https://images.unsplash.com/photo-1683009427513-28e163402d16?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0",
  lottieUrl = "/animations/career-animation.json",
  backgroundOpacity = "medium",
  titleColor = "primary",
  subtitleColor = "secondary",
  animationSize = "md",
}: VocationalBannerProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (lottieUrl) {
      fetch(lottieUrl)
        .then((res) => res.json())
        .then((data) => setAnimationData(data))
        .catch((error) => console.error("Erro ao carregar animação:", error));
    }
  }, [lottieUrl]);

  return (
    <section className="relative w-full h-screen">
      <Image
        src={backgroundImage}
        alt="Imagem de fundo"
        fill
        className={`object-cover ${opacityVariants[backgroundOpacity]}`}
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-4xl md:text-6xl font-bold ${colorVariants.text[titleColor]} drop-shadow`}
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={`mt-4 text-lg md:text-xl ${colorVariants.text[subtitleColor]} drop-shadow`}
        >
          {subtitle}
        </motion.p>
        {animationData && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className={`mt-6 ${animationSizeVariants[animationSize]}`}
          >
            <Lottie animationData={animationData} loop />
          </motion.div>
        )}
      </div>
    </section>
  );
}
