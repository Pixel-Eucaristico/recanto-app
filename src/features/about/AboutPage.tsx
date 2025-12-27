"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import compassionAnimation from "@/assets/animations/helping-the-needy.json";
import faithAnimation from "@/assets/animations/mudar.json";
import maryAnimation from "@/assets/animations/mary.json";
import {
  FaHandsHelping,
  FaPrayingHands,
  FaBook,
  FaHeart,
} from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full bg-base-200 text-base-content">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center text-center px-6 relative">
        <Image
          src="https://images.unsplash.com/photo-1555892727-55b51e5fceae?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Céu e Cruz"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 opacity-10 z-0"
        />
        <div className="z-10 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold text-primary"
          >
            Recanto do Amor Misericordioso
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-4 text-xl md:text-2xl text-secondary"
          >
            Um lar para almas em busca da Misericórdia de Deus.
          </motion.p>
        </div>
      </section>

      {/* Introdução */}
      <section className="w-full py-20 px-6 max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-lg md:text-xl"
        >
          Seja bem-vindo ao <strong>Recanto do Amor Misericordioso</strong>!
          Somos uma comunidade católica dedicada a viver e propagar o Amor e o
          Perdão de Deus, sendo um refúgio para todos que buscam descanso e cura
          espiritual.
        </motion.p>
      </section>

      {/* História e Fundação */}
      <section className="card w-full py-20 px-6 bg-base-100 text-base-content max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-primary mb-6"
        >
          Nossa História
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-justify">
            <p>
              Fundado em 2011 pelo carismático Padre Pio Angelotti, o Recanto do
              Amor Misericordioso nasceu de um profundo anseio de Deus em
              oferecer um espaço onde o amor e o perdão pudessem ser vivenciados
              plenamente.
            </p>
            <p>
              Desde então, temos caminhado na fé, buscando ser um &quot;Recanto
              para Deus&quot; e, por Ele, um &quot;Recanto do Amor
              Misericordioso&quot; para a humanidade.
            </p>
          </div>
          <Lottie animationData={faithAnimation} className="h-64" loop />
        </div>
      </section>

      {/* Carisma */}
      <section className="card w-full py-20 px-6 bg-base-100 max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-secondary mb-6"
        >
          Nosso Carisma: Amor e Perdão
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <Lottie
            animationData={compassionAnimation}
            className="h-64 order-2 md:order-1"
            loop
          />
          <div className="space-y-4 text-justify order-1 md:order-2">
            <p>
              Acreditamos que é próprio do Amor Misericordioso abaixar-se diante
              daqueles que mais necessitam, buscando a compaixão diante do
              sofrimento da humanidade.
            </p>
            <p>
              Nosso compromisso é com a cura profunda da alma, resgatando vidas
              e conduzindo-as à Vida Eterna através da Misericórdia de Deus.
            </p>
          </div>
        </div>
      </section>

      {/* Padroeira */}
      <section className="card w-full py-20 px-6 max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-primary mb-6"
        >
          Nossa Padroeira
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="text-justify space-y-4">
            <p>
              Sob o manto protetor de Nossa Senhora Mãe do Amor Misericordioso,
              caminhamos com serenidade e confiança.
            </p>
            <p>
              Seu olhar piedoso expressa a compaixão profunda por toda a
              humanidade, convidando-nos à contemplação e à confiança filial.
            </p>
          </div>
          <Lottie animationData={maryAnimation} className="h-64" loop />
        </div>
      </section>

      {/* Pilares */}
      <section className="card w-full py-20 px-6 bg-base-100 max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-secondary mb-6"
        >
          Nossos Pilares
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card bg-base-100 shadow-xl p-6 items-center text-center">
            <FaBook size={32} className="text-primary" />
            <h3 className="font-bold mt-2">Educação</h3>
            <p className="text-sm">
              Formação cristã integral de crianças e jovens.
            </p>
          </div>
          <div className="card bg-base-100 shadow-xl p-6 items-center text-center">
            <FaHeart size={32} className="text-secondary" />
            <h3 className="font-bold mt-2">Cura Interior</h3>
            <p className="text-sm">
              Acompanhamento espiritual e confiança em São Rafael Arcanjo.
            </p>
          </div>
          <div className="card bg-base-100 shadow-xl p-6 items-center text-center">
            <FaHandsHelping size={32} className="text-primary" />
            <h3 className="font-bold mt-2">Evangelização</h3>
            <p className="text-sm">
              Anúncio do Amor Misericordioso a todos os povos.
            </p>
          </div>
          <div className="card bg-base-100 shadow-xl p-6 items-center text-center">
            <FaPrayingHands size={32} className="text-secondary" />
            <h3 className="font-bold mt-2">Vida Comunitária</h3>
            <p className="text-sm">
              Vivência em oração, fraternidade e sacramentos.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-20 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-primary"
        >
          Quer caminhar conosco?
        </motion.h2>
        <p className="text-lg mt-4 mb-8">
          Junte-se à missão do Recanto. Ajude-nos a espalhar o Amor
          Misericordioso.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn btn-primary">Apoie nossa missão</button>
          <button className="btn btn-secondary">Entre em contato</button>
        </div>
      </section>
    </div>
  );
}
