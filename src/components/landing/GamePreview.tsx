'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

export function GamePreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
          <span className="text-gradient-violet">See It In Action</span>
        </h2>
        <p className="text-muted-gray text-lg">A sneak peek at the gameplay.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <GlassCard className="relative overflow-hidden">
          {/* Fake status bar */}
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-bold text-hot-coral-light">3</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">💰</span>
                <span className="text-sm font-bold text-gold-flash">337</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🎯</span>
                <span className="text-sm font-bold text-electric-cyan">3.37x</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-gray">
              <span>🎟️</span>
              <span className="font-medium">2 left</span>
            </div>
          </motion.div>

          {/* Fake Wikipedia excerpt */}
          <motion.div
            className="bg-card-bg rounded-xl p-5 mb-6 border border-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-neon-violet/20 text-neon-violet-light font-medium">
                Round 4 of 10
              </span>
            </div>
            <p className="text-soft-white/80 text-sm leading-relaxed">
              &ldquo;The structure was completed in 1889 and served as the entrance arch for the 1889
              World&apos;s Fair. Initially criticised by some of France&apos;s leading artists and intellectuals,
              it has become both a global cultural icon of{' '}
              <span className="text-neon-violet-light font-medium underline decoration-neon-violet/30 underline-offset-2">
                [???]
              </span>
              {' '}and one of the most recognisable structures in the world...&rdquo;
            </p>
          </motion.div>

          {/* Fake option cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.div
              className="glass rounded-xl p-4 border border-white/5 cursor-pointer transition-all hover:border-neon-violet/30"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm font-medium text-soft-white">🇫🇷 France</span>
              <p className="text-xs text-muted-gray mt-1">Country in Western Europe</p>
            </motion.div>
            <motion.div
              className="glass rounded-xl p-4 border border-electric-cyan/30 cursor-pointer glow-cyan"
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-electric-cyan">🗼 Eiffel Tower</span>
                <span className="text-xs text-electric-cyan">✓</span>
              </div>
              <p className="text-xs text-muted-gray mt-1">Iron lattice tower in Paris</p>
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}
