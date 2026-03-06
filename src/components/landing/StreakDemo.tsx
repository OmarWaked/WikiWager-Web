'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

const streakLevels = [
  { streak: 0, multiplier: '1x', points: 100, color: 'text-muted-gray' },
  { streak: 1, multiplier: '1.5x', points: 150, color: 'text-neon-violet-light' },
  { streak: 2, multiplier: '2.25x', points: 225, color: 'text-neon-violet-light' },
  { streak: 3, multiplier: '3.37x', points: 337, color: 'text-electric-cyan' },
  { streak: 4, multiplier: '5.06x', points: 506, color: 'text-gold-flash' },
  { streak: 5, multiplier: '7.59x', points: 759, color: 'text-hot-coral-light' },
];

export function StreakDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % streakLevels.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isInView]);

  const progressPercent = ((activeIndex + 1) / streakLevels.length) * 100;

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
          <span className="text-gradient-gold">Streak Multiplier</span>
        </h2>
        <p className="text-muted-gray text-lg max-w-lg mx-auto">
          The longer your streak, the more you earn. But one wrong answer resets it all.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <GlassCard className="text-center">
          {/* Multiplier display */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-8 flex-wrap mb-8">
            {streakLevels.map((level, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <motion.div
                  className={`text-2xl sm:text-3xl md:text-4xl font-black transition-colors duration-300 ${
                    i <= activeIndex ? level.color : 'text-card-bg-light'
                  }`}
                  animate={
                    i === activeIndex
                      ? { scale: [1, 1.15, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.4 }}
                >
                  {level.multiplier}
                </motion.div>
                <div
                  className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                    i <= activeIndex ? 'text-soft-white/70' : 'text-card-bg-light'
                  }`}
                >
                  {level.points} pts
                </div>
              </motion.div>
            ))}
          </div>

          {/* Glowing progression bar */}
          <div className="w-full h-2 rounded-full bg-card-bg-light overflow-hidden mb-6">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neon-violet via-electric-cyan to-gold-flash"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                boxShadow: '0 0 12px rgba(124, 58, 237, 0.5), 0 0 24px rgba(6, 214, 160, 0.3)',
              }}
            />
          </div>

          {/* Current streak info */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-gray">
              Streak: <span className="text-neon-violet-light font-bold">{streakLevels[activeIndex].streak}</span>
            </span>
            <span className="text-muted-gray">
              Points: <span className="text-electric-cyan font-bold">{streakLevels[activeIndex].points}</span>
            </span>
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}
