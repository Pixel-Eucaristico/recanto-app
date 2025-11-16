'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface HeroMissionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
}

export default function HeroMission({
  title = 'Recanto do Amor Misericordioso',
  description = 'Somos uma comunidade católica em Sumaré dedicada a "vivenciar o Amor Misericordioso de Jesus Cristo", realizando retiros e encontros que avivam os corações e transformam histórias de vida.',
  buttonText = 'Participe de um Retiro',
  buttonLink = '/sobre',
  backgroundImage = 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200'
}: HeroMissionProps) {
  return (
    <div
      className="hero min-h-screen relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="hero-overlay bg-black/50" />

      <div className="hero-content text-neutral-content text-center z-10">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
        >
          <h1 className="mb-5 text-5xl font-bold text-white drop-shadow-lg">
            {title}
          </h1>
          <p className="mb-8 text-lg text-white/90 drop-shadow-md">
            {description}
          </p>
          <Link href={buttonLink}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary btn-lg text-white shadow-lg"
            >
              {buttonText}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
