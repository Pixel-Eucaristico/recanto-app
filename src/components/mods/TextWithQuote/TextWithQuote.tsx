"use client";

import { motion } from "framer-motion";

export interface TextWithQuoteProps {
  title?: string;
  content?: string;
  quoteText?: string;
  quoteReference?: string;
  titleColor?: 'primary' | 'secondary' | 'accent';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
  textAlign?: 'left' | 'center' | 'justify';
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

export default function TextWithQuote({
  title = "Para quem o seu coração anseia?",
  content = "Aqui no Recanto do Amor Misericordioso, acreditamos que a vida ganha seu mais profundo sentido quando nos abrimos à compaixão e à misericórdia. Se seu coração arde por algo maior, Deus pode estar te chamando.",
  quoteText = "Não devias tu, igualmente, ter compaixão do teu conservo, como eu também tive misericórdia de ti?",
  quoteReference = "Mateus 18:33",
  titleColor = "primary",
  maxWidth = "4xl",
  bgColor = "base-200",
  paddingY = "lg",
  textAlign = "center",
}: TextWithQuoteProps) {
  return (
    <section className={`${bgColorVariants[bgColor]} ${paddingYVariants[paddingY]} px-6`}>
      <div className={`${maxWidthVariants[maxWidth]} mx-auto ${textAlignVariants[textAlign]}`}>
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-3xl font-semibold ${colorVariants.text[titleColor]} mb-6`}
        >
          {title}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-6"
        >
          <p className="text-lg text-base-content">
            {content}
          </p>
          {quoteText && (
            <div className="italic border-l-4 border-primary pl-4 py-2">
              <p className="text-base-content/80">
                &ldquo;{quoteText}&rdquo;
              </p>
              {quoteReference && (
                <p className="text-sm text-base-content/60 mt-2">
                  {quoteReference}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
