"use client";
import { motion } from "framer-motion";
import { FaBookBible } from "react-icons/fa6";
import Lottie from "lottie-react";
import prayerAnimation from "@/assets/animations/mudar.json";
import heartAnimation from "@/assets/animations/heart.json";
import lightAnimation from "@/assets/animations/reward-light-effect.json";
import Image from "next/image";

export default function SpiritualityAndCharismaPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full overflow-hidden">
      {/* Hero Section */}
      <section className="w-full h-screen bg-gradient-to-b from-accent to-base-100 flex flex-col items-center justify-center text-center px-6 relative">
        <Image
          src="https://cdn2.picryl.com/photo/1672/12/31/santa-teresa-doutora-mistica-inspirada-pelo-espirito-santo-c-1672-josefa-de-73ffbc-640.png"
          alt="Luz divina"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 opacity-20 z-0"
        />
        <div className="z-10">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-base-content drop-shadow"
          >
            Espiritualidade e Carisma
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-4 text-lg md:text-xl max-w-xl text-base-content drop-shadow"
          >
            &quot;Seja um Recanto para Deus, e Ele será um Recanto para
            ti.&quot;
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="relative w-48 h-48 mt-6 mx-auto"
          >
            {/* Lottie como fundo */}
            <Lottie
              animationData={lightAnimation}
              loop
              className="w-full h-full"
            />

            {/* Ícone sobreposto centralizado */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <FaBookBible className="text-4xl text-primary" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Espiritualidade */}
      <section className="w-full py-20 flex flex-col items-center text-center px-6">
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-primary"
        >
          Nossa Espiritualidade
        </motion.h2>
        <div className="mt-8 grid md:grid-cols-2 gap-10 items-center max-w-6xl">
          <div className="space-y-4 text-justify text-base-content">
            <p>
              A espiritualidade do{" "}
              <strong>Recanto do Amor Misericordioso</strong> é um mergulho
              profundo no mistério do Amor de Deus, vivido com fé, esperança e
              abandono filial. Os membros vivem intensamente a{" "}
              <em>vida sacramental</em>, a <em>oração diária</em>, a consagração
              total a Maria, o <em>amor à Palavra</em> e ao Magistério da
              Igreja.
            </p>
            <p>
              A oração do Terço, a <em>Adoração Eucarística</em>, a Lectio
              Divina e o jejum formam uma base sólida para a vida espiritual de
              cada membro. A comunhão fraterna fortalece a caminhada de fé e nos
              une como família espiritual.
            </p>
            <p>
              Vivemos tudo isso com alegria, simplicidade e reverência,
              reconhecendo que o Amor Misericordioso de Deus nos alcança todos
              os dias e nos envia a testemunhá-Lo.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="https://cdn2.picryl.com/photo/1672/12/31/santa-teresa-doutora-mistica-inspirada-pelo-espirito-santo-c-1672-josefa-de-73ffbc-640.png"
              alt="Espiritualidade católica"
              width={400}
              height={300}
              className="rounded-box shadow-xl"
            />
            <div className="w-40 h-40 mt-6">
              <Lottie animationData={prayerAnimation} loop />
            </div>
          </div>
        </div>
      </section>

      {/* Carisma */}
      <section className="w-full py-20 flex flex-col items-center text-center px-6">
        <motion.h2
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-secondary"
        >
          Nosso Carisma
        </motion.h2>
        <div className="mt-8 grid md:grid-cols-2 gap-10 items-center max-w-6xl">
          <div className="flex flex-col items-center order-2 md:order-1">
            <Image
              src="https://cdn2.picryl.com/photo/1672/12/31/santa-teresa-doutora-mistica-inspirada-pelo-espirito-santo-c-1672-josefa-de-73ffbc-640.png"
              alt="Carisma em ação"
              width={400}
              height={300}
              className="rounded-box shadow-xl"
            />
            <div className="w-40 h-40 mt-6">
              <Lottie animationData={heartAnimation} loop />
            </div>
          </div>
          <div className="space-y-4 text-justify text-base-content order-1 md:order-2">
            <p>
              Nosso carisma é viver e irradiar o{" "}
              <strong>Amor Misericordioso</strong> de Deus, acolhendo os que
              sofrem, escutando os corações feridos e promovendo a dignidade
              humana com gestos concretos. Somos chamados a ser &quot;recantos
              vivos&quot; do Céu na Terra.
            </p>
            <p>
              Seguimos os passos de santos como <em>Santa Faustina</em>,{" "}
              <em>São Padre Pio</em>, <em>Santa Teresinha</em> e{" "}
              <em>São Rafael Arcanjo</em>, que nos inspiram na confiança, na
              entrega, na obediência e no zelo pelas almas.
            </p>
            <p>
              Nosso serviço se concretiza em apostolados diversos: acolhimento
              de crianças e jovens, formação cristã, promoção da vida e ações
              missionárias. Tudo é vivido como resposta de amor Àquele que nos
              amou primeiro.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
