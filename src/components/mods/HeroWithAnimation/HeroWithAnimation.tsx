"use client";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import * as FontAwesomeIcons from "react-icons/fa6";
import { useEffect, useState } from "react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export interface HeroWithAnimationProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  lottieUrl: string;
  icon?: string; // Nome do ícone Lucide (ex: "Heart", "Cross")
  iconColor?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  gradientFrom?: "primary" | "secondary" | "accent" | "neutral";
  gradientTo?: "base-100" | "base-200" | "base-300";
  variant?: "fullscreen" | "compact"; // fullscreen = hero grande com bg | compact = hero simples sem bg
  titleColor?: "primary" | "secondary" | "accent" | "base-content";
  paddingY?: "sm" | "md" | "lg" | "xl";
}

const iconColorClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

const gradientFromClasses = {
  primary: "from-primary",
  secondary: "from-secondary",
  accent: "from-accent",
  neutral: "from-neutral",
};

const gradientToClasses = {
  "base-100": "to-base-100",
  "base-200": "to-base-200",
  "base-300": "to-base-300",
};

const titleColorClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  "base-content": "text-base-content",
};

const paddingYClasses = {
  sm: "py-8",
  md: "py-12",
  lg: "py-16",
  xl: "py-24",
};

export default function HeroWithAnimation({
  title = "",
  subtitle = "",
  backgroundImage,
  lottieUrl = "",
  icon,
  iconColor = "primary",
  gradientFrom = "accent",
  gradientTo = "base-100",
  variant = "fullscreen",
  titleColor = "primary",
  paddingY = "lg",
}: HeroWithAnimationProps) {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Não renderizar se não tiver título
  if (!title) {
    return null;
  }

  useEffect(() => {
    const { getLottieUrl } = require("@/utils/lottie-utils");
    const finalUrl = getLottieUrl(lottieUrl);
    
    if (!finalUrl) {
      setIsLoading(false);
      return;
    }

    fetch(finalUrl)
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("[HeroWithAnimation] Erro ao carregar Lottie:", err);
        setIsLoading(false);
      });
  }, [lottieUrl]);

  // Converter nome do ícone para componente (suporta Lucide e Font Awesome)
  const IconComponent = icon
    ? icon.startsWith('Fa')
      ? (FontAwesomeIcons as any)[icon] // Font Awesome (ex: FaBookBible)
      : (LucideIcons as any)[icon]      // Lucide (ex: Heart)
    : null;

  const gradientFromClass = gradientFromClasses[gradientFrom];
  const gradientToClass = gradientToClasses[gradientTo];
  const iconColorClass = iconColorClasses[iconColor];
  const titleColorClass = titleColorClasses[titleColor];
  const paddingYClass = paddingYClasses[paddingY];

  // Variante Fullscreen (hero grande com background)
  if (variant === "fullscreen") {
    return (
      <section
        className={`w-full h-screen bg-gradient-to-b ${gradientFromClass} ${gradientToClass} flex flex-col items-center justify-center text-center px-6 relative`}
      >
        {/* Só renderizar imagem se backgroundImage não for vazio */}
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="absolute inset-0 opacity-20 z-0 object-cover"
          />
        )}
        <div className="z-10">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-4xl md:text-6xl font-bold ${titleColorClass} drop-shadow`}
          >
            <MarkdownRenderer content={title} />
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-4 text-lg md:text-xl max-w-xl text-base-content drop-shadow"
          >
            <MarkdownRenderer content={subtitle} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="relative w-48 h-48 mt-6 mx-auto"
          >
            {/* Lottie como fundo */}
            {!isLoading && animationData && (
              <Lottie
                animationData={animationData}
                loop
                className="w-full h-full"
              />
            )}

            {/* Ícone sobreposto centralizado */}
            {IconComponent && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <IconComponent className={`w-12 h-12 ${iconColorClass}`} />
              </div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // Variante Compact (hero simples sem background)
  return (
    <motion.section
      className={`container mx-auto px-4 ${paddingYClass} space-y-10`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center space-y-4">
        <h1 className={`text-3xl md:text-4xl font-bold ${titleColorClass}`}>
          <MarkdownRenderer content={title} />
        </h1>
        <div className="text-lg max-w-3xl mx-auto text-base-content">
          <MarkdownRenderer content={subtitle} />
        </div>
        <div className="max-w-md mx-auto">
          {!isLoading && animationData && (
            <Lottie animationData={animationData} loop />
          )}
        </div>
      </div>
    </motion.section>
  );
}
