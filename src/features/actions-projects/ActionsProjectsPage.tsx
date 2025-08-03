"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import project from "@/assets/animations/mudar.json";
import evangelize from "@/assets/animations/mudar.json";

export default function ActionsProjectsPage() {
  return (
    <main className="flex flex-col items-center bg-base-200 text-base-content">
      {/* Hero */}
      <section className="relative w-full h-screen">
        <Image
          src="https://source.unsplash.com/featured/?service,community"
          alt="Serviço e compaixão"
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
            Nossa Missão em Ação
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-lg md:text-xl text-secondary max-w-xl drop-shadow"
          >
            Em cada gesto, um abraço de misericórdia.
          </motion.p>
        </div>
      </section>

      {/* Introdutória com versículo */}
      <section className="py-16 px-6 text-center max-w-3xl">
        <motion.h2 className="text-2xl font-semibold text-primary">
          Vivendo Mateus 18:33
        </motion.h2>
        <motion.p className="mt-4 text-lg text-justify">
          &quot;Não devias tu, igualmente, ter compaixão do teu conservo, como eu também tive misericórdia de ti?&quot;.
          Cada ação do Recanto é expressão concreta desse chamado divino à compaixão.
        </motion.p>
      </section>

      {/* Seção Ações */}
      <section className="py-16 px-6 bg-white w-full max-w-5xl">
        <motion.h3 className="text-3xl font-semibold text-primary mb-8 text-center">
          Nossas Ações
        </motion.h3>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { title: "Acolhimento Fraterno", desc: "Oferecemos descanso e escuta sincera.", imgQ: "welcome" },
            { title: "Escuta Compassiva", desc: "Tempo dedicado para ouvir e acolher.", imgQ: "listening" },
            { title: "Suporte Espiritual", desc: "Guia para cura interior e esperança.", imgQ: "support" },
            { title: "Cuidado Essencial", desc: "Atendimento às necessidades básicas.", imgQ: "care" }
          ].map(({ title, desc, imgQ }) => (
            <motion.div key={title} className="flex flex-col items-center text-center space-y-4">
              <Image
                src={`https://source.unsplash.com/featured/?${imgQ}`}
                alt={title}
                width={300}
                height={200}
                className="rounded-lg shadow-md"
              />
              <h4 className="text-xl font-semibold">{title}</h4>
              <p>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Seção Projetos */}
      <section className="py-16 px-6 w-full max-w-5xl">
        <motion.h3 className="text-3xl font-semibold text-secondary mb-8 text-center">
          Nossos Projetos
        </motion.h3>
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[
            {
              title: "Educação Integral",
              desc: "Formação cristã para crianças e jovens.",
              anim: project
            },
            {
              title: "Formação Missionária",
              desc: "Capacitação contínua para servir com sabedoria.",
              anim: project
            },
            {
              title: "Expansão do Acolhimento",
              desc: "Ampliação dos espaços para acolher mais vidas.",
              anim: project
            }
          ].map(({ title, desc, anim }) => (
            <div key={title} className="space-y-4 text-center">
              <Lottie animationData={anim} className="h-32 mx-auto" loop />
              <h4 className="text-xl font-semibold">{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Seção Evangelização */}
      <section className="py-16 px-6 bg-white w-full max-w-5xl">
        <motion.h3 className="text-3xl font-semibold text-primary mb-8 text-center">
          Nossa Evangelização
        </motion.h3>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { title: "Escola da Confiança", desc: "Aprender a entregar-se a Deus.", anim: evangelize },
            { title: "Testemunho Comunitário", desc: "Nossa vida é anúncio do Amor Misericordioso.", anim: evangelize },
            { title: "Eventos e Retiros", desc: "Missas, adorações e formação aberta.", anim: evangelize },
            { title: "Presença Digital", desc: "Compartilhamos fé e oração online.", anim: evangelize }
          ].map(({ title, desc, anim }) => (
            <div key={title} className="space-y-4 text-center">
              <Lottie animationData={anim} className="h-32 mx-auto" loop />
              <h4 className="text-xl font-semibold">{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer com galeria simples */}
      <footer className="py-12 w-full bg-base-100 text-center">
        <motion.div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-md mx-auto" layout>
          {[...Array(6)].map((_, i) => (
            <Image
              key={i}
              src={`https://source.unsplash.com/featured/?charity,help,people?sig=${i}`}
              alt=""
              width={80}
              height={80}
              className="rounded-full shadow-sm"
            />
          ))}
        </motion.div>
        <p className="mt-6 text-xl font-semibold">Paz e Unção!</p>
      </footer>
    </main>
  );
}
