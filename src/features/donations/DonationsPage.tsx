"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import givingAnim from "@/assets/animations/mudar.json";
import donationAnim from "@/assets/animations/mudar.json";

export default function DonationsPage() {
  return (
    <main className="flex flex-col items-center bg-base-200 text-base-content">
      {/* Hero */}
      <section className="relative w-full h-screen">
        <Image
          src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Mãos unidas em oração e serviço"
          layout="fill"
          objectFit="cover"
          className="opacity-20"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-primary drop-shadow"
          >
            Doe Sentido: Sua Misericórdia Transforma Vidas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-lg md:text-xl text-secondary max-w-xl drop-shadow"
          >
            Cada gesto é uma semente que floresce em vidas transformadas. Seja providência!
          </motion.p>
        </div>
      </section>

      {/* Por que doar */}
      <section className="py-16 px-6 text-center max-w-3xl">
        <motion.h2 className="text-2xl font-semibold text-primary">
          Por que o seu SIM faz a diferença?
        </motion.h2>
        <motion.p className="mt-4 text-lg text-justify">
          Aqui no Recanto do Amor Misericordioso vivemos o chamado de Jesus (Mateus 18:33), oferecendo educação,
          cura e sentido para crianças e famílias. Sua doação é um ato de compaixão e esperança.
        </motion.p>
      </section>

      {/* Formas de doação */}
      <section className="card py-16 px-6 bg-base-100 w-full max-w-5xl">
        <motion.h3 className="text-3xl font-semibold text-secondary mb-8 text-center">
          Escolha como semear a Misericórdia
        </motion.h3>
        <motion.div className="grid md:grid-cols-2 gap-8">
          {[
            {
              label: "Doação Mensal",
              desc: "Torne‑se benfeitor e sustente nossos projetos com generosidade constante.",
              anim: donationAnim
            },
            {
              label: "Doação Única",
              desc: "Contribua com o valor que desejar. Cada ajuda é bem-vinda e faz diferença.",
              anim: givingAnim
            }
          ].map((opt) => (
            <motion.div key={opt.label} className="flex flex-col items-center text-center space-y-4 p-6 bg-base-100 rounded-box">
              <Lottie animationData={opt.anim} className="h-40 mx-auto" loop />
              <h4 className="text-xl font-semibold">{opt.label}</h4>
              <p>{opt.desc}</p>
              <button className="btn btn-primary mt-4">Quero doar</button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Transparência */}
      <section className="py-16 px-6 max-w-4xl text-center">
        <motion.h3 className="text-2xl font-semibold text-primary mb-4">
          Sua Confiança é Nosso Tesouro
        </motion.h3>
        <p>
          A Associação Padre Pio Angelotti, entidade responsável pelo Recanto, administra cada
          recurso com integridade e transparência, em prol da compaixão e educação contínua.
        </p>
      </section>

      {/* Oração */}
      <section className="card py-16 px-6 bg-base-100 max-w-4xl text-center">
        <motion.h3 className="text-2xl font-semibold text-secondary mb-4">
          Orar é Amar
        </motion.h3>
        <p className="mb-6">
          A sua intercessão nos fortalece. Ore conosco pelos nossos missionários, recantianos e famílias.
        </p>
        <button className="btn btn-outline">Enviar Intenção de Oração</button>
      </section>

      {/* Footer */}
      <footer className="py-12 w-full text-center">
        <p className="mt-6 text-xl font-semibold">Paz e Unção!</p>
      </footer>
    </main>
  );
}
