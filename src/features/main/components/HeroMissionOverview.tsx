'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroMission } from '@/types/main-content';
import heroImageDefault from '@/assets/img/hero-recanto.jpg';
import Link from 'next/link';

const HeroMissionOverview = () => {
  const [heroData, setHeroData] = useState<HeroMission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/main-content');
        if (response.ok) {
          const data = await response.json();
          setHeroData(data.heroMission);
        }
      } catch (error) {
        console.error('Failed to load hero data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Fallback data while loading or if API fails
  const title = heroData?.title || 'Recanto do Amor Misericordioso';
  const description = heroData?.description || 'Somos uma comunidade católica em Sumaré dedicada a "vivenciar o Amor Misericordioso de Jesus Cristo", realizando retiros e encontros que avivam os corações e transformam histórias de vida. Nosso apostolado é voltado para crianças, jovens e famílias, promovendo educação integral e aperfeiçoamento das virtudes.';
  const buttonText = heroData?.buttonText || 'Participe de um Retiro';
  const buttonLink = heroData?.buttonLink || '/sobre';
  const backgroundImage = heroData?.backgroundImage || heroImageDefault.src;

  // Convert relative path to full src if needed
  const bgImageUrl = backgroundImage.startsWith('http')
    ? backgroundImage
    : backgroundImage.startsWith('/assets') || backgroundImage.startsWith('/')
    ? backgroundImage
    : heroImageDefault.src;

  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
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
            {title}
          </h1>
          <p className="mb-5">
            {description}
          </p>
          <Link href={buttonLink}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary text-primary-content"
            >
              {buttonText}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroMissionOverview;
