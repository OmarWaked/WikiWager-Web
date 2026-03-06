'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

const reviews = [
  {
    text: 'This game literally ruined my sleep schedule 😂 Can\'t stop playing',
    stars: 5,
    author: 'Alex K.',
  },
  {
    text: 'Best trivia game since Wordle. The streak multiplier is genius.',
    stars: 5,
    author: 'Sarah M.',
  },
  {
    text: 'I learn something new every day. Way better than doomscrolling.',
    stars: 5,
    author: 'David L.',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-gold-flash text-lg">⭐</span>
      ))}
    </div>
  );
}

export function Reviews() {
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
          What Players Say
        </h2>
        <p className="text-muted-gray text-lg">Don&apos;t take our word for it.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, i) => (
          <motion.div
            key={review.author}
            initial={{ opacity: 0, y: 30, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 }}
            animate={isInView ? { opacity: 1, y: 0, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.15 }}
            whileHover={{ rotate: 0, scale: 1.03 }}
          >
            <GlassCard className="h-full flex flex-col" hover>
              <Stars count={review.stars} />
              <p className="text-soft-white/85 text-sm leading-relaxed flex-1 mb-4">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="text-muted-gray text-xs font-medium">
                &mdash; {review.author}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
