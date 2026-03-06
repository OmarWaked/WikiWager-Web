'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';

const rewards = [
  { friends: 1, reward: '+3 Bonus Guesses', icon: '🎟️' },
  { friends: 3, reward: 'Exclusive Avatar', icon: '👑' },
  { friends: 5, reward: '2x Daily Reward', icon: '💎' },
  { friends: 10, reward: 'VIP Badge', icon: '🏆' },
];

export function Referral() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText('https://wikiwager.app/ref/DEMO123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
          <span className="text-gradient-cyan">Invite Friends, Earn Rewards</span>
        </h2>
        <p className="text-muted-gray text-lg max-w-lg mx-auto">
          Share your link. When friends join, you both get bonus guesses and exclusive rewards.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <GlassCard>
          {/* Reward tiers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {rewards.map((tier, i) => (
              <motion.div
                key={tier.friends}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center p-3 rounded-xl bg-card-bg border border-white/5"
              >
                <div className="text-2xl mb-2">{tier.icon}</div>
                <div className="text-xs text-muted-gray mb-1">{tier.friends} friend{tier.friends > 1 ? 's' : ''}</div>
                <div className="text-xs font-semibold text-electric-cyan-light">{tier.reward}</div>
              </motion.div>
            ))}
          </div>

          {/* Referral link */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 bg-card-bg rounded-xl px-4 py-3 text-sm text-muted-gray font-mono border border-white/5 truncate">
              wikiwager.app/ref/DEMO123
            </div>
            <NeonButton
              variant="cyan"
              size="md"
              onClick={handleCopy}
              className="whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </NeonButton>
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}
