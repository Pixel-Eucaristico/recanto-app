"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export interface ContactSectionProps {
  // Configurações da Seção
  title?: string;
  subtitle?: string;
  bgColor?: 'base-100' | 'base-200' | 'base-300';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Configurações do Formulário
  formTitle?: string;
  showName?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showSubject?: boolean;
  showMessage?: boolean;
  buttonText?: string;
  buttonColor?: 'primary' | 'secondary' | 'accent';
  
  // Configurações de Informações de Contato (Lateral)
  infoTitle?: string;
  whatsappText?: string;
  whatsappLink?: string;
  whatsappButtonText?: string;
  phoneTitle?: string;
  phoneText?: string;
  scheduleText?: string;
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

export default function ContactSection({
  title = "Fale Conosco",
  subtitle = "",
  bgColor = "base-100",
  paddingY = "lg",
  formTitle = "Envie uma Mensagem",
  showName = true,
  showEmail = true,
  showPhone = true,
  showSubject = true,
  showMessage = true,
  buttonText = "Enviar Mensagem",
  buttonColor = "primary",
  infoTitle = "Outros Canais",
  whatsappText = "Converse diretamente conosco",
  whatsappLink = "",
  whatsappButtonText = "Conversar no WhatsApp",
  phoneTitle = "Telefone",
  phoneText = "(XX) XXXX-XXXX",
  scheduleText = "Atendimento de segunda a sexta, das 8h às 17h",
}: ContactSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Falha no envio');
      }

      alert("Mensagem enviada com sucesso!");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Erro ao enviar via API:', error);
      
      // Fallback: Mailto
      const mailtoSubject = encodeURIComponent(data.subject || `Contato de ${data.name}`);
      const mailtoBody = encodeURIComponent(
        `Nome: ${data.name}\nEmail: ${data.email}\nTelefone: ${data.phone}\n\nMensagem:\n${data.message}`
      );
      
      // Tenta abrir o cliente de email padrão
      window.location.href = `mailto:?subject=${mailtoSubject}&body=${mailtoBody}`;
      
      alert("Não foi possível enviar automaticamente. Abrindo seu gerenciador de e-mails...");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`${bgColorVariants[bgColor]} ${paddingYVariants[paddingY]} px-6 w-full`}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center text-primary mb-2"
          >
            <MarkdownRenderer content={title} />
          </motion.h2>
        )}
        {subtitle && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center text-lg text-base-content/80 mb-12 max-w-2xl mx-auto"
          >
            <MarkdownRenderer content={subtitle} />
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              {formTitle && <h3 className="card-title text-secondary mb-4"><MarkdownRenderer content={formTitle} /></h3>}
              <form onSubmit={handleSubmit} className="space-y-4">
                {showName && <input type="text" name="name" placeholder="Nome Completo" className="input input-bordered w-full" required />}
                {showEmail && <input type="email" name="email" placeholder="E-mail" className="input input-bordered w-full" required />}
                {showPhone && <input type="tel" name="phone" placeholder="Telefone" className="input input-bordered w-full" />}
                {showSubject && (
                  <select name="subject" className="select select-bordered w-full" defaultValue="">
                    <option disabled value="">Assunto</option>
                    <option>Dúvida Geral</option>
                    <option>Ajuda/Apoio</option>
                    <option>Vocação</option>
                    <option>Doação</option>
                    <option>Parceria</option>
                    <option>Outros</option>
                  </select>
                )}
                {showMessage && <textarea name="message" placeholder="Sua mensagem" className="textarea textarea-bordered w-full h-32" required />}
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`btn btn-${buttonColor} w-full mt-4`}
                >
                  {isSubmitting ? 'Enviando...' : buttonText}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Informações de Contato */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-secondary mb-6"><MarkdownRenderer content={infoTitle} /></h3>
              
              {/* WhatsApp Block */}
              <div className="card bg-base-200 p-6 mb-6">
                <h4 className="font-semibold text-lg mb-2">WhatsApp</h4>
                <div className="text-base-content/70 mb-4"><MarkdownRenderer content={whatsappText} /></div>
                <a 
                  href={whatsappLink || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-success w-full gap-2"
                >
                  {whatsappButtonText}
                </a>
              </div>

              {/* Phone Block */}
              <div className="pl-2 border-l-4 border-primary/30">
                <h4 className="font-semibold text-lg mb-1"><MarkdownRenderer content={phoneTitle} /></h4>
                <div className="text-xl font-bold text-primary mb-1"><MarkdownRenderer content={phoneText} /></div>
                <div className="text-sm text-base-content/60"><MarkdownRenderer content={scheduleText} /></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
