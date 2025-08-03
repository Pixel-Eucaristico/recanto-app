"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";

import callingAnimation from "@/assets/animations/mudar.json";
import formationAnimation from "@/assets/animations/mudar.json";

export default function VocationalPage() {
  return (
    <main className="flex flex-col items-center bg-base-200 text-base-content">
      {/* Banner */}
      <section className="relative w-full h-screen">
        <Image
          src="https://source.unsplash.com/featured/?sunrise,path"
          alt="Caminho iluminado"
          layout="fill"
          objectFit="cover"
          className="opacity-20"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-primary drop-shadow"
          >
            Vocacional: Acolha o Chamado
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-lg md:text-xl text-secondary drop-shadow"
          >
            Sente no coração o desejo de uma vida plena no Amor Misericordioso?
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="w-64 h-64 mt-6"
          >
            <Lottie animationData={callingAnimation} loop />
          </motion.div>
        </div>
      </section>

      {/* Seção 1: O Chamado */}
      <section className="py-20 px-6 max-w-4xl text-center">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-primary"
        >
          Para quem o seu coração anseia?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 text-lg text-justify"
        >
          Aqui no Recanto do Amor Misericordioso, acreditamos que a vida ganha
          seu mais profundo sentido quando nos abrimos à compaixão e à
          misericórdia. Lembra-se das palavras de Jesus: “Não devias tu,
          igualmente, ter compaixão do teu conservo, como eu também tive
          misericórdia de ti?” (Mateus 18:33). Se seu coração arde por algo
          maior, Deus pode estar te chamando.
        </motion.p>
        {/* vídeo embed placeholder */}
      </section>

      {/* Seção 2: Formação */}
      <section className="py-20 bg-white px-6 max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-secondary mb-6 text-center"
        >
          Um Caminho de Crescimento e Entrega
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {[
            {
              title: "Encarnação",
              desc: "Chamado à humildade e serviço. Um tempo de autoconhecimento e primeiros atos de misericórdia.",
            },
            {
              title: "Crucificação",
              desc: "Aprofundamos a entrega. Compreendemos o valor do sacrifício por amor ao próximo.",
            },
            {
              title: "Eucaristia",
              desc: "Mergulho na fonte do Amor Misericordioso, que nos capacita a transbordar esse amor no mundo.",
            },
          ].map((etapa) => (
            <div key={etapa.title} className="space-y-4 text-center">
              <Lottie
                animationData={formationAnimation}
                className="h-32 mx-auto"
                loop
              />
              <h3 className="text-xl font-semibold">{etapa.title}</h3>
              <p className="text-gray-700">{etapa.desc}</p>
            </div>
          ))}
        </motion.div>
        <div className="mt-8 p-4 bg-base-100 rounded-box text-center">
          <p className="text-base-content">
            Experiência Carismática de dois anos - porta de entrada à Comunidade
            de Vida, com acompanhamento vocacional dedicado.
          </p>
        </div>
      </section>

      {/* Seção 3: Qualidades Vocacionais */}
      <section className="py-20 px-6 max-w-4xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-primary mb-6"
        >
          Quem Quer Caminhar Conosco?
        </motion.h2>
        <div className="space-y-4 text-justify text-lg">
          <p>Buscamos corações abertos à escuta e ao aprendizado contínuo.</p>
          <p>Almas que anseiam viver o Amor Misericordioso e o perdão.</p>
          <p>Pessoas dispostas à cura interior e ao autoconhecimento.</p>
          <p>Espíritos que desejam servir com amor aos mais necessitados.</p>
          <p>Quem busca a santidade na simplicidade do cotidiano.</p>
        </div>
      </section>

      {/* Seção 4: Formulário */}
      <section className="py-20 bg-base-100 px-6 w-full max-w-md">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-semibold text-secondary text-center mb-4"
        >
          Queremos Conhecer Sua História
        </motion.h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            className="input input-bordered w-full"
          />
          <input
            type="email"
            placeholder="E‑mail"
            className="input input-bordered w-full"
          />
          <input
            type="tel"
            placeholder="Telefone"
            className="input input-bordered w-full"
          />
          <textarea
            placeholder="Conte um pouco do seu desejo vocacional"
            className="textarea textarea-bordered w-full h-32"
          />
          <button type="submit" className="btn btn-primary w-full">
            Quero Discernir Minha Vocação
          </button>
        </form>
      </section>

      {/* Rodapé */}
      <footer className="py-12 text-center">
        <p className="text-lg font-semibold">Paz e Unção!</p>
        <Image
          src="https://source.unsplash.com/featured/?virgin,mary"
          alt="Nossa Senhora Mãe do Amor Misericordioso"
          width={100}
          height={150}
          className="mx-auto mt-4 rounded-full shadow-md"
        />
      </footer>
    </main>
  );
}
