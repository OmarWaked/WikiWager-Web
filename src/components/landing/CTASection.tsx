'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="relative glass rounded-3xl p-10 sm:p-16 text-center overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/10 via-transparent to-electric-cyan/5 animate-gradient pointer-events-none" />
        <motion.div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-neon-violet/15 blur-[80px] pointer-events-none"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-electric-cyan/10 blur-[60px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <div className="relative z-10">
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-neon-violet via-neon-violet-light to-electric-cyan bg-clip-text text-transparent">
              Ready to Wager?
            </span>
          </motion.h2>

          <motion.p
            className="text-muted-gray text-lg sm:text-xl mb-10 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            Your brain is worth more than you think.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link href="/play">
              <NeonButton variant="violet" size="lg" className="min-w-[220px] text-lg">
                Start Playing
              </NeonButton>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
