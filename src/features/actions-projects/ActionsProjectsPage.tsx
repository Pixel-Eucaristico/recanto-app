"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import HeroProjects from "@/features/main/components/HeroProjects";
import HeroEvangelization from "@/features/main/components/HeroEvangelization";

export default function ActionsProjectsPage() {
  return (
    <main className="flex flex-col items-center bg-base-200 text-base-content">
      {/* Hero */}
      <section className="relative w-full h-screen">
        <Image
          src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
          &quot;Não devias tu, igualmente, ter compaixão do teu conservo, como
          eu também tive misericórdia de ti?&quot;. Cada ação do Recanto é
          expressão concreta desse chamado divino à compaixão.
        </motion.p>
      </section>

      {/* Seção Ações */}
      <section className="card py-16 px-6 bg-base-100 w-full max-w-5xl">
        <motion.h3 className="text-3xl font-semibold text-primary mb-8 text-center">
          Nossas Ações
        </motion.h3>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "Acolhimento Fraterno",
              desc: "Oferecemos descanso e escuta sincera.",
              imgQ: "https://images.unsplash.com/photo-1580191947416-62d35a55e71d?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            },
            {
              title: "Escuta Compassiva",
              desc: "Tempo dedicado para ouvir e acolher.",
              imgQ: "https://images.unsplash.com/photo-1603518784464-22d0fe80c546?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            },
            {
              title: "Suporte Espiritual",
              desc: "Guia para cura interior e esperança.",
              imgQ: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            },
            {
              title: "Cuidado Essencial",
              desc: "Atendimento às necessidades básicas.",
              imgQ: "https://images.unsplash.com/photo-1617080090911-91409e3496ad?q=80&w=864&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            },
          ].map(({ title, desc, imgQ }) => (
            <motion.div
              key={title}
              className="flex flex-col items-center text-center space-y-4"
            >
              <Image
                src={imgQ}
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

      {/* Seção Projetos - Conectado ao CMS */}
      <HeroProjects />

      {/* Seção Evangelização - Conectado ao CMS */}
      <HeroEvangelization />

      {/* Footer com galeria simples */}
      <footer className="py-12 w-full bg-base-100 text-center">
        <motion.div
          className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-md mx-auto"
          layout
        >
          {[...Array(6)].map((_, i) => (
            <Image
              key={i}
              src={`https://images.unsplash.com/photo-1544026230-488aeae72c0d?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
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
