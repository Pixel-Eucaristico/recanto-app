"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaCross, FaHeart, FaPrayingHands } from "react-icons/fa";

export default function InfograficoPage() {
  return (
    <main className="bg-gradient-to-b from-[#fef9f3] to-[#fff] text-[#402f2c] font-serif">
      {/* Cabeçalho */}
      <header className="text-center py-10 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-[#6b2e2e]"
        >
          Nossa Senhora Mãe do Amor Misericordioso
        </motion.h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-[#5a4a47]">
          Um infográfico interativo sobre fé, devoção e espiritualidade
          inspirado pela Comunidade Recanto do Amor Misericordioso.
        </p>
      </header>

      {/* Seções */}
      <section className="space-y-20 px-6 pb-20">
        {/* 1. Quem é Nossa Senhora do Amor Misericordioso */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-[#6b2e2e] mb-4">
            Quem é Nossa Senhora do Amor Misericordioso?
          </h2>
          <p className="text-[#5a4a47]">
            Nossa Senhora do Amor Misericordioso é invocada como a Mãe que
            intercede com compaixão infinita por seus filhos. Sua mensagem
            convida à conversão, paz, perdão e misericórdia. É venerada por
            inspirar obras de caridade e comunidades de fé.
          </p>
        </motion.div>

        {/* 2. Simbologia */}
        <motion.div
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.2 }}
          variants={{
            hidden: {},
            visible: {},
          }}
        >
          {[
            {
              icon: <FaCross size={48} />,
              title: "Cruz",
              desc: "Representa o sacrifício redentor e o chamado à fé.",
            },
            {
              icon: <FaPrayingHands size={48} />,
              title: "Oração",
              desc: "A devoção pessoal e a entrega à vontade divina.",
            },
            {
              icon: <FaHeart size={48} />,
              title: "Amor Misericordioso",
              desc: "Símbolo da ternura e compaixão de Maria.",
            },
          ].map(({ icon, title, desc }, i) => (
            <motion.div
              key={i}
              className="p-4 rounded-xl bg-[#fef7f3] shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.2 }}
            >
              <div className="text-[#6b2e2e] mb-2">{icon}</div>
              <h3 className="font-semibold text-xl mb-1">{title}</h3>
              <p className="text-sm text-[#5a4a47]">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. Frase inspiradora */}
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center italic text-lg text-[#6b2e2e]"
        >
          &quot;Maria nos conduz ao Coração Misericordioso de Jesus, fonte de
          paz e esperança.&quot;
        </motion.blockquote>

        {/* 4. Chamado à ação */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-[#6b2e2e] mb-4">
            Venha conhecer o Recanto
          </h2>
          <p className="text-[#5a4a47] mb-6">
            Participe das atividades da comunidade e aprofunde sua
            espiritualidade.
          </p>
          <Link href="https://sejarecanto.com.br">
            <Button className="bg-[#d2b48c] hover:bg-[#bfa173] text-[#402f2c]">
              Acesse o site
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Rodapé */}
      <footer className="text-center py-6 text-sm text-[#806d68]">
        &copy; {new Date().getFullYear()} Comunidade Recanto do Amor
        Misericordioso. Todos os direitos reservados.
      </footer>
    </main>
  );
}
