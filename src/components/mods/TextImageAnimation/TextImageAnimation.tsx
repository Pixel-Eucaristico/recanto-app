"use client";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface TextImageAnimationProps {
  title: string;
  titleColor?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  paragraphs: string[];
  image: string;
  imageAlt: string;
  lottieUrl: string;
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

export default function TextImageAnimation({
  title,
  titleColor = "primary",
  paragraphs,
  image,
  imageAlt,
  lottieUrl,
  layout = "text-left",
  animationDirection = "left",
}: TextImageAnimationProps) {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Garantir que paragraphs seja sempre um array
  const safeParagraphs = Array.isArray(paragraphs) ? paragraphs : [];

  useEffect(() => {
    // Só buscar animação se lottieUrl não for vazio
    if (!lottieUrl) {
      setIsLoading(false);
      return;
    }

    fetch(lottieUrl)
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [lottieUrl]);

  const titleColorClass = titleColorClasses[titleColor];
  const animationXValue = animationDirection === "left" ? -50 : 50;

  return (
    <section className="w-full py-20 flex flex-col items-center text-center px-6">
      <motion.h2
        initial={{ opacity: 0, x: animationXValue }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={`text-3xl font-bold ${titleColorClass}`}
      >
        {title}
      </motion.h2>
      <div className="mt-8 grid md:grid-cols-2 gap-10 items-center max-w-6xl">
        {/* Text Content */}
        <div
          className={`space-y-4 text-justify text-base-content ${
            layout === "text-right" ? "order-1 md:order-2" : ""
          }`}
        >
          {safeParagraphs.map((paragraph, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}
        </div>

        {/* Image + Animation */}
        <div
          className={`flex flex-col items-center ${
            layout === "text-right" ? "order-2 md:order-1" : ""
          }`}
        >
          {/* Só renderizar imagem se image não for vazio */}
          {image && (
            <Image
              src={image}
              alt={imageAlt || "Imagem"}
              width={400}
              height={300}
              className="rounded-box shadow-xl"
            />
          )}
          {/* Só renderizar animação se houver lottieUrl */}
          {lottieUrl && (
            <div className="w-40 h-40 mt-6">
              {!isLoading && animationData && (
                <Lottie animationData={animationData} loop />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
