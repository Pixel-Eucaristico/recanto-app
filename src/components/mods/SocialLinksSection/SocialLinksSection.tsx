"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Linkedin, MessageCircle } from "lucide-react";

export interface SocialLinksSectionProps {
  title?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  whatsappUrl?: string;
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

export default function SocialLinksSection({
  title = "Conecte-se Conosco nas Redes",
  instagramUrl = "",
  facebookUrl = "",
  youtubeUrl = "",
  linkedinUrl = "",
  whatsappUrl = "",
  bgColor = "base-100",
  paddingY = "lg",
}: SocialLinksSectionProps) {
  
  // Helper para renderizar botão de rede social
  const SocialButton = ({ href, icon: Icon, label, colorClass }: any) => {
    if (!href) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-circle btn-lg ${colorClass} text-white shadow-lg hover:scale-110 transition-transform`}
        aria-label={label}
      >
        <Icon className="w-8 h-8" />
      </a>
    );
  };

  const hasLinks = instagramUrl || facebookUrl || youtubeUrl || linkedinUrl || whatsappUrl;

  if (!hasLinks && !title) return null;

  return (
    <section className={`${bgColorVariants[bgColor]} ${paddingYVariants[paddingY]} px-6 text-center`}>
      <div className="max-w-4xl mx-auto">
        {title && (
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-secondary mb-8"
          >
            {title}
          </motion.h3>
        )}
        
        {hasLinks && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <SocialButton href={instagramUrl} icon={Instagram} label="Instagram" colorClass="bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 border-none" />
            <SocialButton href={facebookUrl} icon={Facebook} label="Facebook" colorClass="bg-[#1877F2] border-none" />
            <SocialButton href={youtubeUrl} icon={Youtube} label="YouTube" colorClass="bg-[#FF0000] border-none" />
            <SocialButton href={linkedinUrl} icon={Linkedin} label="LinkedIn" colorClass="bg-[#0A66C2] border-none" />
            <SocialButton href={whatsappUrl} icon={MessageCircle} label="WhatsApp" colorClass="bg-[#25D366] border-none" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
