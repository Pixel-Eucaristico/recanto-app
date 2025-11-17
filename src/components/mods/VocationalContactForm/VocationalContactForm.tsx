"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export interface VocationalContactFormProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonColor?: 'primary' | 'secondary' | 'accent';
  titleColor?: 'primary' | 'secondary' | 'accent';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showMessage?: boolean;
}

const colorVariants = {
  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  },
  button: {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
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
};

const paddingYVariants = {
  sm: 'py-12',
  md: 'py-16',
  lg: 'py-20',
  xl: 'py-24',
};

export default function VocationalContactForm({
  title = "Queremos Conhecer Sua História",
  subtitle = "",
  buttonText = "Quero Discernir Minha Vocação",
  buttonColor = "primary",
  titleColor = "secondary",
  maxWidth = "md",
  bgColor = "base-100",
  paddingY = "lg",
  showName = true,
  showEmail = true,
  showPhone = true,
  showMessage = true,
}: VocationalContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simula envio (implementar integração real posteriormente)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Aqui você pode adicionar lógica de envio real
    alert("Formulário enviado com sucesso! Entraremos em contato em breve.");

    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section className={`${bgColorVariants[bgColor]} ${paddingYVariants[paddingY]} px-6 w-full flex justify-center`}>
      <div className={`${maxWidthVariants[maxWidth]} w-full`}>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={`text-2xl font-semibold ${colorVariants.text[titleColor]} text-center mb-4`}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center text-base-content/80 mb-6"
          >
            {subtitle}
          </motion.p>
        )}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {showName && (
            <input
              type="text"
              name="name"
              placeholder="Nome"
              required={showName}
              className="input input-bordered w-full"
            />
          )}
          {showEmail && (
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              required={showEmail}
              className="input input-bordered w-full"
            />
          )}
          {showPhone && (
            <input
              type="tel"
              name="phone"
              placeholder="Telefone"
              required={showPhone}
              className="input input-bordered w-full"
            />
          )}
          {showMessage && (
            <textarea
              name="message"
              placeholder="Conte um pouco do seu desejo vocacional"
              required={showMessage}
              className="textarea textarea-bordered w-full h-32"
            />
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn ${colorVariants.button[buttonColor]} w-full`}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                Enviando...
              </>
            ) : (
              buttonText
            )}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
