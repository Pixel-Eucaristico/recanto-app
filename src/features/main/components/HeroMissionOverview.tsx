'use client';

import { motion } from 'framer-motion';
import heroImage from '@/assets/img/hero-recanto.jpg';

const HeroMissionOverview = () => {
  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: `url(${heroImage.src})`,
      }}
    >
      <div className="hero-overlay bg-black/50" />

      <div className="hero-content text-neutral-content text-center">
        <motion.div
          className="max-w-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
        >
          <h1 className="mb-5 text-5xl font-bold">
            Recanto do Amor Misericordioso
          </h1>
          <p className="mb-5">
            Somos uma comunidade católica em Sumaré dedicada a &quot;vivenciar o
            Amor Misericordioso de Jesus Cristo&quot;, realizando retiros e
            encontros que avivam os corações e transformam histórias de vida.
            Nosso apostolado é voltado para crianças, jovens e famílias,
            promovendo educação integral e aperfeiçoamento das virtudes.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary text-primary-content"
          >
            Participe de um Retiro
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroMissionOverview;
