'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

const features = [
  {
    icon: '📚',
    title: 'Real Wikipedia',
    description: 'Every question comes from actual Wikipedia articles. Learn something new every day.',
    gradient: 'from-neon-violet/20 to-neon-violet-light/10',
  },
  {
    icon: '⏰',
    title: 'Daily Reset',
    description: 'Fresh challenges every day. New seed, new questions. Never the same game twice.',
    gradient: 'from-electric-cyan/20 to-electric-cyan-light/10',
  },
  {
    icon: '🏆',
    title: 'Compete Globally',
    description: 'Real-time leaderboards. See how you rank worldwide against thousands of players.',
    gradient: 'from-gold-flash/20 to-gold-flash-light/10',
  },
  {
    icon: '🎁',
    title: 'Earn Rewards',
    description: 'Streaks, achievements, daily bonuses, and referral rewards keep you coming back.',
    gradient: 'from-hot-coral/20 to-hot-coral-light/10',
  },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 px-4 max-w-5xl mx-auto">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
          <span className="text-gradient-cyan">Why Players Love It</span>
        </h2>
        <p className="text-muted-gray text-lg max-w-lg mx-auto">
          More than trivia. A daily ritual.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.15 }}
          >
            <GlassCard hover className="h-full group transition-all duration-300 hover:-translate-y-1 hover:glow-violet">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-soft-white mb-2">{feature.title}</h3>
              <p className="text-muted-gray text-sm leading-relaxed">{feature.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
