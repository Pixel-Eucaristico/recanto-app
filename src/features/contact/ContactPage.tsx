"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import contactAnim from "@/assets/animations/contact-us.json";

export default function ContactPage() {
  return (
    <main className="flex flex-col items-center bg-base-200 text-base-content">
      {/* Hero */}
      <section className="relative w-full h-screen">
        <Image
          src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Conexão e acolhimento"
          fill
          className="opacity-20 object-cover"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-primary drop-shadow"
          >
            Contatos: Estenda a Mão, Encontre o Recanto
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-lg md:text-xl text-secondary max-w-xl drop-shadow"
          >
            Sua busca tem um lar. Conecte-se conosco no caminho do Amor Misericordioso.
          </motion.p>
        </div>
      </section>

      {/* Chamada emocional */}
      <section className="py-16 px-6 text-center max-w-3xl">
        <motion.h2 className="text-2xl font-semibold text-primary">
          Precisando de um ombro? Buscando um caminho?
        </motion.h2>
        <motion.p className="mt-4 text-lg text-justify">
          Cremos no poder da escuta e do encontro. Seja qual for sua necessidade, queremos te ouvir
          com compaixão. Cada contato é uma oportunidade de semear esperança.
        </motion.p>
      </section>

      {/* Formulário e contatos */}
      <section className="card py-16 px-6 bg-base-100 w-full max-w-4xl">
        <motion.h3 className="text-3xl font-semibold text-secondary mb-8 text-center">
          Fale Conosco
        </motion.h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <motion.form
            className="space-y-4 p-6 rounded-box bg-base-100 shadow"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <input type="text" placeholder="Nome Completo" className="input input-bordered w-full" />
            <input type="email" placeholder="E‑mail" className="input input-bordered w-full" />
            <input type="tel" placeholder="Telefone (opcional)" className="input input-bordered w-full" />
            <select className="select select-bordered w-full" defaultValue="">
              <option disabled value="">Assunto</option>
              <option>Dúvida Geral</option>
              <option>Ajuda/Apoio</option>
              <option>Vocação</option>
              <option>Doação</option>
              <option>Parceria</option>
              <option>Outros</option>
            </select>
            <textarea placeholder="Sua mensagem" className="textarea textarea-bordered w-full h-32" />
            <button type="submit" className="btn btn-primary w-full">Enviar Mensagem</button>
          </motion.form>

          {/* WhatsApp e Telefone */}
          <motion.div
            className="space-y-6 p-6 rounded-box bg-base-100 shadow"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h4 className="text-xl font-semibold">WhatsApp</h4>
            <button className="btn btn-secondary">Conversar no WhatsApp</button>
            <h4 className="text-xl font-semibold mt-4">Telefone</h4>
            <p>Atendimento de segunda a sexta, das 8h às 17h</p>
            <p>(XX) XXXX‑XXXX (Geral)</p>
          </motion.div>
        </div>
      </section>

      {/* Localização */}
      <section className="py-16 px-6 w-full max-w-5xl">
        <motion.h3 className="text-3xl font-semibold text-primary mb-6 text-center">
          Nossa Casa é Sua Casa
        </motion.h3>
        <div className="space-y-4 text-center">
          <p>Rua das Flores, 123 – Bairro da Esperança – Cidade, Estado – CEP 00000-000</p>
          <p>Para visitar, agende conosco previamente para um acolhimento digno.</p>
        </div>
        {/* Aqui você pode integrar Google Maps embed */}
      </section>

      {/* Redes sociais */}
      <section className="card py-16 px-6 bg-base-100 text-center">
        <motion.h3 className="text-3xl font-semibold text-secondary mb-4">
          Conecte-se Conosco nas Redes
        </motion.h3>
        <div className="flex justify-center gap-6">
          {/* Ícones das redes sociais */}
          <a href="#"><Image src="/icons/instagram.svg" width={40} height={40} alt="Instagram" /></a>
          <a href="#"><Image src="/icons/facebook.svg" width={40} height={40} alt="Facebook" /></a>
          <a href="#"><Image src="/icons/youtube.svg" width={40} height={40} alt="YouTube" /></a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center">
        <motion.div className="w-32 h-32 mx-auto">
          <Lottie animationData={contactAnim} loop />
        </motion.div>
        <p className="mt-6 text-xl font-semibold">Paz e Unção!</p>
        <p className="mt-2 italic">“Não devias tu também ter compaixão...” – Mateus 18:33</p>
      </footer>
    </main>
  );
}
