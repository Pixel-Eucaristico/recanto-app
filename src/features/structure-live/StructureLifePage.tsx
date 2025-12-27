"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import {
  FaHandsHelping,
  FaPrayingHands,
  FaHeart,
  FaPeopleArrows,
  FaUserFriends,
  FaHandHoldingHeart,
} from "react-icons/fa";
import estruturaLottie from "@/assets/animations/network.json";

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="bg-base-100 rounded-box shadow-lg p-6 flex flex-col gap-4">
    <div className="flex items-center gap-2 text-primary">
      <Icon className="text-xl" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="text-base-content">{children}</div>
  </div>
);

export default function StructureLifePage() {
  return (
    <motion.div
      className="container mx-auto px-4 py-12 space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          Nosso Recanto: Amor, Compaixão e Serviço
        </h1>
        <p className="text-lg">
          Paz e Unção! Somos uma família em Cristo, impulsionados pelo Amor
          Misericordioso para formar e transformar vidas.
        </p>
        <div className="max-w-md mx-auto">
          <Lottie animationData={estruturaLottie} loop />
        </div>
        <blockquote className="text-secondary italic mt-6">
          “Não devias tu também ter compaixão do teu conservo, como eu tive
          compaixão de ti?” <br /> <span className="text-sm">Mateus 18:33</span>
        </blockquote>
      </div>

      <Section title="Nossa História" icon={FaPrayingHands}>
        Fundado em 2011 pelo Padre Pio Angelotti, o Recanto do Amor
        Misericordioso nasceu para ser um espaço de amor, perdão e cura
        interior.
      </Section>

      <Section title="Nosso Carisma" icon={FaHeart}>
        Vivemos o Amor e o Perdão. Imolamo-nos diante do sofrimento da
        humanidade por amor às almas. Nossa missão é curar e salvar.
      </Section>

      <Section title="Nossa Espiritualidade" icon={FaHandsHelping}>
        Caminhamos sob o olhar de Nossa Senhora Mãe do Amor Misericordioso,
        guiados por São Rafael Arcanjo e protegidos pelo nosso Anjo da Guarda.
      </Section>

      <Section title="Grupos da Comunidade" icon={FaPeopleArrows}>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Missionários:</strong> Vivem integralmente o carisma e a
            missão.
          </li>
          <li>
            <strong>Colaboradores:</strong> Servem com amor nos bastidores e nas
            frentes de missão.
          </li>
          <li>
            <strong>Recantianos:</strong> Jovens em formação para a vida e para
            Deus.
          </li>
          <li>
            <strong>Amigos da Comunidade:</strong> Participam espiritualmente da
            missão.
          </li>
          <li>
            <strong>Benfeitores:</strong> Sustentam com amor e fé nossa missão
            diária.
          </li>
        </ul>
      </Section>

      <Section title="Vivência Comunitária" icon={FaUserFriends}>
        Nossa vida é regida pela oração, pela partilha e pela comunhão fraterna.
        A Regra de Vida nos guia à santidade no dia a dia.
      </Section>

      <Section title="Momentos e Atividades" icon={FaHandHoldingHeart}>
        Realizamos encontros, formações e ações sociais. Tudo com o coração
        voltado à cura, salvação e evangelização das almas.
      </Section>

      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold text-primary mb-2">
          Sinta-se Convidado a Fazer Parte!
        </h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <a href="/doacoes" className="btn btn-primary">
            Apoie Nossa Missão
          </a>
          <a href="/contato" className="btn btn-outline">
            Entre em Contato
          </a>
        </div>
      </div>
    </motion.div>
  );
}
