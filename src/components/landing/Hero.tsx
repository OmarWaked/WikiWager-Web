'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { NeonButton } from '@/components/ui/NeonButton';

const avatars = ['🧑‍💻', '👩‍🔬', '🧑‍🎨', '👨‍🚀', '👩‍🏫'];

export function Hero() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden">
      {/* Floating decorative blurs */}
      <motion.div
        className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-neon-violet/20 blur-[120px] pointer-events-none"
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-[10%] w-64 h-64 rounded-full bg-electric-cyan/15 blur-[100px] pointer-events-none"
        animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-neon-violet/10 blur-[150px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Brain emoji with pulsing glow rings */}
      <motion.div
        className="relative mb-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-neon-violet/40"
          style={{ margin: '-20px' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-electric-cyan/30"
          style={{ margin: '-40px' }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <span className="text-7xl md:text-8xl block" role="img" aria-label="brain">
          🧠
        </span>
      </motion.div>

      {/* Tagline */}
      <motion.h1
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-center leading-tight"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <span className="bg-gradient-to-r from-neon-violet via-neon-violet-light to-electric-cyan bg-clip-text text-transparent">
          Bet Your Brain
        </span>
      </motion.h1>

      <motion.p
        className="text-xl sm:text-2xl md:text-3xl font-semibold text-soft-white/90 mt-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        The Daily Wikipedia Game
      </motion.p>

      <motion.p
        className="text-base sm:text-lg text-muted-gray mt-3 text-center max-w-md"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
      >
        Think you know everything? Prove it.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Link href="/play">
          <NeonButton variant="violet" size="lg" className="min-w-[180px]">
            Play Now
          </NeonButton>
        </Link>
        <NeonButton
          variant="cyan"
          size="lg"
          className="min-w-[180px]"
          onClick={scrollToHowItWorks}
        >
          How It Works
        </NeonButton>
      </motion.div>

      {/* Social proof */}
      <motion.div
        className="flex items-center gap-3 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <div className="flex -space-x-2">
          {avatars.map((emoji, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-card-bg border-2 border-deep-void flex items-center justify-center text-sm"
            >
              {emoji}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-gray">
          Join <span className="text-neon-violet-light font-semibold">12,000+</span> players already wagering
        </p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-gray/30 flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-neon-violet-light"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
