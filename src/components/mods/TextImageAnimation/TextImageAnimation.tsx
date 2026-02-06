"use client";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface TextImageAnimationProps {
  title?: string;
  titleColor?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  paragraphs?: string[];
  image?: string;
  imageAlt?: string;
  lottieUrl?: string;
  layout?: "text-left" | "text-right";
  animationDirection?: "left" | "right";
}

const titleColorClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

export default function TextImageAnimation({
  title = "",
  titleColor = "primary",
  paragraphs = [],
  image = "",
  imageAlt = "",
  lottieUrl = "",
  layout = "text-left",
  animationDirection = "left",
}: TextImageAnimationProps) {
  // Não renderizar se não tiver conteúdo essencial
  if (!title && paragraphs.length === 0) {
    return null;
  }
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Garantir que paragraphs seja sempre um array
  const safeParagraphs = Array.isArray(paragraphs) ? paragraphs : [];

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
        console.error("[TextImageAnimation] Erro ao carregar Lottie:", err);
        setIsLoading(false);
      });
  }, [lottieUrl]);

  const titleColorClass = titleColorClasses[titleColor];
  const animationXValue = animationDirection === "left" ? -50 : 50;

  return (
    <section className="w-full py-6 md:py-10 flex flex-col items-center px-6 overflow-hidden">
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className={`text-xl md:text-2xl font-extrabold tracking-tight mb-0.5 ${titleColorClass}`}
        >
          <MarkdownRenderer content={title} />
        </motion.h2>
      )}
      
      <div className="mt-6 grid md:grid-cols-2 gap-6 lg:gap-10 items-center max-w-4xl w-full">
        {/* Text Content */}
        <div
          className={`space-y-3 text-base-content/90 leading-relaxed text-sm md:text-base ${
            layout === "text-right" ? "md:order-2" : "md:order-1"
          }`}
        >
          {safeParagraphs.map((paragraph, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: layout === "text-right" ? 15 : -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <MarkdownRenderer content={paragraph} />
            </motion.div>
          ))}
        </div>

        {/* Image + Animation Container */}
        <div
          className={`relative flex flex-col items-center justify-center ${
            layout === "text-right" ? "md:order-1" : "md:order-2"
          }`}
        >
          {/* Image with Decorative Backdrop */}
          {image && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative group w-full max-w-[320px]"
            >
              <div className="absolute -inset-2 bg-primary/5 rounded-xl blur-lg group-hover:bg-primary/10 transition-colors" />
              <Image
                src={image}
                alt={imageAlt || "Imagem ilustrativa"}
                width={320}
                height={210}
                className="relative rounded-lg shadow-lg border border-base-content/5 object-cover w-full h-auto aspect-[3/2]"
              />
            </motion.div>
          )}

          {/* Lottie Animation */}
          {lottieUrl && (
            <div className={`mt-3 relative transition-all duration-500 ${image ? '-mt-6 md:-mt-10' : ''}`}>
              {isLoading ? (
                <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
                  <span className="loading loading-ring loading-sm text-primary/30"></span>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-20 h-20 md:w-28 md:h-28 drop-shadow-lg"
                >
                  {animationData && <Lottie animationData={animationData} loop />}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
