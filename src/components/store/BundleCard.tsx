'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { cn } from '@/lib/utils';

interface BundleCardProps {
  name: string;
  price: string;
  tag: string;
  guesses: number;
  shields: number;
  revenge: number;
  onBuy: () => void;
}

export function BundleCard({
  name,
  price,
  tag,
  guesses,
  shields,
  revenge,
  onBuy,
}: BundleCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      await onBuy();
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard
      className={cn(
        'flex flex-col items-center text-center gap-4 relative',
        'border border-gold-flash/20',
        'bg-gradient-to-b from-gold-flash/5 to-transparent',
      )}
    >
      {tag && (
        <span className="absolute -top-2.5 right-3 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-gold-flash/20 text-gold-flash border-gold-flash/30">
          {tag}
        </span>
      )}

      <div>
        <h3 className="text-xl font-bold text-soft-white">{name}</h3>
        <p className="text-2xl font-bold text-gold-flash mt-1">{price}</p>
      </div>

      <ul className="space-y-1.5 text-sm text-left w-full">
        {guesses > 0 && (
          <li className="flex items-center gap-2 text-soft-white">
            <span className="text-electric-cyan">&#10003;</span>
            <span>{guesses} Guesses</span>
          </li>
        )}
        {shields > 0 && (
          <li className="flex items-center gap-2 text-soft-white">
            <span className="text-electric-cyan">&#10003;</span>
            <span>{shields} Shields</span>
          </li>
        )}
        {revenge > 0 && (
          <li className="flex items-center gap-2 text-soft-white">
            <span className="text-electric-cyan">&#10003;</span>
            <span>{revenge} Revenge</span>
          </li>
        )}
      </ul>

      <GradientButton
        onClick={handleBuy}
        gradient="gold"
        size="md"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Buy Bundle'}
      </GradientButton>
    </GlassCard>
  );
}
