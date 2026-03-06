'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

const steps = [
  {
    number: 1,
    icon: '📖',
    title: 'Read the excerpt',
    description: "You'll see a passage from Wikipedia. Read it carefully.",
  },
  {
    number: 2,
    icon: '🤔',
    title: 'Guess the connection',
    description: 'Choose which Wikipedia article it links to from the options.',
  },
  {
    number: 3,
    icon: '🔥',
    title: 'Build your streak',
    description: 'Correct answers multiply your score. Lock it in before you lose it!',
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="relative py-20 px-4 max-w-5xl mx-auto">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
          <span className="text-gradient-violet">How It Works</span>
        </h2>
        <p className="text-muted-gray text-lg max-w-lg mx-auto">
          Three simple steps. Infinite knowledge.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Connection lines (desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-[calc(33.33%+12px)] right-[calc(33.33%+12px)] h-0.5 bg-gradient-to-r from-neon-violet/40 via-neon-violet-light/30 to-electric-cyan/40 -translate-y-1/2 z-0" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            className="relative z-10"
          >
            <GlassCard className="text-center h-full relative overflow-hidden" hover>
              {/* Step number badge */}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-neon-violet/20 border border-neon-violet/30 flex items-center justify-center text-sm font-bold text-neon-violet-light">
                {step.number}
              </div>
              <div className="text-5xl mb-5 mt-2">{step.icon}</div>
              <h3 className="text-xl font-bold text-soft-white mb-3">{step.title}</h3>
              <p className="text-muted-gray text-sm leading-relaxed">{step.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
